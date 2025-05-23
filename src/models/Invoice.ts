import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo } from 'sequelize-typescript'
import { MedicalAppointment } from './MedicalAppointment'

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

  @Column(DataType.INTEGER)
  total!: number

  @Column(DataType.STRING)
  status!: string

  @Column(DataType.STRING)
  note!: string

  @Column(DataType.STRING)
  code!: string
}
