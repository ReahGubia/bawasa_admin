import { supabase } from './supabase'

export interface MeterReading {
  id: string
  consumer_id: string
  reading_date: string
  previous_reading: number
  present_reading: number
  consumption_cubic_meters: number
  created_at: string
  updated_at: string
}

export interface MeterReadingWithUser extends MeterReading {
  user_email: string
  user_name: string
  water_meter_no: string
  payment_status: 'unpaid' | 'partial' | 'paid' | 'overdue'
  meter_reading_date: string // Alias for reading_date for compatibility
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
      // Get meter readings with consumer and account information
      const { data, error } = await supabase
        .from('bawasa_meter_readings')
        .select(`
          *,
          consumers!consumer_id (
            water_meter_no,
            accounts!consumer_id (
              email,
              full_name
            )
          ),
          bawasa_billings!meter_reading_id (
            payment_status
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
      const transformedData = (data || []).map(reading => {
        const consumer = reading.consumers as any
        const account = consumer?.accounts as any
        const billing = reading.bawasa_billings as any
        
        return {
          id: reading.id,
          consumer_id: reading.consumer_id,
          reading_date: reading.reading_date,
          meter_reading_date: reading.reading_date, // Alias for compatibility
          previous_reading: reading.previous_reading,
          present_reading: reading.present_reading,
          consumption_cubic_meters: reading.consumption_cubic_meters,
          created_at: reading.created_at,
          updated_at: reading.updated_at,
          water_meter_no: consumer?.water_meter_no || '',
          user_email: account?.email || '',
          user_name: account?.full_name || 'Unknown User',
          payment_status: billing?.[0]?.payment_status || 'unpaid'
        }
      })

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
        .from('bawasa_meter_readings')
        .select(`
          *,
          consumers!consumer_id (
            water_meter_no,
            accounts!consumer_id (
              email,
              full_name
            )
          ),
          bawasa_billings!meter_reading_id (
            payment_status
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching meter readings:', error)
        throw new Error(`Failed to fetch meter readings: ${error.message}`)
      }

      // Transform the data to match our interface
      return (data || []).map(reading => {
        const consumer = reading.consumers as any
        const account = consumer?.accounts as any
        const billing = reading.bawasa_billings as any
        
        return {
          id: reading.id,
          consumer_id: reading.consumer_id,
          reading_date: reading.reading_date,
          meter_reading_date: reading.reading_date, // Alias for compatibility
          previous_reading: reading.previous_reading,
          present_reading: reading.present_reading,
          consumption_cubic_meters: reading.consumption_cubic_meters,
          created_at: reading.created_at,
          updated_at: reading.updated_at,
          water_meter_no: consumer?.water_meter_no || '',
          user_email: account?.email || '',
          user_name: account?.full_name || 'Unknown User',
          payment_status: billing?.[0]?.payment_status || 'unpaid'
        }
      })
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
        .from('bawasa_meter_readings')
        .select(`
          *,
          consumers!consumer_id (
            water_meter_no,
            accounts!consumer_id (
              email,
              full_name
            )
          ),
          bawasa_billings!meter_reading_id (
            payment_status
          )
        `)
        .eq('bawasa_billings.payment_status', status)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching meter readings by status:', error)
        throw new Error(`Failed to fetch meter readings: ${error.message}`)
      }

      // Transform the data to match our interface
      return (data || []).map(reading => {
        const consumer = reading.consumers as any
        const account = consumer?.accounts as any
        const billing = reading.bawasa_billings as any
        
        return {
          id: reading.id,
          consumer_id: reading.consumer_id,
          reading_date: reading.reading_date,
          meter_reading_date: reading.reading_date, // Alias for compatibility
          previous_reading: reading.previous_reading,
          present_reading: reading.present_reading,
          consumption_cubic_meters: reading.consumption_cubic_meters,
          created_at: reading.created_at,
          updated_at: reading.updated_at,
          water_meter_no: consumer?.water_meter_no || '',
          user_email: account?.email || '',
          user_name: account?.full_name || 'Unknown User',
          payment_status: billing?.[0]?.payment_status || 'unpaid'
        }
      })
    } catch (error) {
      console.error('Error in getMeterReadingsByStatus:', error)
      throw error
    }
  }

  /**
   * Update meter reading status (updates the billing record)
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

      // Update the billing record associated with this meter reading
      const { error } = await supabase
        .from('bawasa_billings')
        .update(updateData)
        .eq('meter_reading_id', readingId)

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
        .from('bawasa_billings')
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
        .from('bawasa_meter_readings')
        .select(`
          *,
          consumers!consumer_id (
            water_meter_no,
            accounts!consumer_id (
              email,
              full_name
            )
          ),
          bawasa_billings!meter_reading_id (
            payment_status
          )
        `)
        .or(`consumers.accounts.full_name.ilike.%${query}%,consumers.accounts.email.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error searching meter readings:', error)
        throw new Error(`Failed to search meter readings: ${error.message}`)
      }

      // Transform the data to match our interface
      return (data || []).map(reading => {
        const consumer = reading.consumers as any
        const account = consumer?.accounts as any
        const billing = reading.bawasa_billings as any
        
        return {
          id: reading.id,
          consumer_id: reading.consumer_id,
          reading_date: reading.reading_date,
          meter_reading_date: reading.reading_date, // Alias for compatibility
          previous_reading: reading.previous_reading,
          present_reading: reading.present_reading,
          consumption_cubic_meters: reading.consumption_cubic_meters,
          created_at: reading.created_at,
          updated_at: reading.updated_at,
          water_meter_no: consumer?.water_meter_no || '',
          user_email: account?.email || '',
          user_name: account?.full_name || 'Unknown User',
          payment_status: billing?.[0]?.payment_status || 'unpaid'
        }
      })
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
        .from('bawasa_meter_readings')
        .select(`
          *,
          consumers!consumer_id (
            water_meter_no,
            consumer_id,
            accounts!consumer_id (
              email,
              full_name
            )
          ),
          bawasa_billings!meter_reading_id (
            payment_status
          )
        `)
        .eq('consumer_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching meter readings by user ID:', error)
        throw new Error(`Failed to fetch meter readings: ${error.message}`)
      }

      // Transform the data to match our interface
      return (data || []).map(reading => {
        const consumer = reading.consumers as any
        const account = consumer?.accounts as any
        const billing = reading.bawasa_billings as any
        
        return {
          id: reading.id,
          consumer_id: reading.consumer_id,
          reading_date: reading.reading_date,
          meter_reading_date: reading.reading_date, // Alias for compatibility
          previous_reading: reading.previous_reading,
          present_reading: reading.present_reading,
          consumption_cubic_meters: reading.consumption_cubic_meters,
          created_at: reading.created_at,
          updated_at: reading.updated_at,
          water_meter_no: consumer?.water_meter_no || '',
          user_email: account?.email || '',
          user_name: account?.full_name || 'Unknown User',
          payment_status: billing?.[0]?.payment_status || 'unpaid'
        }
      })
    } catch (error) {
      console.error('Error in getMeterReadingsByUserId:', error)
      throw error
    }
  }
}
