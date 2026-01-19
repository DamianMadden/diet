import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  PanResponder,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'

import { Text } from '../../components'
import { useApiClient } from '../../hooks/useApiClient'
import { useUser } from '../../UserContext'

interface Meal {
  id: string
  name: string
  thumbnailUrl: string
  description: string
}

interface MealsResponse {
  meals: Meal[]
}

const SWIPE_THRESHOLD = 120

const PlanScreen = () => {
  const { get, post } = useApiClient()
  const { userData } = useUser()
  const [meals, setMeals] = useState<Meal[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [showDescription, setShowDescription] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const pan = new Animated.ValueXY()
  const descriptionHeight = new Animated.Value(0)

  const onRefresh = async () => {
    setRefreshing(true)
    await loadInitialMeals()
    setRefreshing(false)
  }

  const fetchMeals = async () => {
    try {
      const response = await get('meals')
      if (response.ok) {
        const data: MealsResponse = await response.json()
        setMeals((prev) => [...prev, ...data.meals])
      } else {
        Alert.alert('Error', 'Failed to fetch meals')
      }
    } catch (error) {
      Alert.alert('Error', `Failed to fetch meals: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const addMealToPlan = async (mealId: string) => {
    try {
      if (!userData?.planId) {
        Alert.alert('Error', 'No plan ID found. Please complete your profile first.')
        return
      }

      const planMealData = {
        planId: userData.planId,
        mealId: mealId,
        quantity: 1.0,
      }

      const response = await post('planmeal', planMealData)

      if (response.ok) {
        // Successfully added to plan
        console.log('Meal added to plan')
      } else {
        const errorText = await response.text()
        Alert.alert('Error', `Failed to add meal to plan: ${errorText}`)
      }
    } catch (error) {
      Alert.alert('Error', `Failed to add meal to plan: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const loadInitialMeals = async () => {
    setIsLoading(true)
    await fetchMeals()
    setIsLoading(false)
  }

  const prefetchMoreMeals = async () => {
    if (isFetchingMore) return

    setIsFetchingMore(true)
    await fetchMeals()
    setIsFetchingMore(false)
  }

  useEffect(() => {
    loadInitialMeals()
  }, [])

  useEffect(() => {
    // Prefetch more meals when we're 2 meals away from the end
    if (currentIndex >= meals.length - 2 && !isFetchingMore) {
      prefetchMoreMeals()
    }
  }, [currentIndex, meals.length])

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      // Only allow horizontal swipes when description is not shown
      // Allow vertical swipes to show/hide description
      if (Math.abs(gesture.dx) > Math.abs(gesture.dy)) {
        pan.setValue({ x: gesture.dx, y: 0 })
      } else if (gesture.dy < 0 && !showDescription) {
        // Swipe up to show description
        const progress = Math.min(Math.abs(gesture.dy) / 200, 1)
        descriptionHeight.setValue(progress * 150)
      } else if (gesture.dy > 0 && showDescription) {
        // Swipe down to hide description
        const progress = Math.max(1 - gesture.dy / 200, 0)
        descriptionHeight.setValue(progress * 150)
      }
    },
    onPanResponderRelease: (_, gesture) => {
      // Handle vertical swipes (show/hide description)
      if (Math.abs(gesture.dy) > Math.abs(gesture.dx)) {
        if (gesture.dy < -50 && !showDescription) {
          // Swipe up - show description
          setShowDescription(true)
          Animated.spring(descriptionHeight, {
            toValue: 150,
            useNativeDriver: false,
          }).start()
        } else if (gesture.dy > 50 && showDescription) {
          // Swipe down - hide description
          setShowDescription(false)
          Animated.spring(descriptionHeight, {
            toValue: 0,
            useNativeDriver: false,
          }).start()
        } else {
          // Reset to current state
          Animated.spring(descriptionHeight, {
            toValue: showDescription ? 150 : 0,
            useNativeDriver: false,
          }).start()
        }
        return
      }

      // Handle horizontal swipes
      if (gesture.dx > SWIPE_THRESHOLD) {
        // Swipe right - add to plan
        Animated.spring(pan, {
          toValue: { x: 500, y: 0 },
          useNativeDriver: false,
        }).start(() => {
          addMealToPlan(meals[currentIndex].id)
          nextMeal()
        })
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        // Swipe left - skip
        Animated.spring(pan, {
          toValue: { x: -500, y: 0 },
          useNativeDriver: false,
        }).start(() => {
          nextMeal()
        })
      } else {
        // Reset position
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start()
      }
    },
  })

  const nextMeal = () => {
    pan.setValue({ x: 0, y: 0 })
    setShowDescription(false)
    descriptionHeight.setValue(0)
    setCurrentIndex((prev) => prev + 1)
  }

  if (isLoading) {
    return (
      <ScrollView
        style={styles.loadingContainer}
        contentContainerStyle={styles.loadingContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading meals...</Text>
      </ScrollView>
    )
  }

  if (meals.length === 0) {
    return (
      <ScrollView
        style={styles.loadingContainer}
        contentContainerStyle={styles.loadingContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.loadingText}>No meals available</Text>
      </ScrollView>
    )
  }

  if (currentIndex >= meals.length) {
    return (
      <ScrollView
        style={styles.loadingContainer}
        contentContainerStyle={styles.loadingContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.loadingText}>No more meals available</Text>
      </ScrollView>
    )
  }

  const currentMeal = meals[currentIndex]

  const rotate = pan.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ['-10deg', '0deg', '10deg'],
  })

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Meal Plan</Text>

      <View style={styles.cardContainer}>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ translateX: pan.x }, { rotate }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <Image source={{ uri: currentMeal.thumbnailUrl }} style={styles.thumbnail} resizeMode="cover" />

          <View style={styles.cardContent}>
            <Text style={styles.mealName}>{currentMeal.name}</Text>
          </View>

          <Animated.View style={[styles.descriptionContainer, { height: descriptionHeight }]}>
            <Text style={styles.description}>{currentMeal.description}</Text>
          </Animated.View>
        </Animated.View>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionText}>← Swipe left to skip</Text>
        <Text style={styles.instructionText}>Swipe right to add →</Text>
        <Text style={styles.instructionText}>↑ Swipe up for details</Text>
      </View>

      {isFetchingMore && (
        <View style={styles.fetchingMore}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.fetchingText}>Loading more meals...</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: Dimensions.get('window').width - 40,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 300,
  },
  cardContent: {
    padding: 20,
  },
  mealName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  descriptionContainer: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  instructions: {
    marginTop: 20,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: '#999',
    marginVertical: 2,
  },
  fetchingMore: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  fetchingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
})

export default PlanScreen
