
import { createNewUserType, updateUserByAdminType, updateUserBySelfType } from "~/type/user.type";
import { Op } from 'sequelize'
import { User } from '~/models/User'
import { Role } from '~/models/Role'
import { Doctor } from "~/models/Doctor";
import moment from 'moment';
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'



export class UserService {
  static async getUsers(page: number, limit: number, search: string, sort: string, order: string) {
    try {
      const offset = (page - 1) * limit

      // Điều kiện tìm kiếm theo userName, email, phone
      const whereCondition: any = {

        status: true, // Chỉ lấy người dùng có status = true

      }

      if (search) {
        whereCondition[Op.or] = [
          { userName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } }
        ]
      }

      // Tìm và đếm số lượng user
      const { rows, count } = await User.findAndCountAll({

        where: whereCondition,
        include: [
          {
            model: Role,
            as: 'role',
            where: { name: 'User' }, // Lọc chỉ lấy role = "User"
            attributes: ['name']
          }
        ],
        order: [[sort, order]],
        limit,
        offset
      })

      // Trả về kết quả
      return {
        total: count,
        users: rows.map((user) => ({
          id: user?.dataValues.id,
          userName: user?.dataValues.userName,
          email: user?.dataValues.email,
          phone: user?.dataValues.phone,
          gender: user?.dataValues.gender,
          address: user?.dataValues.address,
          roleName: user?.role?.dataValues.name, // Lấy tên role từ bảng Role
        }))
      }
    } catch (error: any) {
      throw new Error(error.message || 'Lỗi khi lấy danh sách người dùng')
    }
  }
  static async getUserById(id: string) {
    try {
      // Tìm người dùng theo ID
      const user = await User.findByPk(id);
      if (!user) {
        return null; // Trả về null nếu không tìm thấy user
      }

      // Tìm vai trò của người dùng
      const role = await Role.findOne({
        where: { id: user.roleId }
      });

      if (!role) {
        throw new Error(`Không tìm thấy vai trò cho user có ID: ${id}`);
      }
      return user
        ? {
          id: user?.dataValues.id,
          userName: user?.dataValues.userName,
          email: user?.dataValues.email,
          birthDate: user?.dataValues.birthDate,
          gender: user?.dataValues.gender,
          address: user?.dataValues.address
        }
        : null
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
  static async creatUserbyAdmin(body: createNewUserType) {
    try {

      const existingUser = await User.findOne({

        where: {
          [Op.or]: [{ email: body.email }, { phone: body.phone }]
        }
      })

      if (existingUser) {
        throw new Error('Email hoặc số điện thoại đã tồn tại')
      }
      const role = await Role.findOne({
        where: { name: body.rolename }
      })
      console.log('Role:', role);
      console.log('Role ID:', role?.dataValues.id);
      // Băm mật khẩu
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(body.phone, salt) //Mặc định password = phone 
      // Format birthDate từ dd-mm-yyyy sang yyyy-mm-dd
      const formattedBirthDate = body.birthDate
        ? moment(body.birthDate, 'DD-MM-YYYY').format('YYYY-MM-DD')
        : null;
      if (!role) {
        throw new Error(`Không tìm thấy vai trò`);
      }

      const user = await User.create({
        id: uuidv4(),
        userName: body.userName,
        email: body.email,
        phone: body.phone,
        password: hashedPassword,
        birthDate: formattedBirthDate,
        gender: body.gender,
        address: body.address,
        roleID: role?.dataValues.id,
        status: true // tài khoản đã được kích hoạt 
      })
      // Nếu user có vai trò là "doctor", tạo thêm bản ghi trong bảng Doctor
      if (body.rolename === 'Doctor') {
        await Doctor.create({
          id: uuidv4(),
          userId: user.id, // Liên kết với user vừa tạo
          specialtyId: '',
          degree: '',
          description: ''
        });
      }
      return {
        message: 'Thêm mới người dùng thành công',
        user: {
          phone: user?.dataValues.phone,
          email: user?.dataValues.email,
          userName: user?.dataValues.userName,
          birthDate: user?.dataValues.birthDate
            ? moment(user?.dataValues.birthDate).format('DD-MM-YYYY') // Hiển thị lại dd-mm-yyyy
            : null,
          gender: user?.dataValues.gender,
          address: user?.dataValues.address,
          roleName: body.rolename
        }
      };
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
  // Cập nhật thông tin người dùng 

  static async updateUserBySelf(userId: string, body: updateUserBySelfType) {
    try {
      const formattedBirthDate = body.birthDate
        ? moment(body.birthDate, 'DD-MM-YYYY').format('YYYY-MM-DD')
        : null;
      // Kiểm tra email hoặc số điện thoại đã tồn tại
      const user = await User.findByPk(userId)
      if (user) {
        await user.update({
          userName: body.userName,
          birthDate: formattedBirthDate,
          gender: body.gender,
          address: body.address,
        })
      }
      return {
        message: 'Cập nhật người dùng thành công',
        user: {
          userName: user?.dataValues.userName,
          birthDate: user?.dataValues.birthDate
            ? moment(user?.dataValues.birthDate).format('DD-MM-YYYY') // Hiển thị lại dd-mm-yyyy
            : null,
          gender: user?.dataValues.gender,
          address: user?.dataValues.address,
        }
      };
    } catch (error) {
      throw new Error('Lỗi khi cập nhật người dùng');
    }
  }
  static async updateUserByAdmin(id: string, body: updateUserByAdminType) {
    try {
      // Kiểm tra Số điện thoại đã tồn tại
      const user = await User.findByPk(id)
      if (!user) {
        throw new Error('Người dùng không tồn tại')
      }
      // Kiểm tra xem có người dùng nào khác có cùng số điện thoại hoặc email không
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { phone: body.phone },
            { email: body.email }
          ],
          id: { [Op.ne]: user.id } // Loại trừ chính người dùng đang cập nhật
        }
      })
      if (existingUser) {
        throw new Error('Số điện thoại hoặc email đã được sử dụng bởi người dùng khác');
      }
      // Tìm roleId từ bảng Role theo rolename
      const role = await Role.findOne({
        where: { name: body.rolename }
      })
      if (!role) {
        throw new Error(`Không tìm thấy vai trò: ${body.rolename}`);
      }

      // Format birthDate từ dd-mm-yyyy sang yyyy-mm-dd
      const formattedBirthDate = body.birthDate
        ? moment(body.birthDate, 'DD-MM-YYYY').format('YYYY-MM-DD')
        : null;

      if (user) {
        await user.update({
          phone: body.phone,
          email: body.email,
          userName: body.userName,
          birthDate: formattedBirthDate,
          gender: body.gender,
          address: body.address,
          roleId: role.id,
        })
      }
      return {
        phone: user?.dataValues.phone,
        email: user?.dataValues.email,
        userName: user?.dataValues.userName,
        birthDate: user?.dataValues.birthDate
          ? moment(user?.dataValues.birthDate).format('DD-MM-YYYY') // Hiển thị lại dd-mm-yyyy
          : null,
        gender: user?.dataValues.gender,
        address: user?.dataValues.address,
        roleName: user?.role?.dataValues.name,
      };
    } catch (error) {
      throw new Error('Lỗi khi cập nhật người dùng')
    }
  }

  // Xóa người dùng
  static async deleteUser(id: string) {
    const user = await User.findByPk(id)
    if (!user) {
      throw new Error('Người dùng không tồn tại')
    }
    await user.destroy()
    return { message: 'Người dùng đã được xóa thành công' }
  }
}
