import { Sequelize } from 'sequelize-typescript'
import dotenv from 'dotenv'
import path from 'path'

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
