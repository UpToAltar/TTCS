import swaggerJsDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { Express } from 'express'

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express TypeScript API',
      version: '1.0.0',
      description: 'API documentation for Express.js TypeScript backend'
    },
    servers: [{ url: 'http://localhost:5000' }],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT' // Định dạng token là JWT
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  apis: ['./src/controllers/*.ts'] // Đọc tài liệu từ các controller
}

const swaggerSpec = swaggerJsDoc(swaggerOptions)

export const setupSwagger = (app: Express) => {
  app.use('/api/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}
