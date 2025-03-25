import { Table, Column, Model, DataType, PrimaryKey, Default } from 'sequelize-typescript'

@Table({ timestamps: true })
export class Service extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string = ''

  @Column(DataType.STRING)
  name!: string

  @Column(DataType.INTEGER)
  price!: number

  @Column(DataType.STRING)
  description?: string
}
