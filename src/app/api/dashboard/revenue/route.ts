import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create client with anon key
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET() {
  try {
    console.log('💰 Fetching revenue data from new table structure...')

    // Get current date and calculate date ranges
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    
    // Get last 12 months for monthly revenue
    const monthlyRevenue = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      // Fetch paid amounts for this month from bawasa_billings
      const { data: payments, error: paymentsError } = await supabase
        .from('bawasa_billings')
        .select('amount_paid')
        .in('payment_status', ['paid', 'partial'])
        .not('payment_date', 'is', null)
        .gte('payment_date', monthStart.toISOString().split('T')[0])
        .lte('payment_date', monthEnd.toISOString().split('T')[0])
      
      if (paymentsError) {
        console.error(`❌ Error fetching payments for ${monthName}:`, paymentsError)
        monthlyRevenue.push({
          month: monthName,
          revenue: 0,
          billsCount: 0
        })
        continue
      }
      
      const totalRevenue = payments?.reduce((sum, payment) => sum + (payment.amount_paid || 0), 0) || 0
      
      // Count bills issued in this month (based on billing_month field)
      const billingMonthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const { count: billsCount, error: billsError } = await supabase
        .from('bawasa_billings')
        .select('id', { count: 'exact', head: true })
        .eq('billing_month', billingMonthStr)
      
      if (billsError) {
        console.error(`❌ Error fetching bills count for ${monthName}:`, billsError)
      }
      
      monthlyRevenue.push({
        month: monthName,
        revenue: Math.round(totalRevenue * 100) / 100, // Round to 2 decimal places
        billsCount: billsCount || 0
      })
    }
    
    // Get total revenue statistics from bawasa_billings
    const [
      totalRevenueResult,
      paidBillsResult,
      unpaidBillsResult,
      partialBillsResult,
      overdueBillsResult
    ] = await Promise.all([
      // Total revenue from all paid amounts
      supabase
        .from('bawasa_billings')
        .select('amount_paid')
        .in('payment_status', ['paid', 'partial']),
      
      // Count of fully paid bills
      supabase
        .from('bawasa_billings')
        .select('id', { count: 'exact', head: true })
        .eq('payment_status', 'paid'),
      
      // Count of unpaid bills
      supabase
        .from('bawasa_billings')
        .select('id', { count: 'exact', head: true })
        .eq('payment_status', 'unpaid'),
      
      // Count of partial payments
      supabase
        .from('bawasa_billings')
        .select('id', { count: 'exact', head: true })
        .eq('payment_status', 'partial'),
      
      // Count of overdue bills
      supabase
        .from('bawasa_billings')
        .select('id', { count: 'exact', head: true })
        .eq('payment_status', 'overdue')
    ])
    
    // Check for errors
    if (totalRevenueResult.error) {
      console.error('❌ Error fetching total revenue:', totalRevenueResult.error)
      return NextResponse.json(
        { error: 'Failed to fetch total revenue data' },
        { status: 500 }
      )
    }
    
    const totalRevenue = totalRevenueResult.data?.reduce((sum, payment) => sum + (payment.amount_paid || 0), 0) || 0
    
    const revenueStats = {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      paidBills: paidBillsResult.count || 0,
      pendingBills: (unpaidBillsResult.count || 0) + (partialBillsResult.count || 0),
      overdueBills: overdueBillsResult.count || 0,
      monthlyRevenue
    }
    
    console.log('✅ Revenue data fetched successfully from new table structure:', revenueStats)
    return NextResponse.json({ data: revenueStats })
    
  } catch (error) {
    console.error('💥 Unexpected error in revenue API:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
