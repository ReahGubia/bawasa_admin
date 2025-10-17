import { supabase } from './supabase'

export interface MeterReading {
  id: string
  user_id_ref: string
  meter_type: string
  reading_value: number
  reading_date: string
  notes?: string
  status: 'pending' | 'confirmed' | 'rejected'
  created_at: string
  updated_at: string
  confirmed_by?: string
  confirmed_at?: string
}

export interface MeterReadingWithUser extends MeterReading {
  user_email: string
  user_name: string
}

export interface LatestMeterReadingByUser extends MeterReadingWithUser {
  total_readings: number
}

export class MeterReadingsService {
  /**
   * Fetch latest meter reading for each user
   */
  static async getLatestMeterReadingsByUser(): Promise<LatestMeterReadingByUser[]> {
    try {
      // First, get all readings with user info
      const { data, error } = await supabase
        .from('meter_readings')
        .select(`
          *,
          users!user_id_ref (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching meter readings:', error)
        throw new Error(`Failed to fetch meter readings: ${error.message}`)
      }

      // Group by user and get latest reading for each user
      const userGroups = new Map<string, MeterReadingWithUser[]>()
      
      // Transform and group the data
      const transformedData = (data || []).map(reading => ({
        ...reading,
        user_email: reading.users?.email || '',
        user_name: reading.users?.full_name || 'Unknown User'
      }))

      // Group readings by user_id_ref
      transformedData.forEach(reading => {
        if (!userGroups.has(reading.user_id_ref)) {
          userGroups.set(reading.user_id_ref, [])
        }
        userGroups.get(reading.user_id_ref)!.push(reading)
      })

      // Get latest reading for each user and add total count
      const latestReadings: LatestMeterReadingByUser[] = []
      userGroups.forEach((readings, userId) => {
        const latestReading = readings[0] // Already sorted by created_at desc
        latestReadings.push({
          ...latestReading,
          total_readings: readings.length
        })
      })

      // Sort by latest reading date
      return latestReadings.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    } catch (error) {
      console.error('Error in getLatestMeterReadingsByUser:', error)
      throw error
    }
  }

  /**
   * Fetch all meter readings with user information
   */
  static async getAllMeterReadings(): Promise<MeterReadingWithUser[]> {
    try {
      const { data, error } = await supabase
        .from('meter_readings')
        .select(`
          *,
          users!user_id_ref (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching meter readings:', error)
        throw new Error(`Failed to fetch meter readings: ${error.message}`)
      }

      // Transform the data to match our interface
      return (data || []).map(reading => ({
        ...reading,
        user_email: reading.users?.email || '',
        user_name: reading.users?.full_name || 'Unknown User'
      }))
    } catch (error) {
      console.error('Error in getAllMeterReadings:', error)
      throw error
    }
  }

  /**
   * Fetch meter readings by status
   */
  static async getMeterReadingsByStatus(status: 'pending' | 'confirmed' | 'rejected'): Promise<MeterReadingWithUser[]> {
    try {
      const { data, error } = await supabase
        .from('meter_readings')
        .select(`
          *,
          users!user_id_ref (
            email,
            full_name
          )
        `)
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching meter readings by status:', error)
        throw new Error(`Failed to fetch meter readings: ${error.message}`)
      }

      // Transform the data to match our interface
      return (data || []).map(reading => ({
        ...reading,
        user_email: reading.users?.email || '',
        user_name: reading.users?.full_name || 'Unknown User'
      }))
    } catch (error) {
      console.error('Error in getMeterReadingsByStatus:', error)
      throw error
    }
  }

  /**
   * Update meter reading status
   */
  static async updateMeterReadingStatus(
    readingId: string, 
    status: 'confirmed' | 'rejected',
    confirmedBy: string
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
        confirmed_by: confirmedBy,
        confirmed_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('meter_readings')
        .update(updateData)
        .eq('id', readingId)

      if (error) {
        console.error('Error updating meter reading status:', error)
        throw new Error(`Failed to update meter reading: ${error.message}`)
      }
    } catch (error) {
      console.error('Error in updateMeterReadingStatus:', error)
      throw error
    }
  }

  /**
   * Get meter reading statistics
   */
  static async getMeterReadingStats(): Promise<{
    total: number
    pending: number
    confirmed: number
    rejected: number
  }> {
    try {
      const { data, error } = await supabase
        .from('meter_readings')
        .select('status')

      if (error) {
        console.error('Error fetching meter reading stats:', error)
        throw new Error(`Failed to fetch meter reading stats: ${error.message}`)
      }

      const stats = {
        total: data?.length || 0,
        pending: data?.filter(r => r.status === 'pending').length || 0,
        confirmed: data?.filter(r => r.status === 'confirmed').length || 0,
        rejected: data?.filter(r => r.status === 'rejected').length || 0,
      }

      return stats
    } catch (error) {
      console.error('Error in getMeterReadingStats:', error)
      throw error
    }
  }

  /**
   * Search meter readings by user name or email
   */
  static async searchMeterReadings(query: string): Promise<MeterReadingWithUser[]> {
    try {
      const { data, error } = await supabase
        .from('meter_readings')
        .select(`
          *,
          users!user_id_ref (
            email,
            full_name
          )
        `)
        .or(`users.full_name.ilike.%${query}%,users.email.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error searching meter readings:', error)
        throw new Error(`Failed to search meter readings: ${error.message}`)
      }

      // Transform the data to match our interface
      return (data || []).map(reading => ({
        ...reading,
        user_email: reading.users?.email || '',
        user_name: reading.users?.full_name || 'Unknown User'
      }))
    } catch (error) {
      console.error('Error in searchMeterReadings:', error)
      throw error
    }
  }

  /**
   * Fetch meter readings for a specific user
   */
  static async getMeterReadingsByUserId(userId: string): Promise<MeterReadingWithUser[]> {
    try {
      const { data, error } = await supabase
        .from('meter_readings')
        .select(`
          *,
          users!user_id_ref (
            email,
            full_name
          )
        `)
        .eq('user_id_ref', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching meter readings by user ID:', error)
        throw new Error(`Failed to fetch meter readings: ${error.message}`)
      }

      // Transform the data to match our interface
      return (data || []).map(reading => ({
        ...reading,
        user_email: reading.users?.email || '',
        user_name: reading.users?.full_name || 'Unknown User'
      }))
    } catch (error) {
      console.error('Error in getMeterReadingsByUserId:', error)
      throw error
    }
  }
}
