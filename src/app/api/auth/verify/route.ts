import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create client with anon key
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    console.log('🔐 [Auth API] Attempting authentication for:', email)

    // Query the accounts table for the user
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('email', email)
      .single()

    if (accountError && accountError.code !== 'PGRST116') {
      console.error('❌ [Auth API] Error querying accounts:', accountError)
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      )
    }

    if (!account) {
      console.log('❌ [Auth API] User not found:', email)
      return NextResponse.json(
        { error: 'Invalid login credentials' },
        { status: 401 }
      )
    }

    console.log('✅ [Auth API] User found in accounts table')

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, account.password)
    
    if (!isPasswordValid) {
      console.log('❌ [Auth API] Invalid password for:', email)
      return NextResponse.json(
        { error: 'Invalid login credentials' },
        { status: 401 }
      )
    }

    console.log('✅ [Auth API] Password verified successfully')

    // Get consumer data from bawasa_consumers table
    const { data: consumer, error: consumerError } = await supabase
      .from('bawasa_consumers')
      .select('*')
      .eq('id', account.consumer_id)
      .single()

    if (consumerError) {
      console.error('❌ [Auth API] Error querying consumer data:', consumerError)
      return NextResponse.json(
        { error: 'Consumer data not found' },
        { status: 500 }
      )
    }

    console.log('✅ [Auth API] Consumer data retrieved')

    // Return user data (without password)
    const userData = {
      id: account.id,
      email: account.email,
      full_name: account.full_name,
      phone: account.mobile_no || '', // Use mobile_no field from accounts table
      full_address: account.full_address || '',
      consumer_id: account.consumer_id,
      water_meter_no: consumer.water_meter_no,
      created_at: account.created_at,
      updated_at: account.updated_at,
    }

    return NextResponse.json({
      success: true,
      user: userData,
      message: 'Authentication successful'
    })

  } catch (error) {
    console.error('💥 [Auth API] Unexpected error during authentication:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
