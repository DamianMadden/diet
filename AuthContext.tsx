import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin'
import dayjs from 'dayjs'
import { createContext, use, type PropsWithChildren } from 'react'

import { useStorageState } from './hooks/useStorageState'

type Session = {
  access_token: string
  refresh_token: string
  token_type: string
  expiration: dayjs.Dayjs
}

type TokenResponse = {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

type AuthContextProps = {
  signIn: () => void
  signOut: () => void
  refresh: () => void
  session?: Session | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextProps>({
  signIn: () => null,
  signOut: () => null,
  refresh: () => null,
  session: null,
  isLoading: false,
})

let refreshTokenPromise: Promise<void> | null = null

async function refreshAccessToken(refreshToken: string): Promise<TokenResponse | null> {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })

  if (!response.ok) {
    // If refresh fails, the user should be logged out.
    throw new Error('Failed to refresh token')
  }

  const data: TokenResponse = await response.json()
  return data
}

// Use this hook to access the user info.
export function useSession(): AuthContextProps {
  const value = use(AuthContext)
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />')
  }

  return value
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState<Session>('session')

  return (
    <AuthContext
      value={{
        signIn: async () => {
          try {
            await GoogleSignin.hasPlayServices()
            const response = await GoogleSignin.signIn()

            if (isSuccessResponse(response)) {
              const idToken = response.data.idToken

              const backendResponse = await fetch(process.env.EXPO_PUBLIC_BACKEND_URL + '/auth/google', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idToken: idToken }),
              })

              if (!backendResponse.ok) {
                throw new Error('Failed to authenticate with backend.')
              }

              const tokenResponse = await backendResponse.json()

              if (!tokenResponse.access_token) {
                throw new Error('Access token not found in backend response.')
              }

              // Store token response
              setSession({
                access_token: tokenResponse.access_token,
                refresh_token: tokenResponse.refresh_token,
                token_type: tokenResponse.token_type,
                expiration: dayjs().add(tokenResponse.expires_in, 'seconds'),
              })
            } else {
              // sign in was cancelled by user
            }
          } catch (error) {
            if (isErrorWithCode(error)) {
              switch (error.code) {
                case statusCodes.IN_PROGRESS:
                  // operation (eg. sign in) already in progress
                  break
                case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                  // Android only, play services not available or outdated
                  break
                default:
                // some other error happened
              }
            } else {
              // an error that's not related to google sign in occurred
            }
          }
        },
        signOut: () => {
          setSession(null)
        },
        refresh: async () => {
          // Check if token needs refreshing (e.g., expires in the next 60 seconds)
          const needsRefresh = !session.expiration || session.expiration < dayjs().add(60, 'seconds')
          if (!needsRefresh) return

          if (!session.refresh_token) {
            setSession(null)
          }

          // If a refresh is already in progress, wait for it to complete
          if (refreshTokenPromise) {
            await refreshTokenPromise
          } else {
            // Otherwise, start a new refresh
            refreshTokenPromise = (async () => {
              const tokenResponse = await refreshAccessToken(session.refresh_token!)
              if (!tokenResponse.access_token) {
                throw new Error('Access token not found in backend response.')
              }

              // Store token response
              setSession({
                access_token: tokenResponse.access_token,
                refresh_token: tokenResponse.refresh_token,
                token_type: tokenResponse.token_type,
                expiration: dayjs().add(tokenResponse.expires_in, 'seconds'),
              })
            })()

            try {
              await refreshTokenPromise
            } finally {
              // Clear the promise once it's settled.
              refreshTokenPromise = null
            }
          }
        },
        session,
        isLoading,
      }}
    >
      {children}
    </AuthContext>
  )
}
