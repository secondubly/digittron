import { useState } from 'react'
import type { Token } from '../../types/TokenInterface'
export default function useToken() {
    const getToken = () => {
        const tokenString = localStorage.getItem('token')
        if (!tokenString) {
            return null
        }

        const userToken = JSON.parse(tokenString) as Token
        return userToken?.token
    }

    const [token, setToken] = useState<string | null>(getToken())

    const saveToken = (userToken: Token) => {
        localStorage.setItem('token', JSON.stringify(userToken))
        setToken(userToken.token)
    }

    const removeToken = () => {
        localStorage.removeItem('token')
        setToken(null)
    }

    return {
        setToken: saveToken,
        token,
        removeToken,
    }
}
