import {
    Entity,
    ManyToOne,
    PrimaryKey,
    Property,
} from '@mikro-orm/decorators/legacy'
import { User } from './user.entity'

@Entity()
export class OauthToken {
    @PrimaryKey()
    id!: number

    @ManyToOne(() => User, {
        fieldName: 'twitch_id',
        deleteRule: 'cascade',
        nullable: false,
    })
    user_id!: string

    @Property()
    provider_name!: string

    @Property()
    access_token!: string

    @Property()
    refresh_token?: string

    @Property({ default: 'Bearer' })
    token_type?: string

    @Property()
    expires_at?: Date

    @Property({ onCreate: () => new Date() })
    created_at?: Date

    @Property({ onUpdate: () => new Date() })
    updated_at?: Date
}
