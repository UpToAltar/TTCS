import app from './app'
import { sequelize } from './config/database';
import { config } from './config/env'
import { logger } from './config/logger'

const PORT = process.env.PORT || 5000;

// Kết nối database
sequelize.sync({ alter: true }).then(() => {
  logger.info("Database connected & models synced!");
  app.listen(PORT, () => {
    logger.info(`Server is running on port http://localhost:${config.port}/api/swagger/`)
  });
});
