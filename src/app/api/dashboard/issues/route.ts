import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create client with anon key
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET() {
  try {
    console.log('📊 Fetching recent issues...')

    // For now, return empty array to prevent dashboard errors
    // TODO: Implement proper issues fetching once issue_report table structure is confirmed
    console.log('ℹ️ Issues endpoint temporarily returning empty array')
    return NextResponse.json({ data: [] })

  } catch (error) {
    console.error('💥 Unexpected error in issues API:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
