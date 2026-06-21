import type { Opt } from '@mikro-orm/core'
import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy'

export abstract class BaseEntity {
  @Property()
  created_at: Date & Opt = new Date()

  @Property({ onUpdate: () => new Date() })
  updated_at: Date & Opt = new Date()
}

@Entity()
export class User extends BaseEntity {
  @PrimaryKey()
  twitch_id!: string

  @Property()
  username!: string

  @Property()
  avatar?: string

  @Property()
  access_token_encrypted!: string

  @Property()
  refresh_token_encrypted!: string

  @Property()
  expires_in!: number

  @Property()
  scopes!: string
}
