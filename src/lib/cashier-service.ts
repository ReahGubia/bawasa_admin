import { supabase } from './supabase'

export interface Account {
  id: number
  email: string | null
  password: string | null
  created_at: string
  full_name: string | null
  full_address: string | null
  last_signed_in: string | null
  mobile_no: number | null
  user_type: string | null
}

export interface Cashier {
  id: string
  account_id: number
  employee_id: string
  status: string | null
  hire_date: string
  termination_date: string | null
  created_at: string | null
  updated_at: string | null
}

export interface CashierWithAccount extends Cashier {
  account?: Account
}

export interface CashierWithStatus extends CashierWithAccount {
  status: string
  is_active: boolean
  last_login_at: string | null
  phone: string | null
  email: string | null
  full_name: string | null
  full_address: string | null
  mobile_no: number | null
}

export interface CreateCashierData {
  email: string
  password: string
  full_name: string
  full_address?: string
  mobile_no?: string
  hire_date: string
}

export class CashierService {
  static async getAllCashiers(): Promise<{ data: CashierWithStatus[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('cashiers')
        .select(`
          *,
          accounts!account_id (
            *
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching cashiers:', error)
        return { data: null, error }
      }

      const formattedCashiers = data?.map(cashier => this.formatCashierForDisplay(cashier)) || []
      return { data: formattedCashiers, error: null }
    } catch (error) {
      console.error('Unexpected error fetching cashiers:', error)
      return { data: null, error }
    }
  }

  static async getCashierById(id: string): Promise<{ data: CashierWithStatus | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('cashiers')
        .select(`
          *,
          accounts!account_id (
            *
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching cashier:', error)
        return { data: null, error }
      }

      const formattedCashier = this.formatCashierForDisplay(data)
      return { data: formattedCashier, error: null }
    } catch (error) {
      console.error('Unexpected error fetching cashier:', error)
      return { data: null, error }
    }
  }

  static async createCashier(cashierData: CreateCashierData): Promise<{ data: CashierWithStatus | null; error: any }> {
    try {
      // Hash the password
        const bcrypt = await import('bcryptjs')
      const hashedPassword = await bcrypt.hash(cashierData.password, 10)

      // Step 1: Create account record in accounts table
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .insert({
          email: cashierData.email,
          password: hashedPassword,
          full_name: cashierData.full_name,
          full_address: cashierData.full_address || null,
          mobile_no: cashierData.mobile_no ? parseInt(cashierData.mobile_no) : null,
          user_type: 'cashier'
        })
        .select()
        .single()

      if (accountError) {
        console.error('Error creating account:', accountError)
        return { data: null, error: accountError }
      }

      // Step 2: Create cashier record in cashiers table
      const { data: cashierData_result, error: cashierError } = await supabase
        .from('cashiers')
        .insert({
          account_id: accountData.id,
          hire_date: cashierData.hire_date,
          status: 'active'
        })
        .select()
        .single()

      if (cashierError) {
        console.error('Error creating cashier:', cashierError)
        // Rollback: delete the account if cashier creation fails
        await supabase.from('accounts').delete().eq('id', accountData.id)
        return { data: null, error: cashierError }
      }

      // Step 3: Fetch the complete cashier data with account info
      const { data: completeCashier, error: fetchError } = await supabase
        .from('cashiers')
        .select(`
          *,
          accounts!account_id (
            *
          )
        `)
        .eq('id', cashierData_result.id)
        .single()

      if (fetchError) {
        console.error('Error fetching complete cashier data:', fetchError)
        return { data: null, error: fetchError }
      }

      const formattedCashier = this.formatCashierForDisplay(completeCashier)
      return { data: formattedCashier, error: null }
    } catch (error) {
      console.error('Unexpected error creating cashier:', error)
      return { data: null, error }
    }
  }

  static async updateCashierStatus(id: string, isActive: boolean): Promise<{ error: any }> {
    try {
      const status = isActive ? 'active' : 'suspended'
      const { error } = await supabase
        .from('cashiers')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) {
        console.error('Error updating cashier status:', error)
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error('Unexpected error updating cashier status:', error)
      return { error }
    }
  }

  static async deleteCashier(id: string): Promise<{ error: any }> {
    try {
      // First get the account_id to delete the account as well
      const { data: cashier, error: fetchError } = await supabase
        .from('cashiers')
        .select('account_id')
        .eq('id', id)
        .single()

      if (fetchError) {
        console.error('Error fetching cashier for deletion:', fetchError)
        return { error: fetchError }
      }

      // Delete from cashiers table (this will cascade to accounts due to foreign key)
      const { error } = await supabase
        .from('cashiers')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting cashier:', error)
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error('Unexpected error deleting cashier:', error)
      return { error }
    }
  }

  static async searchCashiers(query: string): Promise<{ data: CashierWithStatus[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('cashiers')
        .select(`
          *,
          accounts!account_id (
            *
          )
        `)
        .or(`employee_id.ilike.%${query}%,accounts.full_name.ilike.%${query}%,accounts.email.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error searching cashiers:', error)
        return { data: null, error }
      }

      const formattedCashiers = data?.map(cashier => this.formatCashierForDisplay(cashier)) || []
      return { data: formattedCashiers, error: null }
    } catch (error) {
      console.error('Unexpected error searching cashiers:', error)
      return { data: null, error }
    }
  }

  static formatCashierForDisplay(cashier: any): CashierWithStatus {
    const account = cashier.accounts || {}
    return {
      id: cashier.id,
      account_id: cashier.account_id,
      employee_id: cashier.employee_id,
      status: cashier.status || 'active',
      hire_date: cashier.hire_date,
      termination_date: cashier.termination_date,
      created_at: cashier.created_at,
      updated_at: cashier.updated_at,
      account: account,
      is_active: cashier.status === 'active',
      last_login_at: account.last_signed_in || null,
      phone: account.mobile_no?.toString() || null,
      email: account.email || null,
      full_name: account.full_name || null,
      full_address: account.full_address || null,
      mobile_no: account.mobile_no || null
    }
  }
}
