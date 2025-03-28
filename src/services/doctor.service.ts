import { } from "~/type/user.type";
import { Op } from 'sequelize'
import { User } from '~/models/User'
import { Role } from '~/models/Role'
import { Doctor } from "~/models/Doctor";
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid'

export class DoctorService {
    static async getDoctor(page: number, limit: number, search: string, sort: string, order: string) {
        try {
            const offset = (page - 1) * limit;

            // Điều kiện tìm kiếm theo userName, email, phone
            const userWhereCondition: any = {
                status: true, // Chỉ lấy người dùng có status = true
            };

            if (search) {
                userWhereCondition[Op.or] = [
                    { userName: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } },
                    { phone: { [Op.like]: `%${search}%` } }
                ];
            }

            // Tìm và đếm số lượng doctor
            const { rows, count } = await Doctor.findAndCountAll({
                include: [
                    {
                        model: User,
                        as: 'user',
                        where: userWhereCondition,
                        attributes: ['id', 'userName', 'email', 'phone', 'gender', 'address', 'createdAt', 'updatedAt'],
                        include: [
                            {
                                model: Role,
                                as: 'role',
                                attributes: ['name'],
                            }
                        ]
                    },
                ],
                order: [[sort, order]],
                limit,
                offset
            });

            // Trả về kết quả
            return {
                total: count,
                doctors: rows.map((doctor) => ({
                    id: doctor?.dataValues.id,
                    userName: doctor?.user?.dataValues.userName,
                    email: doctor?.user?.dataValues.email,
                    phone: doctor?.user?.dataValues.phone,
                    gender: doctor?.user?.dataValues.gender,
                    address: doctor?.user?.dataValues.address,
                    roleName: doctor?.user?.role?.dataValues.name, // Lấy tên role từ bảng Role
                    specialtyId: doctor?.dataValues.specialtyId || null,//lúc nào có bảng special thì sửa
                    degree: doctor?.dataValues.degree || null,
                    description: doctor?.dataValues.description || null,
                }))
            };
        } catch (error: any) {
            throw new Error(error.message || 'Lỗi khi lấy danh sách người dùng');
        }
    }
    // static async editDoctor()
}