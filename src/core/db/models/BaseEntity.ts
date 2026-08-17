import type { Opt } from '@mikro-orm/core'
import { Property } from '@mikro-orm/decorators/legacy'

export abstract class BaseEntity {
  @Property()
  created_at: Date & Opt = new Date()

  @Property({ onUpdate: () => new Date() })
  updated_at: Date & Opt = new Date()
}
