import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { errorHandler } from './middlewares/error.middleware'
import routes from './routes'
import { setupSwagger } from './config/swagger'
import path from 'path'

const app = express()

app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(express.static(path.join(__dirname, '../public')))
// Setup Swagger
setupSwagger(app);

app.use('/api', routes)
app.use(errorHandler)

export default app
