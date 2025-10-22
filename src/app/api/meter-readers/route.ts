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
    const { email, password, full_name, mobile_no, full_address } = body

    // Validate required fields
    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, full_name' },
        { status: 400 }
      )
    }

    console.log('🚀 Creating meter reader account...', { email, full_name })

    // Check if email already exists
    const { data: existingAccount, error: checkError } = await supabase
      .from('meter_reader_accounts')
      .select('email')
      .eq('email', email)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error checking existing email:', checkError)
      return NextResponse.json(
        { error: 'Failed to validate email' },
        { status: 500 }
      )
    }

    if (existingAccount) {
      console.error('❌ Email already exists:', email)
      return NextResponse.json(
        { error: `Email ${email} already exists. Please use a different email.` },
        { status: 400 }
      )
    }

    console.log('✅ Email is unique:', email)

    // Hash the password before saving
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    console.log('✅ Password hashed successfully')

    // Create meter reader account in meter_reader_accounts table
    const meterReaderData = {
      email,
      password: hashedPassword, // Now properly hashed
      full_name,
      full_address: full_address || null,
      mobile_no: mobile_no ? parseInt(mobile_no) : null,
      created_at: new Date().toISOString(),
      last_signed_in: null
    }

    const { data: meterReaderResult, error: meterReaderError } = await supabase
      .from('meter_reader_accounts')
      .insert(meterReaderData)
      .select()
      .single()

    if (meterReaderError) {
      console.error('❌ Meter reader account creation failed:', meterReaderError)
      return NextResponse.json(
        { error: `Failed to create meter reader account: ${meterReaderError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Meter reader account created successfully:', meterReaderResult.id)
    
    // Return user data without password
    const responseData = {
      id: meterReaderResult.id,
      email: meterReaderResult.email,
      full_name: meterReaderResult.full_name,
      full_address: meterReaderResult.full_address,
      mobile_no: meterReaderResult.mobile_no,
      created_at: meterReaderResult.created_at
    }

    return NextResponse.json({ 
      success: true,
      data: responseData,
      message: 'Meter reader account created successfully'
    })

  } catch (error) {
    console.error('💥 Unexpected error in API route:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
