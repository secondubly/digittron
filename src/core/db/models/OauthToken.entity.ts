import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/decorators/legacy'
import { BaseEntity, User } from './user.entity'

@Entity()
export class OauthToken extends BaseEntity {
  @PrimaryKey()
  id!: number

  @ManyToOne(() => User, {
    fieldName: 'twitch_id',
    deleteRule: 'cascade',
    nullable: true,
  })
  user_id?: string

  @Property()
  provider_name!: string

  @Property()
  access_token_encrypted!: string

  @Property({ nullable: true })
  refresh_token_encrypted: string | null = null

  @Property({ default: 'Bearer' })
  token_type?: string

  @Property()
  expires_in?: number
}
