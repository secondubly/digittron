import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy'

@Entity()
export class ChatLog {
  @PrimaryKey()
  id!: number

  @Property()
  userId!: string

  @Property()
  message!: string

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date()
}
