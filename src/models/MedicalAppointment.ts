import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo } from 'sequelize-typescript'
import { Booking } from './Booking'
import { Doctor } from './Doctor'
import { MedicalRecord } from './MedicalRecord'

@Table({ timestamps: true })
export class MedicalAppointment extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string = ''

  @ForeignKey(() => Booking)
  @Column(DataType.UUID)
  bookingId!: string

  @BelongsTo(() => Booking)
  booking!: Booking

  @Column(DataType.DATE)
  date!: Date

  @ForeignKey(() => MedicalRecord)
  @Column(DataType.UUID)
  medicalRecordId!: string

  @BelongsTo(() => MedicalRecord)
  medicalRecord!: MedicalRecord

  @Column(DataType.STRING)
  status!: string

  @Column(DataType.STRING)
  code!: string
}
