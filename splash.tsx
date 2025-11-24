import { SplashScreen } from 'expo-router'
import { useSession } from './AuthContext'

SplashScreen.preventAutoHideAsync()

export function SplashScreenController({ isReady }: { isReady: boolean }) {
  const { isLoading } = useSession()

  if (!isLoading && isReady) {
    SplashScreen.hide()
  }

  return null
}
