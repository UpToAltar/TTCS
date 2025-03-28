import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo } from 'sequelize-typescript'
import { User } from './User'
import { Specialty } from './Specialty'

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
  // Thêm cột degree (bằng cấp)
  @Column(DataType.STRING)
  degree?: string;
}
