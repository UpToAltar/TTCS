import { Op } from 'sequelize'
import { Booking } from '~/models/Booking'
import { User } from '~/models/User'
import { TimeSlot } from '~/models/TimeSlot'
import { Doctor } from '~/models/Doctor'
import { v4 as uuidv4 } from 'uuid'
import { validateAuthorization } from '~/utils/validateAuthorization'
import moment from 'moment'
import { MedicalAppointment } from '~/models/MedicalAppointment'
import { createAppointmentType, UpdateAppointmentType } from '~/type/appointment.type'

export class AppointmentService {
  static async addAppointment(body: createAppointmentType, user: any) {
    const findBooking = await Booking.findOne({
      where: {
        id: body.bookingId,
        status: true
      }
    })
    if (!findBooking)
      throw new Error('Lịch hẹn không tồn tại hoặc chưa được xác nhận')
    const timeSlot = await TimeSlot.findOne({
      where: { id: findBooking?.dataValues.timeSlotId }
    })
    if (!timeSlot) throw new Error('Không tìm thấy giờ hẹn');
    const findDoctor = await Doctor.findOne({
      where: { id: timeSlot?.dataValues.doctorId }
    })

    if (!findDoctor) throw new Error('Bác sĩ không tồn tại')
    //Check quyền
    if (!validateAuthorization(user, findDoctor?.dataValues.userId)) {
      throw new Error('Bạn không có quyền')
    }
    //Check có lịch hẹn
    const findAppointment = await MedicalAppointment.findOne({
      where: {
        bookingId: body.bookingId,
      }
    })
    if (findAppointment) throw new Error('Lịch hẹn đã tồn tại')
    const appointment = await MedicalAppointment.create({
      bookingId: body.bookingId,
      medicalRecordId: null,
      date: new Date,
      status: 'Chờ khám'
    })
    return appointment
      ? {
        id: appointment?.dataValues.id,
        bookingId: appointment?.dataValues.bookingId,
        status: appointment?.dataValues.status,
        date: moment(appointment?.dataValues.date).format('DD/MM/YYYY')
      }
      : null
  }
  static async getAllAppointments(page: number, limit: number, sort: string, order: string, user: any) {
    try {
      //Check quyền
      let findDoctor = null
      if (user.role == 'Doctor') {
        findDoctor = await Doctor.findOne({ where: { userId: user.id } })
        if (!findDoctor) throw new Error('Bác sĩ không tồn tại')
      }

      const offset = (page - 1) * limit
      const whereCondition = findDoctor ? { doctorId: findDoctor?.dataValues.id } : {}

      const { rows, count } = await MedicalAppointment.findAndCountAll({
        include: [
          {
            model: Booking,
            include: [
              {
                model: TimeSlot,
                where: whereCondition
              }
            ]
          }
        ],
        order: [[sort, order]],
        limit,
        offset
      })

      return {
        total: count,
        appointment: rows.map((appointment) => {
          return {
            id: appointment?.dataValues.id,
            bookingId: appointment?.dataValues.bookingId,
            status: appointment?.dataValues.status,
            date: moment(appointment?.dataValues.date).format('DD/MM/YYYY')
          }
        })
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
  static async getAppointmentById(id: string) {
    const appointment = await MedicalAppointment.findByPk(id)
    if (!appointment) throw new Error('Lịch hẹn không tồn tại')

    return appointment
      ? {
        id: appointment?.dataValues.id,
        bookingId: appointment?.dataValues.bookingId,
        status: appointment?.dataValues.status,
        date: moment(appointment?.dataValues.date).format('DD/MM/YYYY')
      }
      : null
  }
  static async updateAppointment(id: string, body: UpdateAppointmentType, user: any) {
    const appointment = await MedicalAppointment.findByPk(id)
    if (!appointment) throw new Error('Lịch hẹn không tồn tại')

    const findBooking = await Booking.findOne({
      where: {
        id: appointment?.dataValues.bookingId,
        status: true
      }
    })
    if (!findBooking)
      throw new Error('Lịch hẹn không tồn tại hoặc chưa được xác nhận')
    const timeSlot = await TimeSlot.findOne({
      where: { id: findBooking?.dataValues.timeSlotId }
    })
    if (!timeSlot) throw new Error('Không tìm thấy giờ hẹn');
    const findDoctor = await Doctor.findOne({
      where: { id: timeSlot?.dataValues.doctorId }
    })

    if (!findDoctor) throw new Error('Bác sĩ không tồn tại')
    //Check quyền
    if (!validateAuthorization(user, findDoctor?.dataValues.userId)) {
      throw new Error('Bạn không có quyền')
    }

    const updatedAppointment = await appointment.update({
      status: body.status,
      date: new Date()
    })

    return appointment
      ? {
        id: appointment?.dataValues.id,
        bookingId: appointment?.dataValues.bookingId,
        status: appointment?.dataValues.status,
        date: moment(appointment?.dataValues.date).format('DD/MM/YYYY')
      }
      : null
  }

  static async deleteAppointment(id: string, user: any) {
    const appointment = await MedicalAppointment.findByPk(id)
    if (!appointment) throw new Error('Lịch hẹn không tồn tại')

    const findBooking = await Booking.findOne({
      where: {
        id: appointment?.dataValues.bookingId,
        status: true
      }
    })
    if (!findBooking)
      throw new Error('Lịch hẹn không tồn tại hoặc chưa được xác nhận')
    const timeSlot = await TimeSlot.findOne({
      where: { id: findBooking?.dataValues.timeSlotId }
    })
    if (!timeSlot) throw new Error('Không tìm thấy giờ hẹn');
    const findDoctor = await Doctor.findOne({
      where: { id: timeSlot?.dataValues.doctorId }
    })

    if (!findDoctor) throw new Error('Bác sĩ không tồn tại')
    //Check quyền
    if (!validateAuthorization(user, findDoctor?.dataValues.userId)) {
      throw new Error('Bạn không có quyền')
    }

    await appointment.destroy()
    return true
  }
}