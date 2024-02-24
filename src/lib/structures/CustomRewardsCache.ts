import type { HelixCustomReward } from '@twurple/api'

export class CustomRewardsCache {
	private cache: Map<string, HelixCustomReward[]> = new Map<string, HelixCustomReward[]>()
	constructor(rewards: HelixCustomReward[]) {
		rewards.forEach((reward) => {
			const rewards = this.cache.get(reward.broadcasterId)
			this.cache.set(reward.broadcasterId, rewards ? [...rewards, reward] : [reward])
		})
	}

	set(broadcasterId: string, reward: HelixCustomReward): void {
		const rewards = this.cache.get(broadcasterId)
		this.cache.set(broadcasterId, rewards ? [...rewards, reward] : [reward])
	}

	get(broadcasterId: string, rewardId: string) {
		if (!this.cache.has(broadcasterId)) {
			return undefined
		} else {
			const rewards = this.cache.get(broadcasterId) as HelixCustomReward[]
			return rewards.find((reward) => reward.id === rewardId)
		}
	}

	has(broadcasterId: string, rewardId: string) {
		return this.cache.get(broadcasterId)?.findIndex((reward) => reward.id === rewardId) === -1 ? false : true
	}
}
