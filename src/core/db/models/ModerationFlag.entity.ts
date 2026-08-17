import { BaseEntity } from './BaseEntity'
import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/decorators/legacy'

@Entity()
export class ModerationFlag extends BaseEntity {
  @PrimaryKey()
  id!: number

  @Property()
  @Unique()
  key!: string

  @Property({ default: true })
  value!: boolean

  @Property()
  label?: string
}
