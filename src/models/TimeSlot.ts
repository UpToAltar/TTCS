import { Table, Column, Model, DataType, PrimaryKey, Default } from 'sequelize-typescript'

@Table({ timestamps: true })
export class TimeSlot extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string = ''

  @Column(DataType.STRING)
  time!: string
}
