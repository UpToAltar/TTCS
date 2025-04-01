import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo } from 'sequelize-typescript'
import { Doctor } from './Doctor'

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
  date!: Date

  @Column(DataType.BOOLEAN)
  status?: boolean
}
