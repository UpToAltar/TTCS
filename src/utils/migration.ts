import { Sequelize } from 'sequelize-typescript'
import { Umzug, SequelizeStorage } from 'umzug'

// Import các models
import { User } from '../models/User'
import { Role } from '../models/Role'

export const sequelize = new Sequelize({
  dialect: 'mysql',
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  models: [User, Role]
})

export const migration = new Umzug({
  migrations: [],
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console
})

export const generateMigration = async () => {
  await sequelize.sync({ alter: true }) // Tạo migration tự động
  console.log('✅ Migration created!')
}

generateMigration()
