import {
    Entity,
    PrimaryKey,
    Property,
    ManyToOne,
} from '@mikro-orm/decorators/legacy'
import type { Rel } from '@mikro-orm/core'
import { User } from './user.entity'

@Entity()
export class AudioAlert {
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

    @Property()
    createdAt: Date = new Date()

    @Property({ onUpdate: () => new Date() })
    updatedAt: Date = new Date()
}
