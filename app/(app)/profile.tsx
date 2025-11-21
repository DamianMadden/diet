import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button, Text } from '../../components';

const ProfileScreen = () => {
  const router = useRouter();
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [goal, setGoal] = useState('');

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
        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
          placeholder="Enter age"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Activity Level</Text>
        <Picker
          selectedValue={activityLevel}
          style={styles.picker}
          onValueChange={(itemValue: string) => setActivityLevel(itemValue)}
        >
          <Picker.Item label="Select activity level" value="" />
          <Picker.Item label="Sedentary" value="sedentary" />
          <Picker.Item label="Lightly Active" value="lightly_active" />
          <Picker.Item label="Moderately Active" value="moderately_active" />
          <Picker.Item label="Very Active" value="very_active" />
        </Picker>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Goal</Text>
        <Picker selectedValue={goal} style={styles.picker} onValueChange={(itemValue: string) => setGoal(itemValue)}>
          <Picker.Item label="Select goal" value="" />
          <Picker.Item label="Lose Weight" value="lose_weight" />
          <Picker.Item label="Maintain Weight" value="maintain_weight" />
          <Picker.Item label="Gain Weight" value="gain_weight" />
        </Picker>
      </View>

      <Button onPress={() => router.navigate('dashboard')} variant="primary" size="medium">
        Go to Dashboard
      </Button>
    </ScrollView>
  );
};

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
});

export default ProfileScreen;
