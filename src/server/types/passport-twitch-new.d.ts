declare module 'passport-twitch-new' {
    import { Strategy as PassportStrategy } from '@fastify/passport'
    import { Profile as PassportProfile } from 'passport'

    /**
     * Twitch-specific profile returned after a successful OAuth flow.
     */
    export interface TwitchProfile extends PassportProfile {
        id: string
        login: string
        display_name: string
        type: string
        broadcaster_type: string
        description: string
        profile_image_url: string
        offline_image_url: string
        view_count: number
        email?: string
        _access_token: string
        _refresh_token: string
        _expires_in: number
    }

    export interface StrategyOption {
        clientID: string
        clientSecret: string
        callbackURL: string
        scope?: string | string[]
        passReqToCallback?: boolean
        authorizationURL?: string
        tokenURL?: string
        profileURL?: string
    }

    export type VerifyFunction = (
        accessToken: string,
        refreshToken: string,
        profile: TwitchProfile,
        done: (
            err?: Error | null | unknown,
            user?: Express.User | false,
            info?: object,
        ) => void,
    ) => void

    export type VerifyFunctionWithRequest = (
        req: FastifyRequest,
        accessToken: string,
        refreshToken: string,
        profile: TwitchProfile,
        done: (
            err?: Error | null | unknown,
            user?: Express.User | false,
            info?: object,
        ) => void,
    ) => void

    export class Strategy extends PassportStrategy {
        constructor(options: StrategyOption, verify: VerifyFunction)
        constructor(
            options: StrategyOption & { passReqToCallback: true },
            verify: VerifyFunctionWithRequest,
        )
    }
}
