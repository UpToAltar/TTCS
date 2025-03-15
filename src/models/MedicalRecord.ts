import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo } from 'sequelize-typescript'
import { User } from './User'
import { Doctor } from './Doctor'

@Table({ timestamps: true })
export class MedicalRecord extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string = ''

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  patientId!: string

  @BelongsTo(() => User)
  patient!: User

  @ForeignKey(() => Doctor)
  @Column(DataType.UUID)
  doctorId!: string

  @BelongsTo(() => Doctor)
  doctor!: Doctor

  @Column(DataType.TEXT)
  diagnosis!: string

  @Column(DataType.TEXT)
  prescription!: string

  @Column(DataType.TEXT)
  notes!: string
}
