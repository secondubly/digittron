import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity()
export class Command {
    @PrimaryKey()
    id!: number

    @Property()
    name!: string

    @Property()
    aliases: string[] = []

    @Property()
    enabled: boolean = true

    @Property()
    response!: string

    @Property()
    description?: string

    @Property()
    permission_level?: number
}
