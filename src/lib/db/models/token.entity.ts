import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy'

@Entity()
export class Token {
    @PrimaryKey()
    id!: number

    @Property()
    twitchAccessToken!: string

    @Property({ nullable: true })
    spotifyRefreshToken?: string
}
