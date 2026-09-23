import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'

interface Scopes {
  twitch: {
    broadcaster: string[]
    bot: string[]
  }
  spotify: string[]
}

interface ScopesContextValue {
  scopes: Scopes | null
  loading: boolean
}

const ScopesContext = createContext<ScopesContextValue>({
  scopes: null,
  loading: true,
})

export function ScopesProvider({ children }: { children: ReactNode }) {
  const [scopes, setScopes] = useState<Scopes | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/config/scopes`)
      .then((r) => r.json())
      .then(setScopes)
      .catch(() => setScopes(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <ScopesContext.Provider value={{ scopes, loading }}>
      {children}
    </ScopesContext.Provider>
  )
}

export const useScopes = () => useContext(ScopesContext)
