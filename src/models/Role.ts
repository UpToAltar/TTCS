import { Table, Column, Model, DataType, PrimaryKey, Default, HasMany } from 'sequelize-typescript'
import { User } from './User'

@Table({
  timestamps: true // Kích hoạt createdAt & updatedAt tự động
})
export class Role extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4) // Tạo UUID tự động
  @Column(DataType.UUID)
  id: string = ''

  @Column(DataType.STRING)
  name!: string

  @HasMany(() => User) // Một Role có nhiều User
  users!: User[]
}
