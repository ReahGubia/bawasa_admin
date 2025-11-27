import { supabase } from './supabase'

export interface Consumer {
  id: string
  water_meter_no: string
  consumer_id: number | null
  registered_voter: boolean | null
  created_at: string
  updated_at: string
  is_suspended?: boolean
}

export interface Account {
  id: number
  email: string | null
  password: string | null
  created_at: string
  full_name: string | null
  full_address: string | null
  mobile_no: number | null
  user_type: string | null
  status?: string | null
}

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

export interface Billing {
  id: string
  consumer_id: string
  meter_reading_id: string | null
  billing_month: string
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

export interface ConsumerWithAccount extends Consumer {
  account?: Account
  latest_meter_reading?: MeterReading
  latest_billing?: Billing
}

export interface ConsumerWithStatus extends ConsumerWithAccount {
  status: 'paid' | 'unpaid' | 'partial' | 'overdue'
}

export class ConsumerService {
  /**
   * Fetch all consumers with account, latest meter reading, and billing info
   */
  static async getAllConsumers(): Promise<{ data: ConsumerWithAccount[] | null; error: any }> {
    try {
      const { data: consumers, error: consumersError } = await supabase
        .from('consumers')
        .select(`*, accounts!consumer_id (*)`)
        .order('created_at', { ascending: false })

      if (consumersError) return { data: null, error: consumersError }
      if (!consumers) return { data: [], error: null }

      const consumersWithDetails = await Promise.all(
        consumers.map(async (consumer: any) => {
          const account = consumer.accounts as any

          const { data: latestMeterReading } = await supabase
            .from('bawasa_meter_readings')
            .select('*')
            .eq('consumer_id', consumer.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          const { data: latestBilling } = await supabase
            .from('bawasa_billings')
            .select('*')
            .eq('consumer_id', consumer.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          return {
            ...consumer,
            account: account || null,
            latest_meter_reading: latestMeterReading || null,
            latest_billing: latestBilling || null
          }
        })
      )

      return { data: consumersWithDetails, error: null }
    } catch (error) {
      console.error('Error fetching consumers:', error)
      return { data: null, error }
    }
  }

  /**
   * Fetch a single consumer by ID
   */
  static async getConsumerById(id: string): Promise<{ data: ConsumerWithAccount | null; error: any }> {
    try {
      const { data: consumer, error: consumerError } = await supabase
        .from('consumers')
        .select(`*, accounts!consumer_id (*)`)
        .eq('id', id)
        .single()

      if (consumerError) return { data: null, error: consumerError }
      if (!consumer) return { data: null, error: null }

      const { data: latestMeterReading } = await supabase
        .from('bawasa_meter_readings')
        .select('*')
        .eq('consumer_id', consumer.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      const { data: latestBilling } = await supabase
        .from('bawasa_billings')
        .select('*')
        .eq('consumer_id', consumer.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      const account = consumer.accounts as any
      return {
        data: {
          ...consumer,
          account: account || null,
          latest_meter_reading: latestMeterReading || null,
          latest_billing: latestBilling || null
        },
        error: null
      }
    } catch (error) {
      console.error('Error fetching consumer:', error)
      return { data: null, error }
    }
  }

  /**
   * Update consumer payment status
   */
  static async updateConsumerPaymentStatus(id: string, paymentStatus: string): Promise<{ data: Billing | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('bawasa_billings')
        .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
        .eq('consumer_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating consumer payment status:', error)
      return { data: null, error }
    }
  }

  /**
   * Suspend or unsuspend a consumer
   */
  static async updateConsumerSuspension(consumerId: string, suspended: boolean): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase
        .from('consumers')
        .update({ is_suspended: suspended, updated_at: new Date().toISOString() })
        .eq('id', consumerId)
        .select()
        .single()

      return { data, error }
    } catch (err) {
      console.error('Error updating consumer suspension:', err)
      return { data: null, error: err }
    }
  }

  /**
   * Delete a consumer
   */
  static async deleteConsumer(id: string): Promise<{ data: Consumer | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('consumers')
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
   * Format consumer for display
   */
  static formatConsumerForDisplay(consumer: ConsumerWithAccount): ConsumerWithStatus {
    return {
      ...consumer,
      status: (consumer.latest_billing?.payment_status as 'paid' | 'unpaid' | 'partial' | 'overdue') || 'unpaid'
    }
  }

  /**
   * Suspend a consumer (sets status to 'suspended' in accounts table)
   */
  static async suspendConsumer(accountId: number): Promise<{ data: Account | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .update({ status: 'suspended' })
        .eq('id', accountId)
        .eq('user_type', 'consumer')
        .select()
        .single()

      if (error) {
        console.error('Error suspending consumer:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error suspending consumer:', error)
      return { data: null, error }
    }
  }

  /**
   * Unsuspend a consumer (sets status to 'active' in accounts table)
   */
  static async unsuspendConsumer(accountId: number): Promise<{ data: Account | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .update({ status: 'active' })
        .eq('id', accountId)
        .eq('user_type', 'consumer')
        .select()
        .single()

      if (error) {
        console.error('Error unsuspending consumer:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error unsuspending consumer:', error)
      return { data: null, error }
    }
  }

  /**
   * Change/Reset meter for a consumer
   * This creates a new meter reading record with a fresh starting point (0)
   * The meter number stays the same, but readings restart from 0
   * Also records the final reading before the meter change for billing purposes
   * Uses API route to bypass RLS with service role key
   */
  static async changeMeter(
    consumerId: string,
    newStartingReading: number,
    effectiveDate: string,
    reason: string,
    readingBeforeChange?: number // Final reading on old meter before change
  ): Promise<{ data: MeterReading | null; error: Error | null }> {
    try {
      console.log('🔧 [ConsumerService] Changing meter for consumer:', consumerId)
      console.log('📊 [ConsumerService] New starting reading:', newStartingReading)
      console.log('📊 [ConsumerService] Reading before change:', readingBeforeChange)
      console.log('📅 [ConsumerService] Effective date:', effectiveDate)
      console.log('📝 [ConsumerService] Reason:', reason)

      // Call API route which uses service role key to bypass RLS
      const response = await fetch('/api/admin/change-meter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consumerId,
          newStartingReading,
          effectiveDate,
          reason,
          readingBeforeChange
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ [ConsumerService] Error creating meter change reading:', result.error)
        return { data: null, error: new Error(result.error || 'Failed to change meter') }
      }

      console.log('✅ [ConsumerService] Meter change recorded successfully:', result.data)
      return { data: result.data, error: null }
    } catch (error) {
      console.error('💥 [ConsumerService] Unexpected error changing meter:', error)
      return { data: null, error: error instanceof Error ? error : new Error('An unexpected error occurred') }
    }
  }

  /**
   * Get meter change history for a consumer
   * Returns all meter readings that have "METER CHANGE" in remarks
   */
  static async getMeterChangeHistory(consumerId: string): Promise<{ data: MeterReading[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('bawasa_meter_readings')
        .select('*')
        .eq('consumer_id', consumerId)
        .ilike('remarks', '%METER CHANGE%')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching meter change history:', error)
        return { data: null, error: new Error(error.message) }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error fetching meter change history:', error)
      return { data: null, error: error instanceof Error ? error : new Error('An unexpected error occurred') }
    }
  }
}
