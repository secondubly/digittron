export interface UserData {
	id: string // Twitch ID
	name: string
	rank: PermissionLevel // default to VIEWER
	watchTime: number // in minutes
}
