import type { ApiClient } from '@twurple/api'
import type { RefreshingAuthProvider } from '@twurple/auth'

export interface Deps {
  api: ApiClient
  auth: RefreshingAuthProvider
}
