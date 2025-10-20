import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create client with anon key
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET() {
  try {
    console.log('📊 Fetching dashboard statistics...')

    // Fetch all statistics in parallel
    const [
      usersResult,
      meterReadingsResult,
      billsResult,
      issuesResult
    ] = await Promise.all([
      // Total users count
      supabase
        .from('users')
        .select('id', { count: 'exact', head: true }),
      
      // Total meter readings count
      supabase
        .from('meter_readings')
        .select('id', { count: 'exact', head: true }),
      
      // Pending bills count
      supabase
        .from('bills')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      
      // Open issues count
      supabase
        .from('issues')
        .select('id', { count: 'exact', head: true })
        .in('status', ['open', 'in_progress'])
    ])

    // Check for errors
    if (usersResult.error) {
      console.error('❌ Error fetching users:', usersResult.error)
      return NextResponse.json(
        { error: 'Failed to fetch users data' },
        { status: 500 }
      )
    }

    if (meterReadingsResult.error) {
      console.error('❌ Error fetching meter readings:', meterReadingsResult.error)
      return NextResponse.json(
        { error: 'Failed to fetch meter readings data' },
        { status: 500 }
      )
    }

    if (billsResult.error) {
      console.error('❌ Error fetching bills:', billsResult.error)
      return NextResponse.json(
        { error: 'Failed to fetch bills data' },
        { status: 500 }
      )
    }

    if (issuesResult.error) {
      console.error('❌ Error fetching issues:', issuesResult.error)
      return NextResponse.json(
        { error: 'Failed to fetch issues data' },
        { status: 500 }
      )
    }

    const stats = {
      totalUsers: usersResult.count || 0,
      totalMeterReadings: meterReadingsResult.count || 0,
      pendingBills: billsResult.count || 0,
      openIssues: issuesResult.count || 0
    }

    console.log('✅ Dashboard statistics fetched successfully:', stats)
    return NextResponse.json({ data: stats })

  } catch (error) {
    console.error('💥 Unexpected error in dashboard stats API:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
