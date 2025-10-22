import { supabase } from './supabase'

export interface MeterReaderUser {
  id: string // UUID instead of number
  created_at: string
  full_name: string | null
  email: string | null
  password: string | null
  mobile_no: number | null
  full_address: string | null
  last_signed_in: string | null
}

export interface CreateMeterReaderData {
  email: string
  password: string
  full_name: string
  mobile_no?: string
  full_address?: string
}

export class MeterReaderService {
  /**
   * Fetch all meter reader users
   */
  static async getAllMeterReaders(): Promise<{ data: MeterReaderUser[] | null; error: any }> {
    try {
      console.log('🔍 Fetching meter reader users from meter_reader_accounts table...')
      
      const { data, error } = await supabase
        .from('meter_reader_accounts')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('📊 Supabase response:', { data, error })
      
      if (error) {
        console.error('❌ Supabase error:', error)
        return { data: null, error }
      }

      return { data, error }
    } catch (error) {
      console.error('💥 Unexpected error fetching meter reader users:', error)
      return { data: null, error }
    }
  }

  /**
   * Fetch a single meter reader by ID
   */
  static async getMeterReaderById(id: string): Promise<{ data: MeterReaderUser | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('meter_reader_accounts')
        .select('*')
        .eq('id', id)
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error fetching meter reader:', error)
      return { data: null, error }
    }
  }

  /**
   * Create a new meter reader user
   */
  static async createMeterReader(meterReaderData: CreateMeterReaderData): Promise<{ data: MeterReaderUser | null; error: any }> {
    try {
      console.log('🚀 Creating new meter reader via API...', meterReaderData)
      
      const response = await fetch('/api/meter-readers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meterReaderData),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ API request failed:', result.error)
        return { data: null, error: { message: result.error } }
      }

      console.log('✅ Meter reader creation completed successfully')
      return { data: result.data, error: null }

    } catch (error) {
      console.error('💥 Unexpected error creating meter reader:', error)
      return { data: null, error }
    }
  }

  /**
   * Update meter reader user information
   */
  static async updateMeterReader(id: string, updates: Partial<MeterReaderUser>): Promise<{ data: MeterReaderUser | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('meter_reader_accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating meter reader:', error)
      return { data: null, error }
    }
  }

  /**
   * Delete a meter reader user
   */
  static async deleteMeterReader(id: string): Promise<{ data: MeterReaderUser | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('meter_reader_accounts')
        .delete()
        .eq('id', id)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error deleting meter reader:', error)
      return { data: null, error }
    }
  }

  /**
   * Search meter readers by name or email
   */
  static async searchMeterReaders(query: string): Promise<{ data: MeterReaderUser[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('meter_reader_accounts')
        .select('*')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      return { data, error }
    } catch (error) {
      console.error('Error searching meter readers:', error)
      return { data: null, error }
    }
  }
}
