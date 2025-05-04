import { Op } from 'sequelize'
import { Booking } from '~/models/Booking'
import { User } from '~/models/User'
import { TimeSlot } from '~/models/TimeSlot'
import { Notification } from '~/models/Notification'
import { Doctor } from '~/models/Doctor'
import { generateToken } from '~/utils/token'
import { sendVerificationBookingEmail, sendVerificationCancelBookingEmail } from '~/utils/mail'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { createBookingType } from '~/type/booking.type'
import moment from 'moment'
import { MedicalAppointment } from '~/models/MedicalAppointment'
import { Service } from '~/models/Service'
import { AppointmentService } from './appointment.service'

export class BookingService {
  private static async generateBookingCode(): Promise<string> {
    // Find the latest booking code
    const latestBooking = await Booking.findOne({
      where: {
        code: {
          [Op.like]: 'BK%'
        }
      },
      order: [['code', 'DESC']]
    })

    let nextNumber = 1
    if (latestBooking?.dataValues.code) {
      // Extract the number part and increment
      const currentNumber = parseInt(latestBooking.dataValues.code.substring(2))
      nextNumber = currentNumber + 1
    }

    // Format the new code with leading zeros
    return `BK${String(nextNumber).padStart(5, '0')}`
  }

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

      // Generate new booking code
      const bookingCode = await BookingService.generateBookingCode()

      //Tạo lịch hẹn mới
      const newBooking = await Booking.create({
        id: uuidv4(),
        code: bookingCode,
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
          code: newBooking?.dataValues.code,
          patientId: newBooking?.dataValues.patientId,
          timeSlotId: newBooking?.dataValues.timeSlotId,
          serviceId: newBooking?.dataValues.serviceId,
          status: newBooking?.dataValues.status,
          createdAt: moment(newBooking?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss'),
          updatedAt: moment(newBooking?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss'),
        },
        message: 'Đặt lịch thành công.Vui lòng xác nhận lịch hẹn qua email'
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async createBookingByAdmin(body: createBookingType, patientId: string) {
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

      // Generate new booking code
      const bookingCode = await BookingService.generateBookingCode()
      
      //Tạo lịch hẹn mới
      const newBooking = await Booking.create({
        id: uuidv4(),
        code: bookingCode,
        patientId: patientId,
        timeSlotId: body.timeSlotId,
        serviceId: body.serviceId,
        status: false // Đang chờ xác nhận
      })

      const verificationToken = generateToken({ bookingId: newBooking?.dataValues.id })
      
      return await BookingService.verifyBookingEmail(verificationToken)
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

      const appointmentCode = await AppointmentService.generateAppointmentCode()
      // Tạo appointment
      await MedicalAppointment.create({
        id: uuidv4(),
        code: appointmentCode,
        bookingId: booking?.dataValues.id,
        date: new Date(),
        medicalRecordId: null,
        status: 'Chờ khám'
      })
      const timeSlot = await TimeSlot.findByPk(booking?.dataValues.timeSlotId)
      const doctorId = timeSlot?.dataValues.doctorId
      if (doctorId) {
        const doctor = await Doctor.findByPk(doctorId)
        const UserId = doctor?.dataValues.userId

        const formattedDate = moment(timeSlot?.dataValues.startDate).format('DD/MM/YYYY')
        const formattedStartTime = moment(timeSlot?.dataValues.startDate).format('HH:mm:ss')
        const formattedEndTime = moment(timeSlot?.dataValues.endDate).format('HH:mm:ss')
        await Notification.create({
          id: uuidv4(),
          title: 'Lịch hẹn',
          content: `Bạn có một lịch hẹn vào ngày ${formattedDate} từ ${formattedStartTime} đến ${formattedEndTime}.`,
          userId: UserId,
        })
      }
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
      console.log(booking)
      if (!booking) {
        throw new Error('Không tìm thấy lịch hẹn hoặc bạn không có quyền huỷ')
      }

      // Lấy thông tin người dùng để gửi mail
      const user = await User.findOne({ where: { id: patientId } })

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
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwtSecret') as { bookingId: string }
      const booking = await Booking.findByPk(decoded.bookingId)

      if (!booking) {
        throw new Error('Không tìm thấy lịch hẹn hoặc bạn không có quyền huỷ')
      }

      // Kiểm tra xem appointment nếu trạng thái Chờ khám thì mới được hủy
      const appointment = await MedicalAppointment.findOne({
        where: {
          bookingId: booking?.dataValues.id,
          status: 'Chờ khám'
        }
      })
      if (!appointment) {
        throw new Error('Không thể hủy lịch hẹn do đã khám hoặc đã xuất hóa đơn')
      }

      // Cập nhật trạng thái của appointment
      await appointment.update({ status: 'Đã hủy' })

      // Update trạng thái lịch hẹn
      await Booking.update({ status: false }, { where: { id: booking?.dataValues.id } })

      // Mở lại khung giờ đã bị hủy
      await TimeSlot.update({ status: true }, { where: { id: booking?.dataValues.timeSlotId } })

      const timeSlot = await TimeSlot.findByPk(booking?.dataValues.timeSlotId)
      const doctorId = timeSlot?.dataValues.doctorId
      if (doctorId) {
        const doctor = await Doctor.findByPk(doctorId)
        const UserId = doctor?.dataValues.userId

        const formattedDate = moment(timeSlot?.dataValues.startDate).format('DD/MM/YYYY')
        const formattedStartTime = moment(timeSlot?.dataValues.startDate).format('HH:mm:ss')
        const formattedEndTime = moment(timeSlot?.dataValues.endDate).format('HH:mm:ss')
        await Notification.create({
          id: uuidv4(),
          title: 'Hủy lịch hẹn',
          content: `Bạn có một lịch hẹn bị hủy vào ngày ${formattedDate} từ ${formattedStartTime} đến ${formattedEndTime}.`,
          userId: UserId,
        })
      }
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
      }

      // Nếu là bệnh nhân thì chỉ lấy lịch của chính họ
      if (user.role == 'User') {
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
            include: [
              {
                model: Doctor,
                include: [
                  {
                    model: User,
                    attributes: ['userName', 'email', 'phone', 'id']
                  }
                ]
              }
            ]
          },
          {
            model: Service,
            as: 'service',
            attributes: ['name', 'price', 'id'],
          }
        ]
      })

