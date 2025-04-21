import { Op } from 'sequelize'
import { Booking } from '~/models/Booking'
import { Doctor } from '~/models/Doctor'
import { Invoice } from '~/models/Invoice'
import { MedicalAppointment } from '~/models/MedicalAppointment'
import { TimeSlot } from '~/models/TimeSlot'
import { User } from '~/models/User'

export class StatisticService {
  static async getStatisticDashBoard() {
    const userCount = await User.count()
    const doctorCount = await Doctor.count()
    const timeSlotCountOfDay = await TimeSlot.count({
      where: {
        startDate: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
        },
        endDate: {
          [Op.lte]: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }
    })
    const bookingCountOfDay = await Booking.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })

    const userCountOfDay = await User.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })

    const doctorCountOfDay = await Doctor.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })

    const appointmentCountOfDay = await MedicalAppointment.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })
    //Chart
    const label7Days = StatisticService.getLast7Days()
    const appointmentCountOf7Days = await StatisticService.countAppointmentsLast7Days()
    const chartInvoice = await StatisticService.getMonthlyInvoiceData()
    return {
      dashboard: {
        userCount,
        doctorCount,
        timeSlotCountOfDay,
        bookingCountOfDay
      },
      usually: {
        userCountOfDay,
        doctorCountOfDay,
        appointmentCountOfDay
      },
      chartAppointment: {
        label: label7Days,
        data: appointmentCountOf7Days
      },
      chartInvoice: chartInvoice
    }
  }

  static getLast7Days(): string[] {
    const result: string[] = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)

      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')

      result.push(`${day}/${month}`)
    }

    return result
  }

  static async countAppointmentsLast7Days(): Promise<number[]> {
    const today = new Date()
    const fromDate = new Date()
    fromDate.setDate(today.getDate() - 6)
    fromDate.setHours(0, 0, 0, 0)

    const toDate = new Date()
    toDate.setHours(23, 59, 59, 999)

    // Lấy toàn bộ appointment trong 7 ngày gần nhất
    const appointments = await MedicalAppointment.findAll({
      where: {
        createdAt: {
          [Op.between]: [fromDate, toDate]
        }
      }
    })

    const last7Days = StatisticService.getLast7Days()

    // Map theo số lượng từng ngày
    const countByDay = last7Days.map((dayStr) => {
      return appointments.filter((app) => {
        const createdDate = new Date(app.createdAt)
        return StatisticService.formatDate(createdDate) === dayStr
      }).length
    })

    return countByDay
  }

  static formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${day}/${month}`
  }

  static async getMonthlyInvoiceData(): Promise<{ label: string[]; data: number[] }> {
    const currentYear = new Date().getFullYear()

    const label = Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`)
    const data: number[] = new Array(12).fill(0)

    // Lấy tất cả invoice của năm hiện tại
    const invoices = await Invoice.findAll({
      where: {
        createdAt: {
          [Op.gte]: new Date(`${currentYear}-01-01`),
          [Op.lte]: new Date(`${currentYear}-12-31`)
        }
      },
      attributes: ['total', 'createdAt']
    })

    console.log('invoices', invoices)

    // Cộng dồn theo tháng
    invoices.forEach((invoice) => {
      const date = new Date(invoice?.dataValues.createdAt)
      const monthIndex = date.getMonth() // 0 = Jan, 11 = Dec
      data[monthIndex] += Number(invoice?.dataValues.total)
    })

    return { label: label, data }
  }

  static async getStatisticUser() {
    const userCount = await User.count()
    const userOfMonth = await User.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 30))
        }
      }
    })
    const userActive = await User.count({
      where: {
        status: true
      }
    })

    const userInactive = await User.count({
      where: {
        status: false
      }
    })

    const chart = await StatisticService.getChartUserMonthOfYear()
    return {
      userCount,
      userOfMonth,
      userActive,
      userInactive,
      chart
    }
  }

  static async getChartUserMonthOfYear() {
    const currentYear = new Date().getFullYear()

    const label = Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`)
    const data: number[] = new Array(12).fill(0)

    // Lấy tất cả invoice của năm hiện tại
    const users = await User.findAll({
      where: {
        createdAt: {
          [Op.gte]: new Date(`${currentYear}-01-01`),
          [Op.lte]: new Date(`${currentYear}-12-31`)
        }
      },
      attributes: ['createdAt']
    })

    // Cộng dồn theo tháng
    users.forEach((user) => {
      const date = new Date(user?.dataValues.createdAt)
      const monthIndex = date.getMonth() // 0 = Jan, 11 = Dec
      data[monthIndex] += 1
    })

    return { label: label, data }
  }
}
