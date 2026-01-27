import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity()
export class Token {
    @PrimaryKey()
    id!: number

    @Property()
    twitchAccessToken!: string

    @Property({ nullable: true })
    spotifyAccessToken?: string
}
