export interface NewQuote {
  text: string
  author?: string
  authorUserId?: string
  game?: string
  addedByUserId: string
  addedByName: string
}

export interface Quote {
  id: number
  text: string
  author: string | null
  game: string | null
  addedByName: string
  createdAt: number
}
