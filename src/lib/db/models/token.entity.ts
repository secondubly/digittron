import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity()
export class Token {
    @PrimaryKey()
    id!: number

    @Property()
    accessToken!: string

    @Property()
    refreshToken!: string
}
