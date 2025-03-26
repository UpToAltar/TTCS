import { updateUserByAdminType, updateUserBySelfType } from "~/type/user.type";
import { Op } from 'sequelize'
import { User } from '~/models/User'
import { Role } from '~/models/Role'
import moment from 'moment';
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'


export class UserService {
  static async getUsers(page: number, limit: number, search: string, sort: string, order: string) {
    try {
      const offset = (page - 1) * limit;

      // Điều kiện tìm kiếm theo userName, email, phone
      const whereCondition: any = {
        status: true, // Chỉ lấy người dùng có status = true
      };

      if (search) {
        whereCondition[Op.or] = [
          { userName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } }
        ];
      }

      // Tìm và đếm số lượng user
      const { rows, count } = await User.findAndCountAll({
        attributes: { exclude: ['password', 'resetPasswordOTP', 'resetPasswordExpires', 'roleId'] },
        where: whereCondition,
        include: [{
          model: Role,
          as: 'role',
          where: { name: 'User' }, // Lọc chỉ lấy role = "User"
          attributes: ['name']
        }],
        order: [[sort, order]],
        limit,
        offset
      });

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
          createdAt: moment(user?.dataValues.createdAt).format('DD-MM-YYYY HH:mm:ss'),
          updatedAt: moment(user?.dataValues.updatedAt).format('DD-MM-YYYY HH:mm:ss')
        }))
      };
    } catch (error: any) {
      throw new Error(error.message || 'Lỗi khi lấy danh sách người dùng');
    }
  }

  static async getDoctors() {
    try {
      const users = await User.findAll({
        attributes: {
          exclude: ['password', 'resetPasswordOTP', 'resetPasswordExpires', 'roleId']
        },
        where: {
          status: true // Chỉ lấy người dùng có status = true
        },
        include: [{
          model: Role,
          as: 'role',
          where: { name: 'Doctor' }, // Lọc chỉ lấy role = "User"
          attributes: ['name']
        }]
      });
      return users.map(user => ({
        ...user.toJSON(),
        createdAt: moment(user.createdAt).format('DD-MM-YYYY HH:mm:ss'),
        updatedAt: moment(user.updatedAt).format('DD-MM-YYYY HH:mm:ss')
      }));
    }
    catch (error) {
      throw new Error('Lỗi khi lấy danh sách người dùng');
    }
  }
  // Cập nhật thông tin người dùng 

  static async updateUserBySelf(body: updateUserBySelfType) {
    try {
      const formattedBirthDate = body.birthDate
        ? moment(body.birthDate, 'DD-MM-YYYY').format('YYYY-MM-DD')
        : null;
      // Kiểm tra email hoặc số điện thoại đã tồn tại
      const user = await User.findOne({
        where: {
          [Op.or]: [{ email: body.email }, { phone: body.phone }]
        }
      })
      console.log(user);
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
  static async updateUserByAdmin(body: updateUserByAdminType) {
    try {
      // Tìm roleId từ bảng Role theo rolename
      const role = await Role.findOne({
        where: { name: body.rolename }
      });

      if (!role) {
        throw new Error(`Không tìm thấy vai trò: ${body.rolename}`);
      }

      // Format birthDate từ dd-mm-yyyy sang yyyy-mm-dd
      const formattedBirthDate = body.birthDate
        ? moment(body.birthDate, 'DD-MM-YYYY').format('YYYY-MM-DD')
        : null;

      // Kiểm tra email hoặc số điện thoại đã tồn tại
      const user = await User.findOne({
        where: {
          [Op.or]: [{ email: body.email }, { phone: body.phone }]
        }
      });
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
        message: 'Cập nhật người dùng thành công',
        user: {
          phone: user?.dataValues.phone,
          email: user?.dataValues.email,
          userName: user?.dataValues.userName,
          birthDate: user?.dataValues.birthDate
            ? moment(user?.dataValues.birthDate).format('DD-MM-YYYY') // Hiển thị lại dd-mm-yyyy
            : null,
          gender: user?.dataValues.gender,
          address: user?.dataValues.address,
          roleName: body.rolename,
        }
      };
    } catch (error) {
      throw new Error('Lỗi khi cập nhật người dùng');
    }
  }

  // Xóa người dùng 
  static async deleteUser(phone: string) {
    const user = await User.findOne({
      where: { phone }
    })
    console.log(user)
    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }
    await user.destroy();
    return { message: 'Người dùng đã được xóa thành công' };
  }

}
