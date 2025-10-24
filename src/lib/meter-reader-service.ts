import { supabase } from './supabase'

export interface MeterReaderUser {
  id: number // Account ID from accounts table
  created_at: string
  full_name: string | null
  email: string | null
  password: string | null
  mobile_no: number | null
  full_address: string | null
  last_signed_in: string | null
  user_type: string | null
  meter_reader_id: number // ID from bawasa_meter_reader table
  status: string | null // Status from bawasa_meter_reader table
  assigned_to: string | null // UUID of assigned consumer from bawasa_consumers table
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
      console.log('🔍 Fetching meter reader users from accounts and bawasa_meter_reader tables...')
      
      const { data, error } = await supabase
        .from('accounts')
        .select(`
          *,
          bawasa_meter_reader!reader_id (
            id,
            status,
            created_at,
            assigned_to
          )
        `)
        .eq('user_type', 'meter_reader')
        .order('created_at', { ascending: false })

      console.log('📊 Supabase response:', { data, error })
      
      if (error) {
        console.error('❌ Supabase error:', error)
        return { data: null, error }
      }

      // Transform the data to match the interface
      const transformedData = (data || []).map(account => ({
        id: account.id,
        created_at: account.created_at,
        full_name: account.full_name,
        email: account.email,
        password: account.password,
        mobile_no: account.mobile_no,
        full_address: account.full_address,
        last_signed_in: account.last_signed_in,
        user_type: account.user_type,
        meter_reader_id: account.bawasa_meter_reader?.id || null,
        status: account.bawasa_meter_reader?.status || null,
        assigned_to: account.bawasa_meter_reader?.assigned_to || null
      }))

      return { data: transformedData, error: null }
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
        .from('accounts')
        .select(`
          *,
          bawasa_meter_reader!reader_id (
            id,
            status,
            created_at,
            assigned_to
          )
        `)
        .eq('id', id)
        .eq('user_type', 'meter_reader')
        .single()

      if (error) {
        return { data: null, error }
      }

      // Transform the data to match the interface
      const transformedData = {
        id: data.id,
        created_at: data.created_at,
        full_name: data.full_name,
        email: data.email,
        password: data.password,
        mobile_no: data.mobile_no,
        full_address: data.full_address,
        last_signed_in: data.last_signed_in,
        user_type: data.user_type,
        meter_reader_id: data.bawasa_meter_reader?.id || null,
        status: data.bawasa_meter_reader?.status || null,
        assigned_to: data.bawasa_meter_reader?.assigned_to || null
      }

      return { data: transformedData, error: null }
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
      // Separate account updates from meter reader updates
      const accountUpdates: any = {}
      const meterReaderUpdates: any = {}
      
      // Map fields to appropriate tables
      if (updates.email !== undefined) accountUpdates.email = updates.email
      if (updates.full_name !== undefined) accountUpdates.full_name = updates.full_name
      if (updates.full_address !== undefined) accountUpdates.full_address = updates.full_address
      if (updates.mobile_no !== undefined) accountUpdates.mobile_no = updates.mobile_no
      if (updates.password !== undefined) accountUpdates.password = updates.password
      if (updates.status !== undefined) meterReaderUpdates.status = updates.status

      // Update account first
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .update(accountUpdates)
        .eq('id', id)
        .eq('user_type', 'meter_reader')
        .select()
        .single()

      if (accountError) {
        return { data: null, error: accountError }
      }

      // Update meter reader record if needed
      if (Object.keys(meterReaderUpdates).length > 0) {
        const { data: meterReaderData, error: meterReaderError } = await supabase
          .from('bawasa_meter_reader')
          .update(meterReaderUpdates)
          .eq('reader_id', id)
          .select()
          .single()

        if (meterReaderError) {
          return { data: null, error: meterReaderError }
        }

        // Combine the data
        const combinedData = {
          ...accountData,
          meter_reader_id: meterReaderData.id,
          status: meterReaderData.status
        }

        return { data: combinedData, error: null }
      }

      return { data: accountData, error: null }
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
      // First delete the meter reader record
      const { data: meterReaderData, error: meterReaderError } = await supabase
        .from('bawasa_meter_reader')
        .delete()
        .eq('reader_id', id)
        .select()
        .single()

      if (meterReaderError) {
        console.error('Error deleting meter reader record:', meterReaderError)
        return { data: null, error: meterReaderError }
      }

      // Then delete the account
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id)
        .eq('user_type', 'meter_reader')
        .select()
        .single()

      if (accountError) {
        console.error('Error deleting account:', accountError)
        return { data: null, error: accountError }
      }

      // Combine the data for response
      const combinedData = {
        ...accountData,
        meter_reader_id: meterReaderData.id,
        status: meterReaderData.status
      }

      return { data: combinedData, error: null }
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
        .from('accounts')
        .select(`
          *,
          bawasa_meter_reader!reader_id (
            id,
            status,
            created_at,
            assigned_to
          )
        `)
        .eq('user_type', 'meter_reader')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) {
        return { data: null, error }
      }

      // Transform the data to match the interface
      const transformedData = (data || []).map(account => ({
        id: account.id,
        created_at: account.created_at,
        full_name: account.full_name,
        email: account.email,
        password: account.password,
        mobile_no: account.mobile_no,
        full_address: account.full_address,
        last_signed_in: account.last_signed_in,
        user_type: account.user_type,
        meter_reader_id: account.bawasa_meter_reader?.id || null,
        status: account.bawasa_meter_reader?.status || null,
        assigned_to: account.bawasa_meter_reader?.assigned_to || null
      }))

      return { data: transformedData, error: null }
    } catch (error) {
      console.error('Error searching meter readers:', error)
      return { data: null, error }
    }
  }
}
