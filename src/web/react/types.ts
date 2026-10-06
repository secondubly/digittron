export type Part = string | { src: string; alt: string }

export type Msg = {
    id: string
    userId: string
    name: string
    color: string
    action: boolean
    parts: Part[]
    at: number
}
