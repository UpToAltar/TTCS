import { Op } from 'sequelize'
import { Booking } from '~/models/Booking'
import { User } from '~/models/User'
import { TimeSlot } from '~/models/TimeSlot'
import { generateToken } from '~/utils/token'
import { sendVerificationBookingEmail, sendVerificationCancelBookingEmail } from '~/utils/mail'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { createBookingType } from '~/type/booking.type'
import moment from 'moment'
import { MedicalAppointment } from '~/models/MedicalAppointment'
import { Service } from '~/models/Service'

export class BookingService {
  static async createBooking(body: createBookingType, patientId: string) {
    try {
      const user = await User.findOne({ where: { id: patientId } })
      if (!user) {
        throw new Error('Không tìm thấy người dùng')
      }
      const slot = await TimeSlot.findOne({ where: { id: body.timeSlotId } })
      if (!slot) {
        throw new Error('Không tìm thấy khung giờ')
      }
      const service = await Service.findOne({ where: { id: body.serviceId } })
      if (!service) {
        throw new Error('Không tìm thấy dịch vụ')
      }
      if (!slot?.dataValues.status) throw new Error('Đã có người đặt lịch ở khung giờ này')
      //Tạo lịch hẹn mới
      const newBooking = await Booking.create({
        id: uuidv4(),
        patientId: patientId,
        timeSlotId: body.timeSlotId,
        serviceId: body.serviceId,
        status: false // Đang chờ xác nhận
      })
      // Gửi email xác nhận
      const verificationToken = generateToken({ bookingId: newBooking?.dataValues.id })
      await sendVerificationBookingEmail(user?.dataValues.email, verificationToken)
      return {
        booking: {
          id: newBooking?.dataValues.id,
          patientId: newBooking?.dataValues.patientId,
          timeSlotId: newBooking?.dataValues.timeSlotId,
          serviceId: newBooking?.dataValues.serviceId,
          status: newBooking?.dataValues.status
        },
        message: 'Đặt lịch thành công.Vui lòng xác nhận lịch hẹn qua email'
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
  static async verifyBookingEmail(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwtSecret') as { bookingId: string }
      console.log(decoded.bookingId)
      const booking = await Booking.findByPk(decoded.bookingId)

      if (!booking) {
        throw new Error('Lịch không tồn tại hoặc đã bị xoá')
      }
      console.log(booking?.dataValues.status)
      if (booking?.dataValues.status == 1) {
        throw new Error('Lịch hẹn đã được hẹn vui lòng chọn lịch khác')
      }

      // Cập nhật trạng thái tài khoản
      await booking.update({ status: true })

      // Xoá hoặc huỷ các booking khác cùng khung giờ chưa xác nhận
      await Booking.destroy({
        where: {
          timeSlotId: booking?.dataValues.timeSlotId,
          status: false,
          id: { [Op.ne]: booking?.dataValues.id } // khác với lịch đã xác nhận
        }
      })

      // Cập nhật lại trạng thái của timeSlot
      await TimeSlot.update({ status: false }, { where: { id: booking?.dataValues.timeSlotId } })

      // Tạo appointment
      await MedicalAppointment.create({
        id: uuidv4(),
        bookingId: booking?.dataValues.id,
        date: new Date(),
        medicalRecordId: null,
        status: 'Chờ khám'
      })

      return true
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async cancelBooking(bookingId: string, patientId: string) {
    try {
      const booking = await Booking.findOne({
        where: {
          id: bookingId,
          patientId: patientId
        }
      })
      if (!booking) {
        throw new Error('Không tìm thấy lịch hẹn hoặc bạn không có quyền huỷ')
      }

      // Lấy thông tin người dùng để gửi mail
      const user = await User.findOne({ where: { id: patientId } })

      // Lưu timeSlotId để dùng sau khi xoá
      const timeSlotId = booking?.dataValues.timeSlotId
      // Gửi mail
      const verificationToken = generateToken({ bookingId: booking?.dataValues.id })
      await sendVerificationCancelBookingEmail(user?.dataValues.email, verificationToken)
      return {
        message: 'Xác nhận xóa lịch hẹn qua email'
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
  static async verifyCancelBEmail(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwtSecret') as { id: string }
      const booking = await Booking.findByPk(decoded.id)

      if (!booking) {
        throw new Error('Không tìm thấy lịch hẹn hoặc bạn không có quyền huỷ')
      }

      // Xóa lịch hẹn
      await Booking.destroy({ where: { id: booking?.dataValues.id } })

      // Mở lại khung giờ đã bị hủy
      await TimeSlot.update({ status: true }, { where: { id: booking?.dataValues.timeSlotId } })

      return {
        message: 'Hủy lịch hẹn thành công.'
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
  static async getAllBooking(page: number, limit: number, sort: string, order: string, user: any) {
    try {
      const offset = (page - 1) * limit

      const whereCondition: any = {
        status: true
      }

      // Nếu là bệnh nhân thì chỉ lấy lịch của chính họ
      if (user.role === 'User') {
        whereCondition.patientId = user.id
      }

      const { rows, count } = await Booking.findAndCountAll({
        where: whereCondition,
        order: [[sort, order]],
        limit,
        offset,
        include: [
          {
            model: User,
            as: 'patient',
            attributes: ['userName', 'email', 'phone', 'id'],
          },
          {
            model: TimeSlot,
            as: 'timeSlot',
            attributes: ['startDate', 'endDate', 'status', 'id'],
          },
          {
            model: Service,
            as: 'service',
            attributes: ['name', 'price', 'id'],
          }
        ]
      })

      console.log('rows', rows);

      return {
        total: count,
        bookings: rows.map((booking) => ({
          id: booking?.dataValues.id,
          patientId: booking?.dataValues.patientId,
          timeSlotId: booking?.dataValues.timeSlotId,
          serviceId: booking?.dataValues.serviceId,
          status: booking?.dataValues.status,
          createdAt: moment(booking?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss'),
          patient: {
            id: booking?.dataValues.patient?.dataValues.id,
            userName: booking?.dataValues.patient?.dataValues.userName,
            email: booking?.dataValues.patient?.dataValues.email,
            phone: booking?.dataValues.patient?.dataValues.phone
          },
          timeSlot: {
            id: booking?.dataValues.timeSlot?.dataValues.id,
            startDate: moment(booking?.dataValues.timeSlot?.dataValues.startDate).format('DD/MM/YYYY HH:mm:ss'),
            endDate: moment(booking?.dataValues.timeSlot?.dataValues.endDate).format('DD/MM/YYYY HH:mm:ss'),
            status: booking?.dataValues.timeSlot?.dataValues.status
          },
          service: {
            id: booking?.dataValues.service?.dataValues.id,
            name: booking?.dataValues.service?.dataValues.name,
            price: booking?.dataValues.service?.dataValues.price
          }
        }))
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
  static async getBookingById(id: string) {
    try {
      const booking = await Booking.findOne({
        where: {
          id,
          status: true // Chỉ lấy lịch đã xác nhận
        },
        include: [
          {
            model: User,
            as: 'patient',
            attributes: ['userName', 'email', 'phone', 'id']
          },
          {
            model: TimeSlot,
            as: 'timeSlot',
            attributes: ['startDate', 'endDate', 'status', 'id']
          },
          {
            model: Service,
            as: 'service',
            attributes: ['name', 'price', 'id']
          }
        ]
      })

      if (!booking) throw new Error('Lịch hẹn không tồn tại hoặc chưa được xác nhận')

      return {
        id: booking?.dataValues.id,
        patientId: booking?.dataValues.patientId,
        timeSlotId: booking?.dataValues.timeSlotId,
        serviceId: booking?.dataValues.serviceId,
        status: booking?.dataValues.status,
        createdAt: moment(booking?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss'),
        patient: {
          id: booking?.dataValues.patient?.dataValues.id,
          userName: booking?.dataValues.patient?.dataValues.userName,
          email: booking?.dataValues.patient?.dataValues.email,
          phone: booking?.dataValues.patient?.dataValues.phone
        },
        timeSlot: {
          id: booking?.dataValues.timeSlot?.dataValues.id,
          startDate: moment(booking?.dataValues.timeSlot?.dataValues.startDate).format('DD/MM/YYYY HH:mm:ss'),
          endDate: moment(booking?.dataValues.timeSlot?.dataValues.endDate).format('DD/MM/YYYY HH:mm:ss'),
          status: booking?.dataValues.timeSlot?.dataValues.status
        },
        service: {
          id: booking?.dataValues.service?.dataValues.id,
          name: booking?.dataValues.service?.dataValues.name,
          price: booking?.dataValues.service?.dataValues.price
        }
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}
