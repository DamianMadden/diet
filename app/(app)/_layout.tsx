import { Stack } from 'expo-router'

export default function AppLayout() {
  // TODO: stateful consideration of initialRoute
  return (
    <Stack initialRouteName="profile">
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
    </Stack>
  )
}
