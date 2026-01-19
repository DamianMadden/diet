import { Stack } from 'expo-router'

import { UserProvider, useUser } from '../../UserContext'

function AppStack() {
  const { userData, isLoading } = useUser()

  // Wait for user data to load before determining initial route
  if (isLoading) {
    return null
  }

  const initialRoute = userData?.planId ? 'dashboard' : 'profile'

  return (
    <Stack initialRouteName={initialRoute}>
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="plan" options={{ headerShown: false }} />
    </Stack>
  )
}

export default function AppLayout() {
  return (
    <UserProvider>
      <AppStack />
    </UserProvider>
  )
}
