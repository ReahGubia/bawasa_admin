import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create client with anon key
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { water_meter_no } = body

    if (!water_meter_no) {
      return NextResponse.json(
        { error: 'Water meter number is required' },
        { status: 400 }
      )
    }

    // Check if water meter number already exists in consumers table
    const { data: existingMeter, error } = await supabase
      .from('consumers')
      .select('water_meter_no')
      .eq('water_meter_no', water_meter_no)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error checking existing meter:', error)
      return NextResponse.json(
        { error: 'Failed to validate water meter number' },
        { status: 500 }
      )
    }

    // If we found a record, the meter number exists
    const exists = !!existingMeter

    return NextResponse.json({
      exists,
      water_meter_no
    })

  } catch (error) {
    console.error('💥 Unexpected error checking meter number:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
