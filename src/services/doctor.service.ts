import { EditDoctorType } from "~/type/doctor.type";
import { Op } from 'sequelize'
import { User } from '~/models/User'
import { Role } from '~/models/Role'
import { Doctor } from "~/models/Doctor";
import moment from 'moment';
import { Specialty } from "~/models/Specialty";

export class DoctorService {
    static async getAllDoctor(page: number, limit: number, search: string, sort: string, order: string) {
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
                    { phone: { [Op.like]: `%${search}%` } },
                    { degree: { [Op.like]: `%${search}%` } },
                    { specialty: { [Op.like]: `%${search}%` } }
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
                                model: Specialty,
                                as: 'specialty',
                                attributes: ['name'],
                            }
                        ],
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
                    specialty: doctor?.specialty?.dataValues.name || null,
                    degree: doctor?.dataValues.degree || null,
                    description: doctor?.dataValues.description || null,
                }))
            };
        } catch (error: any) {
            throw new Error(error.message || 'Lỗi khi lấy danh sách người dùng');
        }
    }

    static async getDoctorById(id: string) {
        try {
            const doctor = await Doctor.findOne({
                where: { id: id },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'userName', 'email', 'birthDate', 'gender', 'address'],
                        include: [
                            {
                                model: Specialty,
                                as: 'specialty',
                                attributes: ['name']
                            }
                        ]
                    },
                ]
            });

            if (!doctor) return null;

            return {
                id: doctor.id,
                userName: doctor?.user?.dataValues?.userName,
                email: doctor?.user?.dataValues?.email || null,
                birthDate: doctor?.user?.dataValues?.birthDate,
                gender: doctor?.user?.dataValues?.gender,
                address: doctor?.user?.dataValues?.address,
                namespecial: doctor?.specialty?.dataValues?.name,
                degree: doctor?.dataValues?.degree,
                description: doctor.description
            }
        } catch (error: any) {
            throw new Error(error.message || 'Lỗi khi lấy thông tin bác sĩ');
        }
    }
    static async updateDoctorbyAdmin(id: string, body: EditDoctorType) {
        try {
            const doctor = await Doctor.findByPk(id)

            if (!doctor)
                throw new Error('Bác sĩ không tồn tại')
            const specialty = await Specialty.findOne({
                where: { name: body.namespecial }
            });
            if (!specialty) {
                throw new Error('Chuyên khoa không tồn tại');
            }
            await doctor.update({
                degree: body.degree,
                description: body.description,
                specialtyId: specialty.id,
            });
            const updatedDoctor = await Doctor.findOne({
                where: { id: doctor.id },
                include: [
                    {
                        model: Specialty,
                        as: 'specialty',
                        attributes: ['name']
                    }
                ]
            });
            return {
                id: updatedDoctor?.id,
            degree: updatedDoctor?.degree,
            description: updatedDoctor?.description,
            namespecial: updatedDoctor?.specialty?.name 
            };
        }
        catch (error) {
            throw new Error('Lỗi khi cập nhật người dùng')
        }

    }
    static async updateDoctorBySelf(userId: string, body: EditDoctorType) {
        try {
            const doctor = await Doctor.findByPk(userId)
            const specialty = await Specialty.findOne({
                where: { name: body.namespecial }
            })
            if (doctor) {
                await doctor.update({
                    degree: body.degree,
                    description: body.description,
                    specialtyId: specialty?.id,
                })
            }
            return {
                message: 'Cập nhật  thành công',
                doctor: {
                    degree: doctor?.dataValues.degree,
                    description: doctor?.dataValues.description,
                    namespecial: body.namespecial,
                }
            }
        }
        catch (error) {
            throw new Error('Lỗi khi cập nhật người dùng');
        }
    }
    // Xóa bác sĩ
    static async deleteDoctor(id: string) {
        const user = await User.findByPk(id)
        if (!user) {
            throw new Error('Người dùng không tồn tại')
        }
        // Kiểm tra xem người dùng có phải là bác sĩ hay không
        const doctor = await Doctor.findOne({ where: { doctorId: id } })
        if (doctor) {
            await doctor.destroy() // Xóa bản ghi bác sĩ trước
        }

        await user.destroy()
        return { message: 'Người dùng và thông tin bác sĩ đã được xóa thành công' }
    }
}