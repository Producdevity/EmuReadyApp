import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-expo'
import * as SecureStore from 'expo-secure-store'
import { CONFIG } from '../constants/config'

// Clerk configuration for Expo
const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key)
    } catch (error) {
      console.error('Error retrieving token from SecureStore:', error)
      return null
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value)
    } catch (error) {
      console.error('Error saving token to SecureStore:', error)
      return
    }
  },
}

// Clerk publishable key from configuration
const CLERK_PUBLISHABLE_KEY = CONFIG.CLERK_PUBLISHABLE_KEY

if (!CLERK_PUBLISHABLE_KEY) {
  console.warn(
    'Missing Clerk Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your environment variables',
  )
}

// Auth helpers hook
export function useAuthHelpers() {
  const { isSignedIn, signOut: clerkSignOut, getToken } = useAuth()
  const { user: clerkUser } = useUser()

  const signOut = async () => {
    try {
      await clerkSignOut()
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const getAuthToken = async () => {
    try {
      if (!isSignedIn) return null
      return await getToken()
    } catch (error) {
      console.error('Error getting auth token:', error)
      return null
    }
  }

  return {
    isAuthenticated: isSignedIn,
    user: clerkUser,
    signOut,
    getAuthToken,
  }
}

// Transform Clerk user to our app user format
export function transformClerkUser(clerkUser: any) {
  if (!clerkUser) return null

  return {
    id: clerkUser.id,
    name: clerkUser.fullName || clerkUser.firstName || 'User',
    email: clerkUser.primaryEmailAddress?.emailAddress || '',
    avatar: clerkUser.imageUrl || null,
    joinedDate: clerkUser.createdAt
      ? new Date(clerkUser.createdAt).toISOString()
      : new Date().toISOString(),
  }
}

export { ClerkProvider, tokenCache, CLERK_PUBLISHABLE_KEY, useAuth, useUser }
