import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy'
import { BaseEntity } from './BaseEntity'

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
