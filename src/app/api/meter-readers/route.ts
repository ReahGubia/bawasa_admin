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

    // Check if email already exists in accounts table
    const { data: existingAccount, error: checkError } = await supabase
      .from('accounts')
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

    // Step 1: Hash the password before saving
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    console.log('✅ Password hashed successfully')

    // Step 2: Create account record in accounts table first
    const accountData = {
      email,
      password: hashedPassword, // Now properly hashed
      full_name,
      full_address: full_address || null,
      mobile_no: mobile_no ? parseInt(mobile_no) : null,
      user_type: 'meter_reader' // Set user type as meter_reader for admin-created accounts
    }

    const { data: accountResult, error: accountError } = await supabase
      .from('accounts')
      .insert(accountData)
      .select()
      .single()

    if (accountError) {
      console.error('❌ Account creation failed:', accountError)
      return NextResponse.json(
        { error: `Failed to create account: ${accountError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Account created successfully:', accountResult.id)

    // Step 3: Create meter reader record in bawasa_meter_reader table
    const meterReaderData = {
      status: 'not_assigned', // Default status for new meter readers
      reader_id: accountResult.id, // Foreign key reference to accounts table (the meter reader's account)
      assigned_to: null // No consumer assigned initially
    }

    const { data: meterReaderResult, error: meterReaderError } = await supabase
      .from('bawasa_meter_reader')
      .insert(meterReaderData)
      .select()
      .single()

    if (meterReaderError) {
      console.error('❌ Meter reader record creation failed:', meterReaderError)
      return NextResponse.json(
        { error: `Account created but meter reader record failed: ${meterReaderError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Meter reader record created successfully:', meterReaderResult.id)
    
    // Return user data without password
    const responseData = {
      id: accountResult.id,
      email: accountResult.email,
      full_name: accountResult.full_name,
      full_address: accountResult.full_address,
      mobile_no: accountResult.mobile_no,
      created_at: accountResult.created_at,
      meter_reader_id: meterReaderResult.id,
      status: meterReaderResult.status
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
