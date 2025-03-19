import { Sequelize } from 'sequelize-typescript'
import dotenv from 'dotenv'
import path from 'path'
import { Role } from '~/models/Role'

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
