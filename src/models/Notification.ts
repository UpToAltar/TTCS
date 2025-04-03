import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  ForeignKey,
  BelongsTo
} from 'sequelize-typescript'
import { User } from './User'

@Table({
  timestamps: true // Tự động tạo createdAt & updatedAt
})
export class Notification extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4) // Tạo UUID tự động
  @Column(DataType.UUID)
  id: string = ''

  @Column(DataType.STRING)
  title!: string

  @Column(DataType.STRING)
  content!: string

  @ForeignKey(() => User) // Khóa ngoại đến bảng Users
  @Column(DataType.UUID)
  userId!: string

  @BelongsTo(() => User) // Một Notification thuộc về một User
  user!: User
}
