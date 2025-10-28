import { supabase } from './supabase'

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

export interface Consumer {
  id: string
  water_meter_no: string
  consumer_id: number | null
  registered_voter: boolean | null
  created_at: string
  updated_at: string
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

export interface BillingWithDetails extends Billing {
  consumer?: Consumer & {
    accounts?: Account
  }
  account?: Account
  meter_reading?: MeterReading
}

export class BillingService {
  /**
   * Fetch all billings with consumer and account information
   */
  static async getAllBillings(): Promise<{ data: BillingWithDetails[] | null; error: any }> {
    try {
      console.log('🔍 Fetching billings from new table structure...')
      
      // Fetch billings with consumer and account information
      // Only fetch billings where reading_assigned is true
      const { data: billings, error: billingsError } = await supabase
        .from('bawasa_billings')
        .select(`
          *,
          consumers!consumer_id (
            *,
            accounts!consumer_id (
              *
            )
          ),
          bawasa_meter_readings!meter_reading_id (
            *
          )
        `)
        .eq('reading_assigned', true)
        .order('created_at', { ascending: false })

      if (billingsError) {
        console.error('❌ Billings fetch failed:', billingsError)
        return { data: null, error: billingsError }
      }

      if (!billings || billings.length === 0) {
        console.log('📭 No billings found')
        return { data: [], error: null }
      }

      // Transform the data to match our interface
      const transformedBillings = billings.map(billing => {
        const consumer = billing.consumers as any
        const account = consumer?.accounts as any
        const meterReading = billing.bawasa_meter_readings as any

        return {
          ...billing,
          consumer: consumer ? {
            ...consumer,
            accounts: account || null
          } : null,
          account: account || null,
          meter_reading: meterReading || null
        }
      })

      console.log('✅ Successfully fetched billings:', transformedBillings.length, 'billings')
      return { data: transformedBillings, error: null }
    } catch (error) {
      console.error('💥 Unexpected error fetching billings:', error)
      return { data: null, error }
    }
  }

  /**
   * Fetch billings by payment status
   */
  static async getBillingsByStatus(status: 'unpaid' | 'partial' | 'paid' | 'overdue'): Promise<{ data: BillingWithDetails[] | null; error: any }> {
    try {
      const { data: billings, error: billingsError } = await supabase
        .from('bawasa_billings')
        .select(`
          *,
          consumers!consumer_id (
            *,
            accounts!consumer_id (
              *
            )
          ),
          bawasa_meter_readings!meter_reading_id (
            *
          )
        `)
        .eq('reading_assigned', true)
        .eq('payment_status', status)
        .order('created_at', { ascending: false })

      if (billingsError) {
        console.error('❌ Billings fetch by status failed:', billingsError)
        return { data: null, error: billingsError }
      }

      // Transform the data
      const transformedBillings = billings?.map(billing => {
        const consumer = billing.consumers as any
        const account = consumer?.accounts as any
        const meterReading = billing.bawasa_meter_readings as any

        return {
          ...billing,
          consumer: consumer ? {
            ...consumer,
            accounts: account || null
          } : null,
          account: account || null,
          meter_reading: meterReading || null
        }
      }) || []

      return { data: transformedBillings, error: null }
    } catch (error) {
      console.error('Error fetching billings by status:', error)
      return { data: null, error }
    }
  }

