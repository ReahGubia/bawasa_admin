import { supabase } from './supabase'

export interface Consumer {
  id: string
  water_meter_no: string
  billing_month: string
  meter_reading_date: string
  previous_reading: number
  present_reading: number
  consumption_cubic_meters: number
  consumption_10_or_below: number
  amount_10_or_below: number
  amount_10_or_below_with_discount: number
  consumption_over_10: number
  amount_over_10: number
  amount_current_billing: number
  arrears_to_be_paid: number
  total_amount_due: number
  due_date: string
  arrears_after_due_date: number | null
  payment_status: string
  payment_date: string | null
  amount_paid: number
  created_at: string
  updated_at: string
}

export interface Account {
  id: number
  email: string | null
  password: string | null
  created_at: string
  consumer_id: string | null
  full_name: string | null
  full_address: string | null
}

export interface ConsumerWithAccount extends Consumer {
  account?: Account
}

export interface ConsumerWithStatus extends ConsumerWithAccount {
  status: 'paid' | 'unpaid' | 'partial' | 'overdue'
}

export class ConsumerService {
  /**
   * Fetch all consumers from the bawasa_consumers table with account information
   */
  static async getAllConsumers(): Promise<{ data: ConsumerWithAccount[] | null; error: any }> {
    try {
      console.log('🔍 Fetching consumers from Supabase...')
      
      // Fetch consumers and accounts separately and combine them
      const { data: consumers, error: consumersError } = await supabase
        .from('bawasa_consumers')
        .select('*')
        .order('created_at', { ascending: false })

      if (consumersError) {
        console.error('❌ Consumers fetch failed:', consumersError)
        return { data: null, error: consumersError }
      }

      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('*')

      if (accountsError) {
        console.error('❌ Accounts fetch failed:', accountsError)
        return { data: null, error: accountsError }
      }

      // Combine the data
      const combinedData = consumers?.map(consumer => ({
        ...consumer,
        account: accounts?.find(account => account.consumer_id === consumer.id)
      })) || []

      console.log('✅ Successfully fetched consumers:', combinedData.length, 'consumers')
      return { data: combinedData, error: null }
    } catch (error) {
      console.error('💥 Unexpected error fetching consumers:', error)
      return { data: null, error }
    }
  }

  /**
   * Fetch a single consumer by ID
   */
  static async getConsumerById(id: string): Promise<{ data: Consumer | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('bawasa_consumers')
        .select('*')
        .eq('id', id)
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error fetching consumer:', error)
      return { data: null, error }
    }
  }

  /**
   * Update consumer payment status
   */
  static async updateConsumerPaymentStatus(id: string, paymentStatus: string): Promise<{ data: Consumer | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('bawasa_consumers')
        .update({ payment_status: paymentStatus })
        .eq('id', id)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating consumer payment status:', error)
      return { data: null, error }
    }
  }

  /**
   * Delete a consumer (hard delete)
   */
  static async deleteConsumer(id: string): Promise<{ data: Consumer | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('bawasa_consumers')
        .delete()
        .eq('id', id)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error deleting consumer:', error)
      return { data: null, error }
    }
  }

  /**
   * Search consumers by water meter number, billing month, or account details
   */
  static async searchConsumers(query: string): Promise<{ data: ConsumerWithAccount[] | null; error: any }> {
    try {
      // Fetch consumers and accounts separately
      const { data: consumers, error: consumersError } = await supabase
        .from('bawasa_consumers')
        .select('*')
        .or(`water_meter_no.ilike.%${query}%,billing_month.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (consumersError) {
        console.error('❌ Consumers search failed:', consumersError)
        return { data: null, error: consumersError }
      }

      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .or(`email.ilike.%${query}%,full_name.ilike.%${query}%,full_address.ilike.%${query}%`)

      if (accountsError) {
        console.error('❌ Accounts search failed:', accountsError)
        return { data: null, error: accountsError }
      }

      // Combine the data
      const combinedData = consumers?.map(consumer => ({
        ...consumer,
        account: accounts?.find(account => account.consumer_id === consumer.id)
      })) || []

      return { data: combinedData, error: null }
    } catch (error) {
      console.error('Error searching consumers:', error)
      return { data: null, error }
    }
  }

  /**
   * Helper function to determine consumer status based on payment status
   */
  static getConsumerStatus(consumer: Consumer): 'paid' | 'unpaid' | 'partial' | 'overdue' {
    return consumer.payment_status as 'paid' | 'unpaid' | 'partial' | 'overdue'
  }

  /**
   * Format consumer data for display
   */
  static formatConsumerForDisplay(consumer: ConsumerWithAccount): ConsumerWithStatus {
    return {
      ...consumer,
      status: this.getConsumerStatus(consumer)
    }
  }
}
