// entities/AudioAlert.ts
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

    // the broadcaster who owns this alert config
    @ManyToOne(() => User)
    owner!: Rel<User>

    // the chatter this alert is for
    @Property()
    chatterId!: string

    @Property()
    chatterName!: string

    @Property({ columnType: 'text' })
    audioUrl!: string // /uploads/audio/uuid.mp3

    @Property({ columnType: 'text' })
    filename!: string // original filename for display

    @Property()
    volume: number = 0.5

    @Property()
    enabled: boolean = true

    @Property()
    createdAt: Date = new Date()

    @Property({ onUpdate: () => new Date() })
    updatedAt: Date = new Date()
}
