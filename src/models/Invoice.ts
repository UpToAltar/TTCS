import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo } from 'sequelize-typescript'
import { MedicalAppointment } from './MedicalAppointment'
import { User } from './User'

@Table({ timestamps: true })
export class Invoice extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string = ''

  @ForeignKey(() => MedicalAppointment)
  @Column(DataType.UUID)
  appointmentId!: string

  @BelongsTo(() => MedicalAppointment)
  appointment!: MedicalAppointment

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  patientId!: string

  @BelongsTo(() => User)
  patient!: User

  @Column(DataType.INTEGER)
  total!: number

  @Column(DataType.INTEGER)
  paid!: number

  @Column(DataType.INTEGER)
  remaining!: number

  @Column(DataType.STRING)
  status!: string
}