      return {
        total: count,
        bookings: rows.map((booking) => ({
          id: booking?.dataValues.id,
          code: booking?.dataValues.code,
          patientId: booking?.dataValues.patientId,
          timeSlotId: booking?.dataValues.timeSlotId,
          serviceId: booking?.dataValues.serviceId,
          status: booking?.dataValues.status,
          createdAt: moment(booking?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss'),
          updatedAt: moment(booking?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss'),
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
            status: booking?.dataValues.timeSlot?.dataValues.status,
            doctor: booking?.dataValues.timeSlot?.dataValues.doctor ? {
              id: booking?.dataValues.timeSlot?.dataValues.doctor?.dataValues.id,
              userName: booking?.dataValues.timeSlot?.dataValues.doctor?.dataValues.user?.dataValues.userName,
              email: booking?.dataValues.timeSlot?.dataValues.doctor?.dataValues.user?.dataValues.email,
              phone: booking?.dataValues.timeSlot?.dataValues.doctor?.dataValues.user?.dataValues.phone
            } : null
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
        code: booking?.dataValues.code,
        patientId: booking?.dataValues.patientId,
        timeSlotId: booking?.dataValues.timeSlotId,
        serviceId: booking?.dataValues.serviceId,
        status: booking?.dataValues.status,
        createdAt: moment(booking?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss'),
        updatedAt: moment(booking?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss'),
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

  static async updateStatusBooking(bookingId: string, status: boolean) {
    try {
      const booking = await Booking.findByPk(bookingId)
      if (!booking) throw new Error('Lịch hẹn không tồn tại')
      if(status == true && booking?.dataValues.status == false) {
        const token = generateToken({ bookingId: booking?.dataValues.id })
        return await BookingService.verifyBookingEmail(token)
      }
      if(status == false && booking?.dataValues.status == true) {
        console.log('huy lich hen')
        const token = generateToken({ bookingId: booking?.dataValues.id })
        return await BookingService.verifyCancelBEmail(token)
      }
      return { message: 'Cập nhật trạng thái lịch hẹn thành công' }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}
