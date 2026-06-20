import {
    Entity,
    PrimaryKey,
    Property,
    ManyToOne,
} from '@mikro-orm/decorators/legacy'
import type { Rel } from '@mikro-orm/core'
import { BaseEntity, User } from './user.entity'

@Entity()
export class AudioAlert extends BaseEntity {
    @PrimaryKey()
    id!: number

    @ManyToOne(() => User)
    owner!: Rel<User>

    @Property()
    chatterId!: string

    @Property()
    chatterName!: string

    @Property({ columnType: 'text' })
    audioUrl!: string

    @Property({ columnType: 'text' })
    filename!: string

    @Property()
    volume: number = 0.5

    @Property()
    enabled: boolean = true
}
