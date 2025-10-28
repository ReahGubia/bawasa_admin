import { supabase } from './supabase'

export interface PaymentTransaction {
  id: string
  billing_id: string
  cashier_id: string
  transaction_date: string
  amount_paid: number
  created_at: string
  updated_at: string
}

export class PaymentTransactionsService {
  /**
   * Create a new payment transaction
   */
  static async createPaymentTransaction(transactionData: {
    billing_id: string
    cashier_id: string
    amount_paid: number
  }): Promise<{ data: PaymentTransaction | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .insert({
          billing_id: transactionData.billing_id,
          cashier_id: transactionData.cashier_id,
          amount_paid: transactionData.amount_paid,
          transaction_date: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating payment transaction:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error in createPaymentTransaction:', error)
      return { data: null, error }
    }
  }

  /**
   * Get payment transactions by cashier
   */
  static async getTransactionsByCashier(cashierId: string): Promise<{ data: PaymentTransaction[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('cashier_id', cashierId)
        .order('transaction_date', { ascending: false })

      if (error) {
        console.error('Error fetching payment transactions:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error in getTransactionsByCashier:', error)
      return { data: null, error }
    }
  }

  /**
   * Get payment transactions by billing
   */
  static async getTransactionsByBilling(billingId: string): Promise<{ data: PaymentTransaction[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('billing_id', billingId)
        .order('transaction_date', { ascending: false })

      if (error) {
        console.error('Error fetching payment transactions:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error in getTransactionsByBilling:', error)
      return { data: null, error }
    }
  }
}

