import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create client with anon key
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET() {
  try {
    console.log('📊 Fetching recent meter readings...')

    // Fetch recent meter readings with user information from new table structure
    const { data: meterReadings, error } = await supabase
      .from('bawasa_meter_readings')
      .select(`
        id,
        present_reading,
        previous_reading,
        consumption_cubic_meters,
        created_at,
        consumers!consumer_id (
          water_meter_no,
          accounts!consumer_id (
            full_name,
            email
          )
        ),
        bawasa_billings!meter_reading_id (
          payment_status
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
    const formattedReadings = meterReadings?.map(reading => {
      const consumer = reading.consumers as any
      const account = consumer?.accounts as any
      const billing = reading.bawasa_billings as any
      
      return {
        id: reading.id,
        user: account?.full_name || 'Unknown User',
        value: reading.present_reading?.toString() || '0',
        status: billing ? (billing.payment_status || 'billed') : 'submitted',
        date: new Date(reading.created_at).toLocaleDateString()
      }
    }) || []

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
