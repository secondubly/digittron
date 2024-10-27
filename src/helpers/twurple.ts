import { RefreshingAuthProvider } from '@twurple/auth'
import { redisClient } from 'lib/utils'
import { Logger as Log } from 'lib/client/Logger'
import { ApiClient } from '@twurple/api'

export const auth = new RefreshingAuthProvider({
	clientId: process.env.CLIENT_ID as string,
	clientSecret: process.env.CLIENT_SECRET as string
})

auth.onRefresh(async (userId, newTokenData) => {
	// REVIEW: do we need to await this?
	await redisClient.set(userId, JSON.stringify(newTokenData))
})

auth.onRefreshFailure((userId) => {
	Log.warn(`User ${userId} needs to reauthenticate.`)
})

export const api = new ApiClient({
	authProvider: auth,
	logger: {
		timestamps: true,
		colors: true,
		emoji: true,
		minLevel: 3
	}
})

// export default auth
