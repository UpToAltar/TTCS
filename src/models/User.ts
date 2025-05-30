import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  Unique,
  AllowNull,
  ForeignKey,
  BelongsTo,
  HasMany
} from 'sequelize-typescript'
import { Role } from './Role'
import { Notification } from './Notification'
import { Booking } from './Booking'
import { Invoice } from './Invoice'
import { News } from './News'

@Table({
  timestamps: true // Kích hoạt createdAt & updatedAt tự động
})
export class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4) // UUID tự động
  @Column(DataType.UUID)
  id: string = ''

  @AllowNull(false)
  @Column(DataType.STRING)
  userName!: string

  @AllowNull(false)
  @Column(DataType.STRING)
  email!: string

  @AllowNull(false)
  @Column(DataType.STRING)
  phone!: string

  @AllowNull(false)
  @Column(DataType.STRING)
  password!: string

  @Column(DataType.DATE)
  birthDate?: Date

  @Column(DataType.BOOLEAN)
  gender?: boolean

  @Column(DataType.STRING)
  address?: string

  @Column(DataType.STRING)
  img?: string

  @ForeignKey(() => Role)
  @Column(DataType.UUID)
  roleId!: string

  @Column(DataType.BOOLEAN)
  status?: boolean

  @Column(DataType.STRING)
  resetPasswordOTP?: string

  @Column(DataType.DATE)
  resetPasswordExpires?: Date

  @BelongsTo(() => Role)
  role!: Role

  @HasMany(() => Notification)
  notifications?: Notification[]

  @HasMany(() => Booking)
  bookings?: Booking[]

  @HasMany(() => News)
  News?: News[]
}
