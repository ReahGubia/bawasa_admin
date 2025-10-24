import { supabase } from './supabase'

export interface MeterReading {
  id: string
  consumer_id: string
  water_meter_no: string
  present_reading: number
  meter_reading_date: string
  payment_status: 'unpaid' | 'partial' | 'paid' | 'overdue'
  created_at: string
  updated_at: string
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
      // Get all consumer records with account information
      const { data, error } = await supabase
        .from('bawasa_consumers')
        .select(`
          *,
          accounts!consumer_id (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching meter readings:', error)
        throw new Error(`Failed to fetch meter readings: ${error.message}`)
      }

      // Group by consumer and get latest reading for each consumer
      const consumerGroups = new Map<string, MeterReadingWithUser[]>()
      
      // Transform and group the data
      const transformedData = (data || []).map(reading => ({
        ...reading,
        user_email: reading.accounts?.email || '',
        user_name: reading.accounts?.full_name || 'Unknown User'
      }))

      // Group readings by consumer_id
      transformedData.forEach(reading => {
        if (!consumerGroups.has(reading.consumer_id)) {
          consumerGroups.set(reading.consumer_id, [])
        }
        consumerGroups.get(reading.consumer_id)!.push(reading)
      })

      // Get latest reading for each consumer and add total count
      const latestReadings: LatestMeterReadingByUser[] = []
      consumerGroups.forEach((readings, consumerId) => {
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
        .from('bawasa_consumers')
        .select(`
          *,
          accounts!consumer_id (
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
        user_email: reading.accounts?.email || '',
        user_name: reading.accounts?.full_name || 'Unknown User'
      }))
    } catch (error) {
      console.error('Error in getAllMeterReadings:', error)
      throw error
    }
  }

  /**
   * Fetch meter readings by status
   */
  static async getMeterReadingsByStatus(status: 'unpaid' | 'partial' | 'paid' | 'overdue'): Promise<MeterReadingWithUser[]> {
    try {
      const { data, error } = await supabase
        .from('bawasa_consumers')
        .select(`
          *,
          accounts!consumer_id (
            email,
            full_name
          )
        `)
        .eq('payment_status', status)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching meter readings by status:', error)
        throw new Error(`Failed to fetch meter readings: ${error.message}`)
      }

      // Transform the data to match our interface
      return (data || []).map(reading => ({
        ...reading,
        user_email: reading.accounts?.email || '',
        user_name: reading.accounts?.full_name || 'Unknown User'
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
    status: 'unpaid' | 'partial' | 'paid' | 'overdue',
    confirmedBy: string
  ): Promise<void> {
    try {
      const updateData: any = {
        payment_status: status,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('bawasa_consumers')
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
    unpaid: number
    partial: number
    paid: number
    overdue: number
  }> {
    try {
      const { data, error } = await supabase
        .from('bawasa_consumers')
        .select('payment_status')

      if (error) {
        console.error('Error fetching meter reading stats:', error)
        throw new Error(`Failed to fetch meter reading stats: ${error.message}`)
      }

      const stats = {
        total: data?.length || 0,
        unpaid: data?.filter(r => r.payment_status === 'unpaid').length || 0,
        partial: data?.filter(r => r.payment_status === 'partial').length || 0,
        paid: data?.filter(r => r.payment_status === 'paid').length || 0,
        overdue: data?.filter(r => r.payment_status === 'overdue').length || 0,
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
        .from('bawasa_consumers')
        .select(`
          *,
          accounts!consumer_id (
            email,
            full_name
          )
        `)
        .or(`accounts.full_name.ilike.%${query}%,accounts.email.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error searching meter readings:', error)
        throw new Error(`Failed to search meter readings: ${error.message}`)
      }

      // Transform the data to match our interface
      return (data || []).map(reading => ({
        ...reading,
        user_email: reading.accounts?.email || '',
        user_name: reading.accounts?.full_name || 'Unknown User'
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
        .from('bawasa_consumers')
        .select(`
          *,
          accounts!consumer_id (
            email,
            full_name
          )
        `)
        .eq('consumer_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching meter readings by user ID:', error)
        throw new Error(`Failed to fetch meter readings: ${error.message}`)
      }

      // Transform the data to match our interface
      return (data || []).map(reading => ({
        ...reading,
        user_email: reading.accounts?.email || '',
        user_name: reading.accounts?.full_name || 'Unknown User'
      }))
    } catch (error) {
      console.error('Error in getMeterReadingsByUserId:', error)
      throw error
    }
  }
}
