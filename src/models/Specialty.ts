import { Table, Column, Model, DataType, PrimaryKey, Default, HasMany } from 'sequelize-typescript'
import { Doctor } from './Doctor'

@Table({ timestamps: true })
export class Specialty extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string = ''

  @Column(DataType.STRING)
  name!: string

  @Column(DataType.STRING)
  url!: string

  @HasMany(() => Doctor)
  doctors!: Doctor[]
}
