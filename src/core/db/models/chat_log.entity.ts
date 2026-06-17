import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy'

@Entity()
export class ChatLog {
    @PrimaryKey()
    id!: number

    @Property()
    user_id!: string

    @Property()
    message!: string

    @Property({ onCreate: () => new Date() })
    created_at: Date = new Date()
}
