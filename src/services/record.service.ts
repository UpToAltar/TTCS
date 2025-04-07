import { Specialty } from '../models/Specialty'
import { CreateRecordType, UpdateRecordType } from '~/type/record.type'
import moment from 'moment'
import { Op } from 'sequelize'
import { validateAuthorization } from '~/utils/validateAuthorization'
import { Doctor } from '~/models/Doctor'
import { MedicalRecord } from '~/models/MedicalRecord'

export class RecordService {
  static async createRecord(body: CreateRecordType, user: any) {
    const findDoctor = await Doctor.findOne({ where: { id: body.doctorId } })
    if (!findDoctor) throw new Error('Bác sĩ không tồn tại')
    //Check quyền
    if (!validateAuthorization(user, findDoctor?.dataValues.userId)) {
      throw new Error('Bạn không có quyền')
    }
    const record = await MedicalRecord.create({
      doctorId: body.doctorId,
      diagnosis: body.diagnosis,
      prescription: body.prescription,
      notes: body.notes
    })
    return record
      ? {
          id: record?.dataValues.id,
          doctorId: record?.dataValues.doctorId,
          diagnosis: record?.dataValues.diagnosis,
          prescription: record?.dataValues.prescription,
          notes: record?.dataValues.notes,
          createdAt: moment().format('DD/MM/YYYY HH:mm:ss')
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
      console.log('whereCondition', whereCondition)

      const { rows, count } = await MedicalRecord.findAndCountAll({
        where: whereCondition,
        order: [[sort, order]],
        limit,
        offset
      })

      return {
        total: count,
        record: rows.map((record) => {
          return {
            id: record?.dataValues.id,
            doctorId: record?.dataValues.doctorId,
            diagnosis: record?.dataValues.diagnosis,
            prescription: record?.dataValues.prescription,
            notes: record?.dataValues.notes,
            createdAt: moment(record?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss')
          }
        })
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
          createdAt: moment(record?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss')
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
          createdAt: moment(updatedRecord?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss')
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

    await record.destroy()
    return true
  }
}
