import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, HasOne } from 'sequelize-typescript'
import { Booking } from './Booking'
import { Doctor } from './Doctor'
import { MedicalRecord } from './MedicalRecord'
import { Invoice } from './Invoice'

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
  @HasOne(() => Invoice, { foreignKey: 'appointmentId' })
  invoice!: Invoice
}
