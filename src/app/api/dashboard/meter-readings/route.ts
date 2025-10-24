import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create client with anon key
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET() {
  try {
    console.log('📊 Fetching recent meter readings...')

    // Fetch recent meter readings with user information
    const { data: meterReadings, error } = await supabase
      .from('bawasa_consumers')
      .select(`
        id,
        water_meter_no,
        present_reading,
        meter_reading_date,
        payment_status,
        created_at,
        accounts!consumer_id (
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('❌ Error fetching meter readings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch meter readings' },
        { status: 500 }
      )
    }

    // Transform the data to match the expected format
    const formattedReadings = meterReadings?.map(reading => ({
      id: reading.id,
      user: reading.accounts?.[0]?.full_name || 'Unknown User',
      value: reading.present_reading?.toString() || '0',
      status: reading.payment_status || 'unknown',
      date: new Date(reading.meter_reading_date).toLocaleDateString()
    })) || []

    console.log('✅ Recent meter readings fetched successfully')
    return NextResponse.json({ data: formattedReadings })

  } catch (error) {
    console.error('💥 Unexpected error in meter readings API:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
