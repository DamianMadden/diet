import { Picker } from '@react-native-picker/picker'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Alert, ScrollView, StyleSheet, TextInput, View } from 'react-native'

import { Button, Text } from '../../components'
import { useApiClient } from '../../hooks/useApiClient'

const ProfileScreen = () => {
  const router = useRouter()
  const { post } = useApiClient()

  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [gender, setGender] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [activityLevel, setActivityLevel] = useState(-1)
  const [goal, setGoal] = useState(-1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    // Validate required fields
    if (!weight || !height || !gender || !dateOfBirth || activityLevel == -1 || goal == -1) {
      Alert.alert('Validation Error', 'Please fill in all fields')
      return
    }

    setIsSubmitting(true)
    try {
      const profileData = {
        weight: parseFloat(weight),
        height: parseFloat(height),
        gender: gender,
        dateOfBirth: dateOfBirth,
        goal: goal,
        activityLevel: activityLevel,
      }

      const response = await post('profile', profileData)

      if (response.ok) {
        Alert.alert('Success', 'Profile saved successfully')
        router.navigate('dashboard')
      } else {
        const errorText = await response.text()
        Alert.alert('Error', `Failed to save profile: ${errorText}`)
      }
    } catch (error) {
      Alert.alert('Error', `Failed to save profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Profile</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Weight (kg)</Text>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          placeholder="Enter weight"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Height (cm)</Text>
        <TextInput
          style={styles.input}
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
          placeholder="Enter height"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Gender (Biological)</Text>
        <Picker
          selectedValue={gender}
          style={styles.picker}
          onValueChange={(itemValue: string) => setGender(itemValue)}
        >
          <Picker.Item label="Select gender" value="" />
          <Picker.Item label="Male" value="male" />
          <Picker.Item label="Female" value="female" />
        </Picker>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Date of Birth</Text>
        <TextInput style={styles.input} value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="YYYY-MM-DD" />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Activity Level</Text>
        <Picker
          selectedValue={activityLevel}
          style={styles.picker}
          onValueChange={(itemValue: number) => setActivityLevel(itemValue)}
        >
          <Picker.Item label="Select activity level" value={-1} />
          <Picker.Item label="Sedentary" value={0} />
          <Picker.Item label="Lightly Active" value={1} />
          <Picker.Item label="Moderately Active" value={2} />
          <Picker.Item label="Active" value={3} />
          <Picker.Item label="Very Active" value={4} />
          <Picker.Item label="Extremely Active" value={5} />
        </Picker>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Goal</Text>
        <Picker selectedValue={goal} style={styles.picker} onValueChange={(itemValue: number) => setGoal(itemValue)}>
          <Picker.Item label="Select goal" value={-1} />
          <Picker.Item label="Lose Weight Fast" value={0} />
          <Picker.Item label="Lose Weight" value={1} />
          <Picker.Item label="Maintain Weight" value={2} />
          <Picker.Item label="Gain Weight" value={3} />
          <Picker.Item label="Gain Weight Fast" value={4} />
        </Picker>
      </View>

      <Button onPress={handleSubmit} variant="primary" size="medium" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Profile'}
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
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    height: 50,
  },
})

export default ProfileScreen
