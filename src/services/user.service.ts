import { updateUserType } from "~/type/user.type";
import { Op } from 'sequelize'
import { User } from '~/models/User'
import { Role } from '~/models/Role'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'


export class UserService {
  static async getUsers() {
    try {
      return await User.findAll({
        attributes: { exclude: ['password'] },
      });
    }
    catch (error) {
      throw new Error('Lỗi khi lấy danh sách người dùng');
    }
  }

  // Cập nhật thông tin người dùng 

  static async updateUser(body: updateUserType) {
    try {
      // Kiểm tra email hoặc số điện thoại đã tồn tại
      const user = await User.findOne({
        where: {
          [Op.or]: [{ email: body.email }, { phone: body.phone }]
        }
      })
      if (user) {
        await user.update({
          userName: body.userName,
          birthDate: body.birthDate,
          gender: body.gender,
          address: body.address,
        })
      }
      return {
        message: 'Cập nhật người dùng thành công',
        user: {
          userName: user?.dataValues.userName,
          birthDate: user?.dataValues.birthDate,
          gender: user?.dataValues.gender,
          address: user?.dataValues.address,
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
    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }
    await user.destroy();
    return { message: 'Người dùng đã được xóa thành công' };
  }

}
