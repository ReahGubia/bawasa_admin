import { supabase } from './supabase'

export interface MeterReader {
  id: string
  user_id: string
  employee_id: string
  assigned_route: string | null
  territory: string | null
  supervisor_id: string | null
  hire_date: string | null
  is_active: boolean
  last_reading_date: string | null
  total_readings: number
  performance_rating: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface MeterReaderWithUser extends MeterReader {
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  last_login_at: string | null
  user_created_at: string
  supervisor_name: string | null
  supervisor_email: string | null
}

export interface CreateMeterReaderData {
  email: string
  password: string
  full_name: string
  phone?: string
  assigned_route?: string
  territory?: string
  supervisor_id?: string
  hire_date?: string
  notes?: string
}

export class MeterReaderService {
  /**
   * Fetch all meter readers with user information
   */
  static async getAllMeterReaders(): Promise<{ data: MeterReaderWithUser[] | null; error: any }> {
    try {
      console.log('🔍 Fetching meter readers from Supabase...')
      
      const { data, error } = await supabase
        .from('meter_readers_with_user')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('📊 Supabase response:', { data, error })
      
      if (error) {
        console.error('❌ Supabase error:', error)
        return { data: null, error }
      }

      return { data, error }
    } catch (error) {
      console.error('💥 Unexpected error fetching meter readers:', error)
      return { data: null, error }
    }
  }

  /**
   * Fetch a single meter reader by ID
   */
  static async getMeterReaderById(id: string): Promise<{ data: MeterReaderWithUser | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('meter_readers_with_user')
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
  static async createMeterReader(meterReaderData: CreateMeterReaderData): Promise<{ data: MeterReaderWithUser | null; error: any }> {
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
   * Update meter reader status (active/inactive)
   */
  static async updateMeterReaderStatus(id: string, isActive: boolean): Promise<{ data: MeterReader | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('meter_readers')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating meter reader status:', error)
      return { data: null, error }
    }
  }

  /**
   * Update meter reader information
   */
  static async updateMeterReader(id: string, updates: Partial<MeterReader>): Promise<{ data: MeterReader | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('meter_readers')
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
   * Delete a meter reader (soft delete by setting is_active to false)
   */
  static async deleteMeterReader(id: string): Promise<{ data: MeterReader | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('meter_readers')
        .update({ is_active: false })
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
   * Search meter readers by name, email, or employee ID
   */
  static async searchMeterReaders(query: string): Promise<{ data: MeterReaderWithUser[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('meter_readers_with_user')
        .select('*')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,employee_id.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      return { data, error }
    } catch (error) {
      console.error('Error searching meter readers:', error)
      return { data: null, error }
    }
  }

  /**
   * Get meter readers by territory
   */
  static async getMeterReadersByTerritory(territory: string): Promise<{ data: MeterReaderWithUser[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('meter_readers_with_user')
        .select('*')
        .eq('territory', territory)
        .order('created_at', { ascending: false })

      return { data, error }
    } catch (error) {
      console.error('Error fetching meter readers by territory:', error)
      return { data: null, error }
    }
  }

  /**
   * Get meter readers by assigned route
   */
  static async getMeterReadersByRoute(route: string): Promise<{ data: MeterReaderWithUser[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('meter_readers_with_user')
        .select('*')
        .eq('assigned_route', route)
        .order('created_at', { ascending: false })

      return { data, error }
    } catch (error) {
      console.error('Error fetching meter readers by route:', error)
      return { data: null, error }
    }
  }

  /**
   * Update meter reader performance metrics
   */
  static async updatePerformanceMetrics(id: string, metrics: {
    last_reading_date?: string
    total_readings?: number
    performance_rating?: number
  }): Promise<{ data: MeterReader | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('meter_readers')
        .update(metrics)
        .eq('id', id)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating performance metrics:', error)
      return { data: null, error }
    }
  }
}
