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
    
    // Get start date for last 12 months
    const startDate = new Date(currentYear, currentMonth - 11, 1)
    const endDate = new Date(currentYear, currentMonth + 1, 0)
    
    // Fetch all relevant bills in a single query - bills created in last 12 months
    const { data: allBills, error: billsError } = await supabase
      .from('bawasa_billings')
      .select('id, amount_paid, payment_date, payment_status, billing_month, created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .not('created_at', 'is', null)
    
    if (billsError) {
      console.error('❌ Error fetching bills:', billsError)
      return NextResponse.json(
        { error: 'Failed to fetch bills data' },
        { status: 500 }
      )
    }
    
    // Group by month and calculate revenue
    const monthlyMap = new Map<string, { revenue: number; billsCount: number }>()
    
    // Initialize all 12 months with zero values
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1)
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      monthlyMap.set(monthName, { revenue: 0, billsCount: 0 })
    }
    
    // Process all bills and aggregate by month
    allBills?.forEach(bill => {
      // Count bills by created_at (when bill was issued)
      if (bill.created_at) {
        const createdDate = new Date(bill.created_at)
        const monthName = createdDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        
        if (monthlyMap.has(monthName)) {
          const current = monthlyMap.get(monthName)!
          current.billsCount++
        }
      }
      
      // Calculate revenue from payments
      if (bill.payment_date && ['paid', 'partial'].includes(bill.payment_status)) {
        const paymentDate = new Date(bill.payment_date)
        const monthName = paymentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        
        if (monthlyMap.has(monthName)) {
          const current = monthlyMap.get(monthName)!
          current.revenue += bill.amount_paid || 0
        }
      }
    })
    
    const monthlyRevenue = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      revenue: Math.round(data.revenue * 100) / 100,
      billsCount: data.billsCount
    }))
    
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
