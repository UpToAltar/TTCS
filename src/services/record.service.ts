import { Specialty } from '../models/Specialty'
import { CreateRecordType, UpdateRecordType } from '~/type/record.type'
import moment from 'moment'
import { Op } from 'sequelize'
import { validateAuthorization } from '~/utils/validateAuthorization'
import { Doctor } from '~/models/Doctor'
import { MedicalRecord } from '~/models/MedicalRecord'
import { MedicalAppointment } from '~/models/MedicalAppointment'
import { User } from '~/models/User'
import { Booking } from '~/models/Booking'
import { TimeSlot } from '~/models/TimeSlot'

export class RecordService {
  static async createRecord(body: CreateRecordType, user: any) {
    
    //Check appointment tồn tại và chưa có hồ sơ bệnh án
    const findAppointment = await MedicalAppointment.findOne({
      where: {
        id: body.medicalAppointmentId,
        medicalRecordId: null
      },
      include: [
        {
          model: Booking,
          include: [
            {
              model: TimeSlot,
              include: [
                {
                  model: Doctor,
                }
              ]
            }
          ]
        }
      ]
    })
    if (!findAppointment) throw new Error('Lịch hẹn không tồn tại')
    const userId = findAppointment?.dataValues.booking?.dataValues.timeSlot?.dataValues.doctor?.dataValues.userId
    //Check quyền
    if (!validateAuthorization(user, userId)) {
      throw new Error('Bạn không có quyền')
    }
    const record = await MedicalRecord.create({
      doctorId: findAppointment?.dataValues.booking?.dataValues.timeSlot?.dataValues.doctor?.dataValues.id,
      diagnosis: body.diagnosis,
      prescription: body.prescription,
      notes: body.notes
    })
    //Update appointment
    await findAppointment.update({
      medicalRecordId: record?.dataValues.id,
      status: 'Đã khám xong'
    })
    return record
      ? {
        id: record?.dataValues.id,
        doctorId: record?.dataValues.doctorId,
        diagnosis: record?.dataValues.diagnosis,
        prescription: record?.dataValues.prescription,
        notes: record?.dataValues.notes,
        createdAt: moment(record?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss'),
        updatedAt: moment(record?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss'),
      }
      : null
  }

  static async getAllRecords(page: number, limit: number, sort: string, order: string, user: any) {
    try {
      //Check quyền
      let findDoctor = null
      if (user.role == 'Doctor') {
        findDoctor = await Doctor.findOne({ where: { userId: user.id } })
        if (!findDoctor) throw new Error('Bác sĩ không tồn tại')
      }

      const offset = (page - 1) * limit
      const whereCondition = findDoctor ? { doctorId: findDoctor?.dataValues.id } : {}

      const { rows, count } = await MedicalRecord.findAndCountAll({
        where: whereCondition,
        order: [[sort, order]],
        limit,
        offset,
        include: [
          {
            model: Doctor,
            include: [
              { model: Specialty, attributes: ['name'] },
              { model: User, attributes: ['userName'] }
            ]
          }
        ]
      })

      const recordsWithAppointment = await Promise.all(rows.map(async (record) => {
        // Tìm appointment theo medicalRecordId
        const appointment = await MedicalAppointment.findOne({
          where: { medicalRecordId: record?.dataValues.id }
        })

        return {
          id: record?.dataValues.id,
          doctorId: record?.dataValues.doctorId,
          diagnosis: record?.dataValues.diagnosis,
          prescription: record?.dataValues.prescription,
          notes: record?.dataValues.notes,
          createdAt: moment(record?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss'),
          updatedAt: moment(record?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss'),
          doctor: {
            id: record?.dataValues.doctor?.dataValues.id,
            userName: record?.dataValues.doctor?.dataValues.user?.dataValues.userName || null,
            specialtyName: record?.dataValues.doctor?.dataValues.specialty?.dataValues.name || null
          },
          appointment: appointment
            ? { id: appointment?.dataValues.id, code: appointment?.dataValues.code }
            : null
        }
      }))

      return {
        total: count,
        record: recordsWithAppointment
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async getRecordById(id: string) {
    const record = await MedicalRecord.findByPk(id)
    if (!record) throw new Error('Hồ sơ bệnh án không tồn tại')

    return record
      ? {
        id: record?.dataValues.id,
        doctorId: record?.dataValues.doctorId,
        diagnosis: record?.dataValues.diagnosis,
        prescription: record?.dataValues.prescription,
        notes: record?.dataValues.notes,
        createdAt: moment(record?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss'),
        updatedAt: moment(record?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss')
      }
      : null
  }

  static async updateRecord(id: string, body: UpdateRecordType, user: any) {
    const record = await MedicalRecord.findByPk(id)
    if (!record) throw new Error('Hồ sơ bệnh án không tồn tại')

    const findDoctor = await Doctor.findOne({ where: { id: record?.dataValues.doctorId } })
    if (!findDoctor) throw new Error('Bác sĩ không tồn tại')

    //Check quyền
    if (!validateAuthorization(user, findDoctor?.dataValues.userId)) {
      throw new Error('Bạn không có quyền')
    }

    const updatedRecord = await record.update({
      diagnosis: body.diagnosis,
      prescription: body.prescription,
      notes: body.notes
    })

    return updatedRecord
      ? {
        id: updatedRecord?.dataValues.id,
        doctorId: updatedRecord?.dataValues.doctorId,
        diagnosis: updatedRecord?.dataValues.diagnosis,
        prescription: updatedRecord?.dataValues.prescription,
        notes: updatedRecord?.dataValues.notes,
        createdAt: moment(updatedRecord?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss'),
        updatedAt: moment(updatedRecord?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss')
      }
      : null
  }

  static async deleteRecord(id: string, user: any) {
    const record = await MedicalRecord.findByPk(id)
    if (!record) throw new Error('Hồ sơ bệnh án không tồn tại')

    const findDoctor = await Doctor.findOne({ where: { id: record?.dataValues.doctorId } })
    if (!findDoctor) throw new Error('Bác sĩ không tồn tại')

    //Check quyền
    if (!validateAuthorization(user, findDoctor?.dataValues.userId)) {
      throw new Error('Bạn không có quyền')
    }
    //Tìm appointment
    const findAppointment = await MedicalAppointment.findOne({ where: { medicalRecordId: id } })
    if (findAppointment) {
      await findAppointment.update({
        medicalRecordId: null,
        status: 'Chờ khám'
      })
    }

    await record.destroy()
    return true
  }
}
