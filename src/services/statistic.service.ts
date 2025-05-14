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

      // Thống kê của khoảng thời gian trước
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

      // Tính toán sự thay đổi
      const bookingChange = lastBookings === 0 ? 100 : ((newBookings - lastBookings) / lastBookings) * 100
      const userChange = lastUsers === 0 ? 100 : ((newtotalUsers - lastUsers) / lastUsers) * 100
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

  public static getTimeAgo(date: Date | null): string {
    if (!date || isNaN(new Date(date).getTime())) {
      return 'Chưa có dữ liệu'
    }

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
          timeAgo: this.getTimeAgo(recentUsers?.dataValues?.createdAt || null)
        },
        recentBookings: {
          timeAgo: this.getTimeAgo(recentBookings?.dataValues?.createdAt || null)
        },
        recentNews: {
          timeAgo: this.getTimeAgo(recentNews?.dataValues?.createdAt || null)
        },
        recentContacts: {
          timeAgo: this.getTimeAgo(recentContacts?.dataValues?.createdAt || null)
        }
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async getChartData(time: string) {
    try {
      const { currentStart, currentEnd } = this.getDateRange(time)

      // Lấy dữ liệu lịch hẹn
      const appointmentsData = await this.getAppointmentsData(currentStart, currentEnd, time)

      // Lấy phân bố tuổi người dùng
      const usersAgeData = await this.getUsersAgeData()

      // Lấy dữ liệu chuyên khoa
      const specialtiesData = await this.getSpecialtiesData()

      // Lấy dữ liệu doanh thu
      const revenueData = await this.getRevenueData(time)

      return {
        appointmentsChart: appointmentsData,
        usersAgeChart: usersAgeData,
        specialtiesChart: specialtiesData,
        revenueChart: revenueData
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async getAppointmentsData(startDate: Date, endDate: Date, time: string) {
    let labels: string[] = []
    let data: number[] = []

    switch (time) {
      case 'today':
        labels = Array.from({ length: 24 }, (_, i) => `${i}:00`)
        data = new Array(24).fill(0)
        break
      case 'this_week':
        labels = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
        data = new Array(7).fill(0)
        break
      case 'this_month':
        const daysInMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate()
        labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`)
        data = new Array(daysInMonth).fill(0)
        break
      case 'this_year':
        labels = Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`)
        data = new Array(12).fill(0)
        break
    }

    const bookings = await Booking.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate]
        },
        status: true // Chỉ lấy các lịch hẹn đã xác nhận
      },
      attributes: ['createdAt']
    })

    bookings.forEach(booking => {
      const date = new Date(booking.get('createdAt'))
      let index: number

      switch (time) {
        case 'today':
          index = date.getHours()
          break
        case 'this_week':
          index = date.getDay() // 0 = Chủ nhật, 1-6 = Thứ 2-7
          break
        case 'this_month':
          index = date.getDate() - 1 // 0-based index
          break
        case 'this_year':
          index = date.getMonth() // 0-11
          break
        default:
          index = 0
      }

      if (index >= 0 && index < data.length) {
        data[index]++
      }
    })

    return { labels, data }
  }

  static async getUsersAgeData() {
    const users = await User.findAll({
      attributes: ['birthDate'],
      where: {
        birthDate: {
          [Op.not]: null // Chỉ lấy người dùng có ngày sinh
        }
      }
    })

    const ageGroups = {
      '0-18': 0,
      '19-30': 0,
      '31-45': 0,
      '46-60': 0,
      '60+': 0
    }

    users.forEach(user => {
      const birthDate = user.get('birthDate') as Date
      if (birthDate) {
        const age = this.calculateAge(birthDate)
        if (age <= 18) ageGroups['0-18']++
        else if (age <= 30) ageGroups['19-30']++
        else if (age <= 45) ageGroups['31-45']++
        else if (age <= 60) ageGroups['46-60']++
        else ageGroups['60+']++
      }
    })

    return {
      labels: Object.keys(ageGroups),
      data: Object.values(ageGroups)
    }
  }

  public static calculateAge(birthDate: Date): number {
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  static async getSpecialtiesData() {
    const getRandomColor = () => {
      const letters = '0123456789ABCDEF'
      let color = '#'
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
      }
      return color
    }

    const specialties = await Specialty.findAll({
      include: [{
        model: Doctor,
        include: [{
          model: TimeSlot,
          include: [{
            model: Booking,
            where: {
              status: true // Chỉ lấy các lịch hẹn đã xác nhận
            },
            required: false
          }]
        }]
      }]
    })
    const color: string[] = []


    const data = specialties.map(specialty => {
      const doctors = specialty?.dataValues?.doctors || []
      const bookingCount = doctors.reduce((total: number, doctor: Doctor) => {
        const timeSlots = doctor?.dataValues?.timeSlot || []
        const bookings = timeSlots.reduce((slotTotal: number, timeSlot: TimeSlot) => {
          const slotBookings = timeSlot?.dataValues?.bookings || []
          return slotTotal + (slotBookings?.length || 0)
        }, 0)
        return total + bookings
      }, 0)
      return {
        name: specialty?.dataValues?.name || '',
        count: bookingCount,
        color: getRandomColor()
      }
    })

    // Sắp xếp theo số lượng booking và lấy top 5
    data.sort((a, b) => b.count - a.count)
    const top5 = data.slice(0, 5)

    return {
      labels: top5.map(item => item.name),
      data: top5.map(item => item.count),
      color: top5.map(item => item.color)
    }
  }

  static async getRevenueData(time: string) {
    const { currentStart, currentEnd } = this.getDateRange(time)
    let labels: string[] = []
    let data: number[] = []

    switch (time) {
      case 'today':
        labels = Array.from({ length: 24 }, (_, i) => `${i}:00`)
        data = new Array(24).fill(0)
        break
      case 'this_week':
        labels = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
        data = new Array(7).fill(0)
        break
      case 'this_month':
        const daysInMonth = new Date(currentEnd.getFullYear(), currentEnd.getMonth() + 1, 0).getDate()
        labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`)
        data = new Array(daysInMonth).fill(0)
        break
      case 'this_year':
        labels = Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`)
        data = new Array(12).fill(0)
        break
    }

    const invoices = await Invoice.findAll({
      where: {
        createdAt: {
          [Op.between]: [currentStart, currentEnd]
        }
      },
      attributes: ['total', 'createdAt']
    })

    invoices.forEach(invoice => {
      const date = new Date(invoice.get('createdAt'))
      let index: number

      switch (time) {
        case 'today':
          index = date.getHours()
          break
        case 'this_week':
          index = date.getDay()
          break
        case 'this_month':
          index = date.getDate() - 1
          break
        case 'this_year':
          index = date.getMonth()
          break
        default:
          index = 0
      }

      if (index >= 0 && index < data.length) {
        data[index] += Number(invoice.get('total'))
      }
    })

    return {
      labels,
      data
    }
  }

  static async getTopSpecialties() {
    try {
      const specialties = await Specialty.findAll({
        include: [{
          model: Doctor,
          include: [{
            model: TimeSlot,
            include: [{
              model: Booking
            }]
          }]
        }]
      })

      const data = specialties.map(specialty => {
        const doctors = specialty?.dataValues?.doctors || []
        const bookingCount = doctors.reduce((total: number, doctor: Doctor) => {
          const timeSlots = doctor?.dataValues?.timeSlot || []
          const bookings = timeSlots.reduce((slotTotal: number, timeSlot: TimeSlot) => {
            const slotBookings = timeSlot?.dataValues?.bookings || []
            return slotTotal + (slotBookings?.length || 0)
          }, 0)
          return total + bookings
        }, 0)
        return {
          name: specialty?.dataValues?.name || '',
          bookingCount: bookingCount,
          doctorCount: doctors.length
        }
      })

      // Sắp xếp theo số lượng booking
      data.sort((a, b) => b.bookingCount - a.bookingCount)
      return {
        specialties: data,
        chartData: {
          labels: data.map(item => item.name),
          data: data.map(item => item.bookingCount)
        }
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}
