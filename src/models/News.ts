import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo } from 'sequelize-typescript'
import { User } from './User'

@Table({ timestamps: true })
export class News extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string = ''

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string

  @BelongsTo(() => User)
  user!: User

  @Column(DataType.STRING)
  name!: string

  @Column(DataType.TEXT)
  description!: string

  @Column(DataType.STRING)
  type!: string

  @Column(DataType.STRING)
  img!: string
}