  /**
   * Search billings by consumer name, email, or water meter number
   */
  static async searchBillings(query: string): Promise<{ data: BillingWithDetails[] | null; error: any }> {
    try {
      // Search by consumer water meter number
      const { data: billingsByMeter, error: meterError } = await supabase
        .from('bawasa_billings')
        .select(`
          *,
          consumers!consumer_id (
            *,
            accounts!consumer_id (
              *
            )
          ),
          bawasa_meter_readings!meter_reading_id (
            *
          )
        `)
        .eq('reading_assigned', true)
        .ilike('consumers.water_meter_no', `%${query}%`)
        .order('created_at', { ascending: false })

      // Search by account details
      const { data: billingsByAccount, error: accountError } = await supabase
        .from('bawasa_billings')
        .select(`
          *,
          consumers!consumer_id (
            *,
            accounts!consumer_id (
              *
            )
          ),
          bawasa_meter_readings!meter_reading_id (
            *
          )
        `)
        .eq('reading_assigned', true)
        .or(`consumers.accounts.email.ilike.%${query}%,consumers.accounts.full_name.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (meterError || accountError) {
        console.error('❌ Billings search failed:', meterError || accountError)
        return { data: null, error: meterError || accountError }
      }

      // Combine and deduplicate results
      const allBillings = [...(billingsByMeter || []), ...(billingsByAccount || [])]
      const uniqueBillings = allBillings.filter((billing, index, self) => 
        index === self.findIndex(b => b.id === billing.id)
      )

      // Transform the data
      const transformedBillings = uniqueBillings.map(billing => {
        const consumer = billing.consumers as any
        const account = consumer?.accounts as any
        const meterReading = billing.bawasa_meter_readings as any

        return {
          ...billing,
          consumer: consumer ? {
            ...consumer,
            accounts: account || null
          } : null,
          account: account || null,
          meter_reading: meterReading || null
        }
      })

      return { data: transformedBillings, error: null }
    } catch (error) {
      console.error('Error searching billings:', error)
      return { data: null, error }
    }
  }

  /**
   * Update billing payment status
   */
  static async updateBillingStatus(id: string, status: 'unpaid' | 'partial' | 'paid' | 'overdue'): Promise<{ data: Billing | null; error: any }> {
    try {
      const updateData: any = {
        payment_status: status,
        updated_at: new Date().toISOString()
      }

      // If marking as paid, update payment_date and amount_paid
      if (status === 'paid') {
        updateData.payment_date = new Date().toISOString()
        // Get the current billing to get total_amount_due
        const { data: currentBilling } = await supabase
          .from('bawasa_billings')
          .select('total_amount_due')
          .eq('id', id)
          .single()
        
        if (currentBilling) {
          updateData.amount_paid = currentBilling.total_amount_due
        }
      }

      const { data, error } = await supabase
        .from('bawasa_billings')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating billing status:', error)
      return { data: null, error }
    }
  }

  /**
   * Get billing statistics
   */
  static async getBillingStats(): Promise<{
    total: number
    unpaid: number
    partial: number
    paid: number
    overdue: number
    totalRevenue: number
  }> {
    try {
      const { data, error } = await supabase
        .from('bawasa_billings')
        .select('payment_status, amount_paid')

      if (error) {
        console.error('Error fetching billing stats:', error)
        throw new Error(`Failed to fetch billing stats: ${error.message}`)
      }

      const stats = {
        total: data?.length || 0,
        unpaid: data?.filter(b => b.payment_status === 'unpaid').length || 0,
        partial: data?.filter(b => b.payment_status === 'partial').length || 0,
        paid: data?.filter(b => b.payment_status === 'paid').length || 0,
        overdue: data?.filter(b => b.payment_status === 'overdue').length || 0,
        totalRevenue: data?.reduce((sum, b) => sum + (b.amount_paid || 0), 0) || 0,
      }

      return stats
    } catch (error) {
      console.error('Error in getBillingStats:', error)
      throw error
    }
  }

  /**
   * Get revenue trends by month
   */
  static async getRevenueTrends(): Promise<{ month: string; revenue: number }[]> {
    try {
      const { data, error } = await supabase
        .from('bawasa_billings')
        .select('billing_month, amount_paid')
        .eq('payment_status', 'paid')

      if (error) {
        console.error('Error fetching revenue trends:', error)
        throw new Error(`Failed to fetch revenue trends: ${error.message}`)
      }

      // Group by billing month and sum revenue
      const monthlyRevenue = new Map<string, number>()
      data?.forEach(billing => {
        const month = billing.billing_month
        const currentRevenue = monthlyRevenue.get(month) || 0
        monthlyRevenue.set(month, currentRevenue + (billing.amount_paid || 0))
      })

      // Convert to array and sort by month
      const trends = Array.from(monthlyRevenue.entries()).map(([month, revenue]) => ({
        month,
        revenue
      })).sort((a, b) => a.month.localeCompare(b.month))

      return trends
    } catch (error) {
      console.error('Error in getRevenueTrends:', error)
      throw error
    }
  }
}
