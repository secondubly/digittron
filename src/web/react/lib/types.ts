export interface GiveawayFormValues {
    giveawayType: string
    participants?: string[]
    keyword?: string
    minRange?: number
    maxRange?: number
}

export interface ParticipantCheckbox {
    label: string
    value: string
}
