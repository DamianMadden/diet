import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react'

import { useSession } from './AuthContext'

type UserData = {
  planId?: string | null
  weight?: number
  height?: number
  gender?: string
  dateOfBirth?: string
  goal?: number
  activityLevel?: number
}

type ProfileResponse = {
  planId: string | null
  weight: number
  height: number
  gender: string
  dateOfBirth: string
  goal: number
  activityLevel: number
}

type UserContextProps = {
  userData?: UserData | null
  setUserData: (data: UserData | null) => void
  updateUserData: (data: Partial<UserData>) => void
  refreshUserData: () => Promise<void>
  isLoading: boolean
}

const UserContext = createContext<UserContextProps>({
  userData: null,
  setUserData: () => null,
  updateUserData: () => null,
  refreshUserData: async () => {},
  isLoading: false,
})

// Use this hook to access the user data.
export function useUser(): UserContextProps {
  const value = use(UserContext)
  if (!value) {
    throw new Error('useUser must be wrapped in a <UserProvider />')
  }

  return value
}

export function UserProvider({ children }: PropsWithChildren) {
  const { session } = useSession()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUserProfile = async () => {
    if (!session?.access_token) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${session.token_type} ${session.access_token}`,
        },
      })

      if (response.ok) {
        const data: ProfileResponse = await response.json()
        setUserData({
          planId: data.planId,
          weight: data.weight,
          height: data.height,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth,
          goal: data.goal,
          activityLevel: data.activityLevel,
        })
      } else if (response.status === 404) {
        // Profile doesn't exist yet
        setUserData(null)
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      setUserData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserData = (data: Partial<UserData>) => {
    setUserData((prev) => ({
      ...prev,
      ...data,
    }))
  }

  // Fetch user profile on mount when session is available
  useEffect(() => {
    if (session?.access_token) {
      fetchUserProfile()
    } else {
      setUserData(null)
      setIsLoading(false)
    }
  }, [session?.access_token])

  return (
    <UserContext
      value={{
        userData,
        setUserData,
        updateUserData,
        refreshUserData: fetchUserProfile,
        isLoading,
      }}
    >
      {children}
    </UserContext>
  )
}
