import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase env vars missing. Check REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database operations
export const locationService = {
  // Insert a new location record
  async insertLocation(locationData) {
    try {
      const { data, error } = await supabase
        .from('locations')
        .insert([locationData])
        .select()
      
      if (error) throw error
      return { success: true, data: data[0] }
    } catch (error) {
      console.error('Error inserting location:', error)
      return { success: false, error: error.message }
    }
  },

  // Get all locations for a user
  async getLocationsByUser(userId, limit = 100) {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching locations:', error)
      return { success: false, error: error.message }
    }
  },

  // Get latest location for a user
  async getLatestLocation(userId) {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single()
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching latest location:', error)
      return { success: false, error: error.message }
    }
  },

  // Test database connection
  async testConnection() {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('count')
        .limit(1)
      
      if (error) throw error
      return { success: true, message: 'Database connection successful' }
    } catch (error) {
      console.error('Database connection failed:', error)
      return { success: false, error: error.message }
    }
  }
}
