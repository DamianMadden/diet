import { useRouter } from 'expo-router'
import { useState } from 'react'
import { RefreshControl, ScrollView, StyleSheet } from 'react-native'

import { useSession } from '../../AuthContext'
import { Button, Text } from '../../components'
import { useApiClient } from '../../hooks/useApiClient'
import { useUser } from '../../UserContext'

const DashboardScreen = () => {
  const router = useRouter()
  const session = useSession()
  const { get } = useApiClient()
  const { refreshUserData } = useUser()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await refreshUserData()
    setRefreshing(false)
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.header}>Dashboard</Text>
      <Button onPress={() => router.navigate('plan')} variant="primary" size="medium">
        Select Meals
      </Button>
      <Button
        onPress={async () => {
          var response = await get('authtest')
          console.log(await response.text())
        }}
        variant="primary"
        size="medium"
      >
        TestAuth
      </Button>
      <Button onPress={() => session.signOut()} variant="primary" size="medium">
        Logout
      </Button>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
})

export default DashboardScreen
