import type { ChatClient } from '@twurple/chat'

export function onChannelRedemptionAdd(
	username: string,
	rewardCost: number,
	rewardTitle: string,
	broadcasterName: string,
	client: ChatClient | undefined
) {
	client?.say(broadcasterName, `${username} redeemed ${rewardTitle} for ${rewardCost} `)
}
