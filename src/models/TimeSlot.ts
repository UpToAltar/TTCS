import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript'
import { Doctor } from './Doctor'
import { Booking } from './Booking'

@Table({ timestamps: true })
export class TimeSlot extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string = ''

  @ForeignKey(() => Doctor)
  @Column(DataType.UUID)
  doctorId!: string

  @BelongsTo(() => Doctor)
  doctor!: Doctor

  @Column(DataType.DATE)
  startDate!: Date

  @Column(DataType.DATE)
  endDate!: Date

  @Column(DataType.BOOLEAN)
  status?: boolean

  @HasMany(() => Booking)
  bookings!: Booking[]
}
