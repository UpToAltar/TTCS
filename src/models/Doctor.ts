import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript'
import { User } from './User'
import { Specialty } from './Specialty'
import { TimeSlot } from './TimeSlot'
import { MedicalRecord } from './MedicalRecord'

@Table({ timestamps: true })
export class Doctor extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string = ''

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string

  @BelongsTo(() => User)
  user!: User

  @ForeignKey(() => Specialty)
  @Column(DataType.UUID)
  specialtyId!: string

  @BelongsTo(() => Specialty)
  specialty!: Specialty

  @Column(DataType.TEXT)
  description?: string

  @HasMany(() => TimeSlot)
  timeSlot?: TimeSlot[]

  @HasMany(() => MedicalRecord)
  medicalRecord?: MedicalRecord[]
}
