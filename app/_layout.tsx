import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { useEffect, useState } from 'react'

import { SessionProvider, useSession } from '../AuthContext'
import { Text } from '../components/Text'
import { SplashScreenController } from '../splash'
import { NAV_THEME } from '../theme'

async function initializeApp() {
  console.log('App initializing...')
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLEIDENTITY_ANDROID_CLIENT_ID,
    offlineAccess: true,
  })
  console.log('App initialized!')
}

const queryClient = new QueryClient()

function RootNavigator() {
  const { session, isLoading } = useSession()
  //const { colorScheme, isDarkColorScheme } = useColorScheme();

  // Don't render anything until the app is ready and fonts are loaded
  if (isLoading) {
    return <Text /*variant="primary"*/>Loading...</Text>
  }

  return (
    <NavThemeProvider value={NAV_THEME['light']}>
      <Stack>
        <Stack.Protected guard={!!session}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>

        <Stack.Protected guard={!session}>
          <Stack.Screen name="index" />
          <Stack.Screen name="signup" />
        </Stack.Protected>
      </Stack>
    </NavThemeProvider>
  )
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false)

  useEffect(() => {
    async function prepare() {
      try {
        // Run all your initialization tasks here
        await initializeApp()
        // You can add other tasks here
      } catch (e) {
        console.warn(e)
      } finally {
        // Tell the application to render
        setAppIsReady(true)
      }
    }

    prepare()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <SplashScreenController isReady={appIsReady} />
        <RootNavigator />
      </SessionProvider>
    </QueryClientProvider>
  )
}
