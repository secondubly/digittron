import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Enum,
  Unique,
  Index,
} from '@mikro-orm/decorators/legacy'

import { BaseEntity, Collection } from '@mikro-orm/core'

export enum UserLevel {
  EVERYONE = 'everyone',
  SUBSCRIBER = 'subscriber',
  VIP = 'vip',
  MODERATOR = 'moderator',
  BROADCASTER = 'broadcaster',
}

@Entity()
export class Channel {
  @PrimaryKey()
  id!: number

  @Property({ unique: true })
  twitchId!: string

  @Property({ unique: true })
  name!: string

  @OneToMany(() => CustomCommand, (cmd) => cmd.channel)
  commands = new Collection<CustomCommand>(this)
}

@Entity()
@Unique({ properties: ['channel', 'name'] })
export class CustomCommand extends BaseEntity {
  @PrimaryKey()
  id!: number

  @ManyToOne(() => Channel)
  @Index()
  channel!: Channel

  @Property()
  name!: string

  @Property({ type: 'text' })
  response!: string

  @Property({ type: 'json', nullable: true })
  aliases?: string[] // stored as serialized text column in SQLite

  @Enum({ items: () => UserLevel })
  userLevel: UserLevel = UserLevel.EVERYONE // SQLite has no native enum type — stored as text with a CHECK constraint

  @Property({ type: 'integer', default: 0 })
  cooldownSeconds: number = 5

  @Property({ type: 'integer', default: 0 })
  userCooldownSeconds: number = 0

  @Property({ type: 'datetime', nullable: true })
  lastUsedAt?: Date // explicit 'datetime' since SQLite has no native date type (stored as ISO text)

  @Property({ type: 'integer', default: 0 })
  usageCount: number = 0

  @Property({ type: 'boolean', default: true })
  enabled: boolean = true

  @Property()
  createdBy!: string
}
