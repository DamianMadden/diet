import { useSession } from '../AuthContext'

export const useApiClient = () => {
  const { session, refresh, signOut } = useSession()

  const customFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    // Update tokens if necessary
    refresh()
    let { access_token, token_type } = session

    if (!access_token) {
      // If there's no token after attempting a refresh, throw an error.
      // This will likely happen if the refresh token is invalid and the user is logged out.
      throw new Error('Not authenticated')
    }

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
      Authorization: `${token_type} ${access_token}`,
    }

    const requestOptions: RequestInit = {
      ...options,
      headers: defaultHeaders,
    }

    // Make the API call
    const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/${endpoint}`, requestOptions)

    // Handle 401 Unauthorized from the server, which might indicate a revoked token
    if (response.status === 401) {
      signOut()
      throw new Error('Session expired. Please log in again.')
    }

    return response
  }

  return {
    get: (endpoint: string, options?: RequestInit) => customFetch(endpoint, { ...options, method: 'GET' }),
    post: (endpoint: string, body: any, options?: RequestInit) =>
      customFetch(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint: string, body: any, options?: RequestInit) =>
      customFetch(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint: string, options?: RequestInit) => customFetch(endpoint, { ...options, method: 'DELETE' }),
  }
}
