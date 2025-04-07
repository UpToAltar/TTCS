import { Sequelize } from 'sequelize-typescript'
import dotenv from 'dotenv'
import path from 'path'
import { Role } from '~/models/Role'
import { User } from '~/models/User'
import bcrypt from 'bcrypt'
import { Specialty } from '~/models/Specialty'
import { Doctor } from '~/models/Doctor'

dotenv.config()

export const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  dialect: 'mysql',
  models: [path.join(__dirname, '../models')], // Load tất cả models
  logging: false // Bật/tắt log query SQL
})

export const seedRoles = async () => {
  const roles = ['User', 'Doctor', 'Admin']
  for (const role of roles) {
    const roleExists = await Role.findOne({ where: { name: role } })
    if (!roleExists) {
      await Role.create({ name: role })
      console.log(`Role ${role} đã được thêm vào database.`)
    }
  }
}

export const seedUser = async () => {
  const users = [
    { userName: 'Admin', email: 'admin@example.com', phone: '0123456789' },
    { userName: 'Doctor', email: 'doctor@example.com', phone: '0987654321' },
    { userName: 'User', email: 'user@example.com', phone: '0111222333' }
  ]

  // Băm mật khẩu
  const salt = await bcrypt.genSalt(10)
  const password = await bcrypt.hash('string', salt)

  for (const u of users) {
    const exists = await User.findOne({ where: { userName: u.userName } })
    if (exists) continue

    const role = await Role.findOne({ where: { name: u.userName } })
    if (!role) {
      console.warn(`Role "${u.userName}" not found. Skipping user "${u.userName}"`)
      continue
    }

    const createdUser = await User.create({
      userName: u.userName,
      email: u.email,
      phone: u.phone,
      password: password,
      birthDate: new Date('1990-01-01'),
      gender: true,
      address: 'Hà Nội',
      status: true,
      roleId: role?.dataValues.id
    })

    // Nếu là Doctor, tạo thêm bản ghi Doctor
    if (u.userName === 'Doctor') {
      const specialty = await Specialty.findOne()
      if (!specialty) {
        console.warn('No specialty found. Skipping doctor creation.')
        continue
      }

      await Doctor.create({
        userId: createdUser?.dataValues.id,
        specialtyId: specialty?.dataValues.id,
        description: 'Bác sĩ chuyên khoa giỏi',
        degree: 'Tiến sĩ Y học'
      })
    }
  }
}
