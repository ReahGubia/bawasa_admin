import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { MeterReadingsService } from '@/lib/meter-readings-service'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create client with anon key
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { month, year } = body

    if (!month || !year) {
      return NextResponse.json(
        { error: 'Month and year are required' },
        { status: 400 }
      )
    }

    console.log(`📊 Creating meter readings for ${month} ${year}...`)

    // Get all consumers
    const { data: consumers, error: consumersError } = await supabase
      .from('consumers')
      .select('id, water_meter_no')

    if (consumersError) {
      console.error('❌ Error fetching consumers:', consumersError)
      return NextResponse.json(
        { error: `Failed to fetch consumers: ${consumersError.message}` },
        { status: 500 }
      )
    }

    if (!consumers || consumers.length === 0) {
      console.log('ℹ️ No consumers found')
      return NextResponse.json({ count: 0, message: 'No consumers found' })
    }

    console.log(`📋 Found ${consumers.length} consumers`)

    // Set reading_date to the first day of the month
    const readingDate = new Date(year, getMonthNumber(month), 1).toISOString().split('T')[0]

    // Check if readings already exist for this month
    const { data: existingReadings, error: checkError } = await supabase
      .from('bawasa_meter_readings')
      .select('id, consumer_id, reading_date')
      .eq('reading_date', readingDate)

    if (checkError) {
      console.error('❌ Error checking existing readings:', checkError)
      return NextResponse.json(
        { error: `Failed to check existing readings: ${checkError.message}` },
        { status: 500 }
      )
    }

    console.log(`✅ Checked existing readings for ${readingDate}`)

    const existingConsumerIds = new Set(existingReadings?.map(r => r.consumer_id) || [])
    
    // Filter out consumers who already have readings for this month
    const consumersToProcess = consumers.filter(c => !existingConsumerIds.has(c.id))

    if (consumersToProcess.length === 0) {
      console.log('ℹ️ All consumers already have meter readings for this month')
      return NextResponse.json({ 
        count: 0, 
        message: 'All consumers already have readings for this month' 
      })
    }

    console.log(`📝 Creating readings for ${consumersToProcess.length} consumers...`)

    // Prepare readings to insert with previous_reading from last reading
    const readingsToInsert: Array<{
      consumer_id: string
      reading_date: string
      previous_reading: number
      present_reading: number  // Set to same as previous for now, meter reader will update
    }> = []

    for (const consumer of consumersToProcess) {
      // Get the last meter reading for this consumer to use as previous_reading
      const { data: lastReading, error: lastReadingError } = await supabase
        .from('bawasa_meter_readings')
        .select('present_reading')
        .eq('consumer_id', consumer.id)
        .order('reading_date', { ascending: false })
        .limit(1)
        .single()

      if (lastReadingError && lastReadingError.code !== 'PGRST116') {
        console.error(`⚠️ Error fetching last reading for consumer ${consumer.water_meter_no}:`, lastReadingError)
      }

      const previousReading = lastReading?.present_reading || 0
      const presentReading = previousReading // Initialize with same value, meter reader will update

      readingsToInsert.push({
        consumer_id: consumer.id,
        reading_date: readingDate,
        previous_reading: previousReading,
        present_reading: presentReading // This will be updated when meter reader visits
      })
    }

    console.log(`📤 Inserting ${readingsToInsert.length} meter readings...`)

    // Insert all readings in batch
    const { data: insertedReadings, error: insertError } = await supabase
      .from('bawasa_meter_readings')
      .insert(readingsToInsert)
      .select()

    if (insertError) {
      console.error('❌ Error inserting meter readings:', insertError)
      return NextResponse.json(
        { error: `Failed to insert meter readings: ${insertError.message}` },
        { status: 500 }
      )
    }

    console.log(`✅ Successfully created ${insertedReadings?.length || 0} meter readings for ${month} ${year}`)
    
    return NextResponse.json({ 
      success: true,
      count: insertedReadings?.length || 0,
      message: `Successfully created ${insertedReadings?.length || 0} meter reading records for ${month} ${year}`,
      data: insertedReadings
    })

  } catch (error) {
    console.error('💥 Unexpected error in create-monthly-readings API:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

/**
 * Helper function to convert month name to number (0-11)
 */
function getMonthNumber(month: string): number {
  const months: { [key: string]: number } = {
    'January': 0, 'February': 1, 'March': 2, 'April': 3,
    'May': 4, 'June': 5, 'July': 6, 'August': 7,
    'September': 8, 'October': 9, 'November': 10, 'December': 11
  }
  return months[month] ?? 0
}
