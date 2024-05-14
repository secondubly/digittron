import type { ApiClient, HelixUser } from '@twurple/api'
import { PermissionLevel } from '@prisma/client'
export const getUserRank = async (api: ApiClient, broadcasterData: HelixUser, user: HelixUser): Promise<PermissionLevel> => {
	const isSubscribed = await broadcasterData.hasSubscriber(broadcasterData.id)
	const isVIP = await api.channels.checkVipForUser(broadcasterData.id, user.id)
	const isFollowing = await broadcasterData.isFollowedBy(user.id)
	const isModerator = await api.moderation.getModerators(broadcasterData, {
		userId: user.id
	})

	if (user.name === broadcasterData.name) {
		return PermissionLevel.BROADCASTER
	} else if (isSubscribed) {
		return PermissionLevel.SUBSCRIBER
	} else if (isVIP) {
		return PermissionLevel.VIP
	} else if (isFollowing) {
		return PermissionLevel.FOLLOWER
	} else if (isModerator) {
		return PermissionLevel.MODERATOR
	} else {
		return PermissionLevel.VIEWER
	}
}
