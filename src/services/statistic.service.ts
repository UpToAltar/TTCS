import { Op } from 'sequelize'
import { Booking } from '~/models/Booking'
import { Doctor } from '~/models/Doctor'
import { Invoice } from '~/models/Invoice'
import { MedicalAppointment } from '~/models/MedicalAppointment'
import { Role } from '~/models/Role'
import { Specialty } from '~/models/Specialty'
import { TimeSlot } from '~/models/TimeSlot'
import { User } from '~/models/User'
import { Notification } from '~/models/Notification'
import { News } from '~/models/News'

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

  static async getStatisticDoctor() {
    const doctorCount = await Doctor.count()
    const doctorActive = await User.count({
      include: [
        {
          model: Role,
          where: { name: 'Doctor' } // điều kiện lọc theo Role name
        }
      ],
      where: {
        status: true
      }
    })
    const doctorInactive = await User.count({
      include: [
        {
          model: Role,
          where: { name: 'Doctor' } // điều kiện lọc theo Role name
        }
      ],
      where: {
        status: false
      }
    })
    const countAllTimeSlotOfDays = await TimeSlot.count({
      where: {
        startDate: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
        },
        endDate: {
          [Op.lte]: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }
    })

    // Chart
    const getRandomColor = () => {
      const letters = '0123456789ABCDEF'
      let color = '#'
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
      }
      return color
    }

    const specialties = await Specialty.findAll({
      include: [{ model: Doctor }]
    })

    const label: string[] = []
    const data: number[] = []
    const color: string[] = []

    specialties.forEach((specialty) => {
      label.push(specialty?.dataValues.name)
      data.push(specialty?.dataValues.doctors?.length || 0)
      color.push(getRandomColor())
    })

    return {
      doctorCount,
      doctorActive,
      doctorInactive,
      countAllTimeSlotOfDays,
      chart: {
        label,
        data,
        color
      }
    }
  }

  static async getStatisticTimeSlot() {
    const totalCount = await TimeSlot.count()

    const todayCount = await TimeSlot.count({
      where: {
        startDate: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
        },
        endDate: {
          [Op.lte]: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }
    })

    const readyCount = await TimeSlot.count({
      where: {
        status: true
      }
    })

    const rejectCount = await TimeSlot.count({
      where: {
        status: false
      }
    })

    // Get monthly statistics
    const currentYear = new Date().getFullYear()
    const label = Array.from({ length: 12 }, (_, i) => `T${i + 1}`)
    const data: number[] = new Array(12).fill(0)

    const timeSlots = await TimeSlot.findAll({
      where: {
        createdAt: {
          [Op.gte]: new Date(`${currentYear}-01-01`),
          [Op.lte]: new Date(`${currentYear}-12-31`)
        }
      },
      attributes: ['createdAt']
    })

    // Count by month
    timeSlots.forEach((timeSlot) => {
      const date = new Date(timeSlot?.dataValues.createdAt)
      const monthIndex = date.getMonth() // 0 = Jan, 11 = Dec
      data[monthIndex] += 1
    })

    return {
      totalCount,
      todayCount,
      readyCount,
      rejectCount,
      chart: {
        label,
        data
      }
    }
  }
  public static getDateRange(time: string) {
    const now = new Date()
    let currentStart: Date, currentEnd: Date
    let prevStart: Date, prevEnd: Date

    switch (time) {
      case 'today':
        currentStart = new Date(now.setHours(0, 0, 0, 0))
        currentEnd = new Date(now.setHours(23, 59, 59, 999))
        prevStart = new Date()
        prevStart.setDate(prevStart.getDate() - 1)
        prevStart.setHours(0, 0, 0, 0)
        prevEnd = new Date(prevStart)
        prevEnd.setHours(23, 59, 59, 999)
        break

      case 'this_week':
        const currDay = now.getDay()
        const diffToMonday = currDay === 0 ? -6 : 1 - currDay
        currentStart = new Date(now)
        currentStart.setDate(now.getDate() + diffToMonday)
        currentStart.setHours(0, 0, 0, 0)
        currentEnd = new Date(currentStart)
        currentEnd.setDate(currentStart.getDate() + 6)
        currentEnd.setHours(23, 59, 59, 999)

        prevStart = new Date(currentStart)
        prevStart.setDate(prevStart.getDate() - 7)
        prevEnd = new Date(currentEnd)
        prevEnd.setDate(prevEnd.getDate() - 7)
        break

      case 'this_month':
        currentStart = new Date(now.getFullYear(), now.getMonth(), 1)
        currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

        prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
        break

      case 'this_year':
        currentStart = new Date(now.getFullYear(), 0, 1)
        currentEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)

        prevStart = new Date(now.getFullYear() - 1, 0, 1)
        prevEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999)
        break

      default:
        throw new Error('Invalid time range')
    }

    return { currentStart, currentEnd, prevStart, prevEnd }
  }
  static async getOverviewStats(time: string) {
    try {

      const { currentStart, currentEnd, prevStart, prevEnd } = this.getDateRange(time)
      // Tổng số người dùng
      const newtotalUsers = await User.count()

      // Số lượng đặt lịch hôm nay
      const newBookings = await Booking.count({
        where: {
          status: true,
          createdAt: {
            [Op.gte]: currentStart,
            [Op.lte]: currentEnd
          }
        }
      })

      // Lấy tổng số bài viết mới
      const newNews = await News.count({
        where: {
          createdAt: {
            [Op.gte]: currentStart,
            [Op.lte]: currentEnd
          }
        }
      })

      // Lấy các liên hệ mới
      const newContacts = await Notification.count({
        where: {
          title: {
            [Op.startsWith]: 'Liên hệ'
          },
          createdAt: {
            [Op.gte]: currentStart,
            [Op.lte]: currentEnd
          }
        }
      })

      const lastBookings = await Booking.count({
        where: {
          createdAt: {
            [Op.gte]: prevStart,
            [Op.lte]: prevEnd
          }
        }
      })

      const lastUsers = await User.count({
        where: {
          createdAt: {
            [Op.gte]: prevStart,
            [Op.lte]: prevEnd
          }
        }
      })

      const lastContacts = await Notification.count({
        where: {
          title: {
            [Op.startsWith]: 'Liên hệ'
          },
          createdAt: {
            [Op.gte]: prevStart,
            [Op.lte]: prevEnd
          }
        }
      })

      const lastNews = await News.count({
        where: {
          createdAt: {
            [Op.gte]: prevStart,
            [Op.lte]: prevEnd
          }
        }
      })

      const bookingChange = lastBookings ? ((newBookings - newBookings) / lastBookings) * 100 : 0
      const userChange = lastUsers ? ((newtotalUsers - lastUsers) / lastUsers) * 100 : 0
      const contactChange = (newContacts - lastContacts)
      const newsChange = (newNews - lastNews)

      return {
        totalUsers: {
          count: newtotalUsers,
          change: userChange.toFixed(0)
        },
        Bookings: {
          count: newBookings,
          change: bookingChange.toFixed(0)
        },
        News: {
          count: newNews,
          change: newsChange
        },
        Contacts: {
          count: newContacts,
          change: contactChange
        }
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async getRecentActivities() {
    try {
      // Lấy đăng ký người dùng mới
      const recentUsers = await User.findOne({
        order: [['createdAt', 'DESC']],
        attributes: ['createdAt']
      })

      // Lấy đặt lịch mới
      const recentBookings = await Booking.findOne({
        order: [['createdAt', 'DESC']],
        attributes: ['createdAt'],
      })

      //Lấy bài viết mới
      const recentNews = await News.findOne({
        order: [['createdAt', 'DESC']],
        attributes: ['createdAt']
      })

      // Lấy liên hệ mới
      const recentContacts = await Notification.findOne({
        where: {
          title: {
            [Op.startsWith]: 'Liên hệ'
          }
        },
        order: [['createdAt', 'DESC']],
        attributes: ['createdAt']
      })

      return {
        recentUsers: {
          timeAgo: this.getTimeAgo(recentUsers?.dataValues.createdAt)
        },
        recentBookings: {
          timeAgo: this.getTimeAgo(recentBookings?.dataValues.createdAt)
        },
        recentNews: {
          timeAgo: this.getTimeAgo(recentNews?.dataValues.createdAt)
        },
        recentContacts: {
          timeAgo: this.getTimeAgo(recentContacts?.dataValues.createdAt)
        }
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  public static getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)

    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + ' năm trước'

    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + ' tháng trước'

    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + ' ngày trước'

    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + ' giờ trước'

    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + ' phút trước'

    return Math.floor(seconds) + ' giây trước'
  }
}
