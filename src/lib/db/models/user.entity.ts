import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy'

@Entity()
export class User {
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
    expires_at!: number

    @Property()
    scopes!: string
}
