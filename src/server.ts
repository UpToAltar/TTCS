import app from './app'
import { seedRoles, sequelize } from './config/database';
import { config } from './config/env'
import { logger } from './config/logger'

const PORT = process.env.PORT || 5000;

// Kết nối database
sequelize.sync({ alter: true }).then(async () => {
  logger.info('Database connected & models synced!')
  await seedRoles() // Chạy seed
  app.listen(PORT, () => {
    logger.info(`Server is running on port http://localhost:${config.port}/api/swagger/`)
  })
})
