import { useState } from 'react'
import type { Token } from '../../types/loginTypes'
import { jwtDecode } from 'jwt-decode'

export default function useToken() {
    const getToken = () => {
        const tokenString = localStorage.getItem('token')
        if (!tokenString) {
            return null
        }

        const userToken = JSON.parse(tokenString) as Token
        const token = userToken.token

        if (!token) {
            return null
        }

        try {
            const decoded = jwtDecode(token)
            const currentTime = Date.now() / 1000 // convert to seconds
            if (decoded?.exp < currentTime) {
                localStorage.removeItem('token')
                return null
            }
        } catch (_e) {
            localStorage.removeItem('token')
            return null
        }
        return token
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
