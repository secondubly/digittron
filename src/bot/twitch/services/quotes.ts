// TODO: move to a core service instead
import { db } from '@core/db'
import type { NewQuote, Quote } from '../../../api/types'

const BASE_URL = `http://localhost:${Bun.env.WEB_PORT ?? '3000'}`

export async function addQuote(q: NewQuote) {
  const res = await fetch(`${BASE_URL}/api/quotes`, {
    method: 'POST',
    body: JSON.stringify(q),
  })

  if (!res.ok) {
    return null
  }

  return await res.json()
}

/** A random quote whose text or author contains `term`. */
export async function searchQuote(term: string): Promise<Quote | null> {
  const res = await fetch(`${BASE_URL}/api/quotes/search?q=${term}`)

  if (!res.ok) {
    return null
  }

  return (await res.json()) as Quote
}

/** Soft delete: the row stays, but the quote disappears and its number is never reused. */
export async function deleteQuote(id: number): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/api/quotes/${id}`, {
    method: 'DELETE',
  })

  if (!res.ok) {
    return false
  } else {
    return true
  }
}

export function quoteCount(): number {
  const row = db.query('SELECT COUNT(*) AS n FROM quotes WHERE deleted_at IS NULL').get() as {
    n: number
  }
  return row.n
}

export async function getRandomQuote(): Promise<Quote | null> {
  const res = await fetch(`${BASE_URL}/api/quotes/random`)

  if (!res.ok) {
    return null
  }

  return (await res.json()) as Quote
}

export async function getQuote(id: number): Promise<Quote | null> {
  const res = await fetch(`${BASE_URL}/api/quotes/${id}`)

  if (!res.ok) {
    return null
  }

  return (await res.json()) as Quote
}
