import { RegisterType } from "~/type/auth.type";
import { Op } from 'sequelize'
import { User } from '~/models/User'
import { Role } from '~/models/Role'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'


export class UserService {
  static async getAllUsers(userId?: string) {
    try {
      if (!userId || userId === 'ALL') {
        // Lấy tất cả người dùng, loại bỏ trường password
        return await User.findAll({
          attributes: { exclude: ['password'] },
        });
      }

      // Lấy thông tin một người dùng theo ID
      const user = await User.findOne({
        where: { id: userId },
        attributes: { exclude: ['password'] },
      });

      return user || null;
    } catch (error) {
      throw new Error('Lỗi khi lấy danh sách người dùng');
    }
  }

  static async createNewUser(data: { userName: string; email: string; phone: string; password: string; birthDate?: Date; gender?: boolean; address?: string; roleId?: string; status?: boolean }) {
    try {
      // Kiểm tra email đã tồn tại chưa
      const existingUser = await User.findOne({ where: { email: data.email } });
      if (existingUser) {
        throw new Error('Email đã được sử dụng, vui lòng thử email khác!');
      }

      // Mã hóa mật khẩu
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(data.password, salt)
      // Tạo người dùng mới
      const newUser = await User.create({
        userName: data.userName,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        birthDate: data.birthDate,
        gender: data.gender,
        address: data.address,
        roleId: data.roleId,
        status: data.status ?? true, // Mặc định active nếu không truyền
      });
      return newUser; // Trả về user mới tạo
    } catch (error) {
      throw new Error('Lỗi khi tạo người dùng: ');
    }
  }

  // Cập nhật thông tin người dùng 

  static async updateUser(
    userId: string,
    data: { userName?: string; email?: string; phone?: string; birthDate?: Date; gender?: boolean; address?: string; roleId?: string; status?: boolean }
  ) {
    try {
      if (!userId) {
        throw new Error('Thiếu thông tin người dùng');
      }

      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('Người dùng không tồn tại');
      }

      await user.update({
        userName: data.userName ?? user.userName,
        email: data.email ?? user.email,
        phone: data.phone ?? user.phone,
        birthDate: data.birthDate ?? user.birthDate,
        gender: data.gender ?? user.gender,
        address: data.address ?? user.address,
        roleId: data.roleId ?? user.roleId,
        status: data.status ?? user.status
      });

      return { message: 'Cập nhật người dùng thành công', user };
    } catch (error) {
      throw new Error('Lỗi khi cập nhật người dùng');
    }
  }


  // Xóa người dùng 
  static async deleteUser(userId: string) {
    const user = await User.findOne({
      where: { id: userId }
    })
    if (!user) {
      throw new Error('Người dùng không tồn tại')
    }
    await user.destroy()
    return { message: 'Người dùng đã được xóa thành công' }
  }
}
