import { Stack } from 'expo-router'

export default function AppLayout() {
  // TODO: stateful consideration of initialRoute
  return (
    <Stack initialRouteName="profile">
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="profile" />
    </Stack>
  )
}
