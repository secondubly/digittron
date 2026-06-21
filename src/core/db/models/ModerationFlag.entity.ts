import {
  Entity,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/decorators/legacy'

@Entity()
export class ModerationFlag {
  @PrimaryKey()
  id!: number

  @Property()
  @Unique()
  key!: string

  @Property({ default: true })
  value!: boolean

  @Property()
  label?: string

  @Property({ onCreate: () => new Date() })
  created_at: Date = new Date()

  @Property({ onUpdate: () => new Date() })
  updated_at: Date = new Date()
}
