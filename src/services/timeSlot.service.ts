import { Service } from '~/models/Service'
import { Op } from 'sequelize'
import { addTimeSlotType } from '~/type/timeSlot.type'
import moment from 'moment'
import { TimeSlot } from '~/models/TimeSlot'
import { Doctor } from '~/models/Doctor'
import { validateAuthorization } from '~/utils/validateAuthorization'
import { User } from '~/models/User'
import { Specialty } from '~/models/Specialty'

export class TimeSlotService {
  static async addTimeSlot(body: addTimeSlotType, user: any) {
    try {
      //Check bác sĩ có tồn tại không
      const doctor = await Doctor.findOne({
        where: {
          id: body.doctorId
        }
      })
      if (!doctor) {
        throw new Error('Bác sĩ không tồn tại')
      }
      //Check quyền
      if (!validateAuthorization(user, doctor?.dataValues.userId)) {
        throw new Error('Bạn không có quyền')
      }
      //Format lại thời gian
      const startTime = moment(body.startDate, 'DD/MM/YYYY HH:mm:ss').toDate()
      const endTime = moment(body.endDate, 'DD/MM/YYYY HH:mm:ss').toDate()
      //So sánh thời gian
      if (startTime >= endTime) {
        throw new Error('Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc')
      }
      //Check thời gian khám phải trong 1 ngày
      const startDate = moment(startTime).startOf('day')
      const endDate = moment(endTime).endOf('day')
      if (!startDate.isSame(endDate, 'day')) {
        throw new Error('Thời gian khám phải trong 1 ngày')
      }
      //Check khoảng thời gian đã tồn tại
      const existingTimeSlot = await TimeSlot.findOne({
        where: {
          doctorId: body.doctorId,
          startDate: { [Op.lte]: endTime },
          endDate: { [Op.gte]: startTime }
        }
      })
      if (existingTimeSlot) {
        throw new Error('Thời gian đã tồn tại')
      }

      //Tạo mới thời gian
      const newTimeSlot = await TimeSlot.create({
        doctorId: body.doctorId,
        startDate: startTime,
        endDate: endTime,
        status: body.status
      })
      return {
        id: newTimeSlot?.dataValues.id,
        doctorId: newTimeSlot?.dataValues.doctorId,
        startDate: moment(newTimeSlot?.dataValues.startDate).format('DD/MM/YYYY HH:mm:ss'),
        endDate: moment(newTimeSlot?.dataValues.endDate).format('DD/MM/YYYY HH:mm:ss'),
        status: newTimeSlot?.dataValues.status,
        createdAt: moment(newTimeSlot?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss'),
        updatedAt: moment(newTimeSlot?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss')
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async updateTimeSlot(id: string, body: addTimeSlotType, user: any) {
    try {
      //Check bác sĩ có tồn tại không
      const doctor = await Doctor.findOne({
        where: {
          id: body.doctorId
        }
      })
      if (!doctor) {
        throw new Error('Bác sĩ không tồn tại')
      }
      //Check quyền
      if (!validateAuthorization(user, doctor?.dataValues.userId)) {
        throw new Error('Bạn không có quyền')
      }
      //Format lại thời gian
      const startTime = moment(body.startDate, 'DD/MM/YYYY HH:mm:ss').toDate()
      const endTime = moment(body.endDate, 'DD/MM/YYYY HH:mm:ss').toDate()
      //So sánh thời gian
      if (startTime >= endTime) {
        throw new Error('Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc')
      }
      //Check thời gian khám phải trong 1 ngày
      const startDate = moment(startTime).startOf('day')
      const endDate = moment(endTime).endOf('day')
      if (!startDate.isSame(endDate, 'day')) {
        throw new Error('Thời gian khám phải trong 1 ngày')
      }
      //Check khoảng thời gian đã tồn tại
      const existingTimeSlot = await TimeSlot.findOne({
        where: {
          doctorId: body.doctorId,
          startDate: { [Op.lte]: endTime },
          endDate: { [Op.gte]: startTime },
          id: { [Op.ne]: id }
        }
      })
      if (existingTimeSlot) {
        throw new Error('Thời gian đã tồn tại')
      }

      //Update thời gian
      const updatedTimeSlot = await TimeSlot.update(
        {
          doctorId: body.doctorId,
          startDate: startTime,
          endDate: endTime,
          status: body.status
        },
        {
          where: {
            id
          }
        }
      )
      if (updatedTimeSlot[0] === 0) {
        throw new Error('Cập nhật thời gian khám không thành công')
      }
      const result = await TimeSlot.findOne({
        where: {
          id
        }
      })
      return {
        id: result?.dataValues.id,
        doctorId: result?.dataValues.doctorId,
        startDate: moment(result?.dataValues.startDate).format('DD/MM/YYYY HH:mm:ss'),
        endDate: moment(result?.dataValues.endDate).format('DD/MM/YYYY HH:mm:ss'),
        status: result?.dataValues.status,
        createdAt: moment(result?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss'),
        updatedAt: moment(result?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss')
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async deleteTimeSlot(id: string, user: any) {
    try {
      const timeSlot = await TimeSlot.findOne({
        where: {
          id
        }
      })

      if (!timeSlot) {
        throw new Error('Thời gian khám không tồn tại')
      }
      //Check bác sĩ có tồn tại không
      const doctor = await Doctor.findOne({
        where: {
          id: timeSlot?.dataValues.doctorId
        }
      })
      //Check quyền
      if (!validateAuthorization(user, doctor?.dataValues.userId)) {
        throw new Error('Bạn không có quyền')
      }
      await TimeSlot.destroy({
        where: {
          id
        }
      })
      return { message: 'Xóa thời gian khám thành công' }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async getTimeSlotById(id: string) {
    try {
      const timeSlot = await TimeSlot.findOne({
        where: {
          id
        }
      })
      return timeSlot
        ? {
            id: timeSlot?.dataValues.id,
            doctorId: timeSlot?.dataValues.doctorId,
            startDate: moment(timeSlot?.dataValues.startDate).format('DD/MM/YYYY HH:mm:ss'),
            endDate: moment(timeSlot?.dataValues.endDate).format('DD/MM/YYYY HH:mm:ss'),
            status: timeSlot?.dataValues.status,
            createdAt: moment(timeSlot?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss'),
            updatedAt: moment(timeSlot?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss')
          }
        : null
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async getAllTimeSlotOfDoctorByDay(doctorId: string, date: string, user: any) {
    try {
      //Check bác sĩ có tồn tại không
      const doctor = await Doctor.findOne({
        where: {
          id: doctorId
        },
        include: [
          {
            model: Specialty,
            as: 'specialty'
          }
        ]
      })
      if (!doctor) {
        throw new Error('Bác sĩ không tồn tại')
      }
      //Check định dạng ngày tháng
      if (!moment(date, 'DD/MM/YYYY', true).isValid()) {
        throw new Error('Ngày tháng không hợp lệ')
      }
      //Format lại thời gian
      //Lấy thời gian bắt đầu và kết thúc trong ngày
      const startDate = moment(date, 'DD/MM/YYYY').startOf('day').toDate()
      const endDate = moment(date, 'DD/MM/YYYY').endOf('day').toDate()
      const timeSlots = await TimeSlot.findAll({
        where: {
          doctorId,
          startDate: { [Op.gte]: startDate },
          endDate: { [Op.lte]: endDate }
        }
      })
      //Săp xếp thời gian theo thứ tự tăng dần
      timeSlots.sort((a, b) => {
        const timeA = new Date(a.dataValues.startDate).getTime()
        const timeB = new Date(b.dataValues.startDate).getTime()
        return timeA - timeB
      })

      // Tìm user của bác sĩ
      const doctorUser = await User.findOne({
        where: {
          id: doctor?.dataValues.userId
        }
      })
      if (!doctorUser) {
        throw new Error('Bác sĩ không tồn tại')
      }

      //Format lại thời gian
      return timeSlots.map((timeSlot) => ({
        id: timeSlot?.dataValues.id,
        doctorId: timeSlot?.dataValues.doctorId,
        startDate: moment(timeSlot?.dataValues.startDate).format('DD/MM/YYYY HH:mm:ss'),
        endDate: moment(timeSlot?.dataValues.endDate).format('DD/MM/YYYY HH:mm:ss'),
        status: timeSlot?.dataValues.status,
        createdAt: moment(timeSlot?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss'),
        updatedAt: moment(timeSlot?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss'),
        userName: doctorUser?.dataValues.userName || null,
        specialtyName: doctor?.dataValues.specialty?.dataValues.name || null
      }))
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  //Thêm mặc định thời gian khám cho bác sĩ (30 phút mỗi ca , 14 ca/ngày bắt đầu từ 8h sáng đến 6h chiều, nghỉ trưa từ 12h đến 13h)
  static async addDefaultTimeSlot(doctorId: string, user: any) {
    try {
      //Check bác sĩ có tồn tại không
      const doctor = await Doctor.findOne({
        where: {
          id: doctorId
        }
      })
      if (!doctor) {
        throw new Error('Bác sĩ không tồn tại')
      }
      //Check quyền
      if (!validateAuthorization(user, doctor?.dataValues.userId)) {
        throw new Error('Bạn không có quyền')
      }

      //Check ngày hôm nay đã có thời gian khám chưa
      const startDate = moment().startOf('day').toDate()
      const endDate = moment().endOf('day').toDate()
      const existingTimeSlot = await TimeSlot.findOne({
        where: {
          doctorId,
          startDate: { [Op.gte]: startDate },
          endDate: { [Op.lte]: endDate }
        }
      })
      if (existingTimeSlot) {
        throw new Error('Ngày hôm nay đã có thời gian khám')
      }
      //Tạo mới thời gian
      const timeSlots = []
      let currentTime = moment().startOf('day').hour(8) // Bắt đầu từ 08:00
      let createdSlots = 0

      while (createdSlots < 14) {
        const startTime = currentTime.clone()
        const endTime = currentTime.clone().add(30, 'minutes')

        // Check nếu đang trong khoảng nghỉ trưa (12:00 - 13:30)
        if (
          startTime.isSameOrAfter(moment().startOf('day').hour(12)) &&
          startTime.isBefore(moment().startOf('day').hour(13).add(30, 'minutes'))
        ) {
          currentTime = moment().startOf('day').hour(13).add(30, 'minutes')
          continue
        }

        timeSlots.push({
          doctorId,
          startDate: startTime.toDate(),
          endDate: endTime.toDate(),
          status: true
        })

        // Sau mỗi ca: tiến thêm 40 phút (30 phút ca khám + 10 phút nghỉ)
        currentTime.add(40, 'minutes')
        createdSlots++
      }

      await TimeSlot.bulkCreate(timeSlots)
      return {
        message: 'Thêm thời gian khám thành công',
        data: timeSlots.map((timeSlot) => ({
          doctorId: timeSlot.doctorId,
          startDate: moment(timeSlot.startDate).format('DD/MM/YYYY HH:mm:ss'),
          endDate: moment(timeSlot.endDate).format('DD/MM/YYYY HH:mm:ss'),
          status: timeSlot.status
        }))
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async getDoctorScheduleDates(doctorId: string) {
    try {
      // Check if doctor exists
      const doctor = await Doctor.findOne({
        where: {
          id: doctorId
        }
      })
      if (!doctor) {
        throw new Error('Bác sĩ không tồn tại')
      }

      // Get all time slots for the doctor
      const timeSlots = await TimeSlot.findAll({
        where: {
          doctorId
        },
        order: [['startDate', 'ASC']]
      })


      // Group time slots by date and format the response
      const scheduleDates = timeSlots.reduce((acc: any[], timeSlot) => {
        const startDate = moment(timeSlot.dataValues.startDate)
        const dateStr = startDate.format('DD/MM/YYYY')
        const title = startDate.format('ddd, DD-MM').replace('Mon', 'Th 2')
          .replace('Tue', 'Th 3')
          .replace('Wed', 'Th 4')
          .replace('Thu', 'Th 5')
          .replace('Fri', 'Th 6')
          .replace('Sat', 'Th 7')
          .replace('Sun', 'CN')

        const existingDate = acc.find(item => item.date === dateStr)
        if (existingDate) {
          existingDate.total++
        } else {
          acc.push({
            date: dateStr,
            total: 1,
            title
          })
        }
        return acc
      }, [])

      return scheduleDates
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}
