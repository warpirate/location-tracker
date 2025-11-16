import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase env vars missing. Check REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database operations
export const locationService = {
  // Upsert a location record (update if exists, insert if not)
  async insertLocation(locationData) {
    try {
      // First check if we already have a record for this device
      const { data: existingData, error: fetchError } = await supabase
        .from('locations')
        .select('id, last_updated')
        .eq('user_id', locationData.user_id)
        .maybeSingle()
      
      if (fetchError) throw fetchError
      
      // Add last_updated timestamp and time_since_update
      const now = new Date().toISOString()
      let time_since_update = 'just now'
      
      // If this is an update, calculate the time since last update
      if (existingData?.last_updated) {
        const lastUpdated = new Date(existingData.last_updated)
        const currentTime = new Date()
        const diffSeconds = Math.floor((currentTime - lastUpdated) / 1000)
        
        if (diffSeconds < 60) {
          time_since_update = `${diffSeconds} seconds ago`
        } else {
          const diffMinutes = Math.floor(diffSeconds / 60)
          if (diffMinutes < 60) {
            time_since_update = `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
          } else {
            const diffHours = Math.floor(diffMinutes / 60)
            if (diffHours < 24) {
              time_since_update = `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
            } else {
              const diffDays = Math.floor(diffHours / 24)
              time_since_update = `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
            }
          }
        }
      }
      
      const updatedData = {
        ...locationData,
        last_updated: now,
        time_since_update
      }
      
      let result
      
      if (existingData?.id) {
        // Update existing record
        console.log(`Updating existing location for ${locationData.user_id}`)
        const { data, error } = await supabase
          .from('locations')
          .update(updatedData)
          .eq('id', existingData.id)
          .select()
        
        if (error) throw error
        result = { success: true, data: data[0], isUpdate: true }
      } else {
        // Insert new record
        console.log(`Creating new location for ${locationData.user_id}`)
        const { data, error } = await supabase
          .from('locations')
          .insert([updatedData])
          .select()
        
        if (error) throw error
        result = { success: true, data: data[0], isUpdate: false }
      }
      
      return result
    } catch (error) {
      console.error('Error upserting location:', error)
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
