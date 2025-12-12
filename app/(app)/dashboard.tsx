import { StyleSheet, View } from 'react-native'

import { useSession } from '../../AuthContext'
import { Button, Text } from '../../components'
import { useApiClient } from '../../hooks/useApiClient'

const DashboardScreen = () => {
  const session = useSession()
  const { get } = useApiClient()

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Dashboard</Text>
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
    </View>
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
