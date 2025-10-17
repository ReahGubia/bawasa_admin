import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create client with anon key
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, full_name, phone, assigned_route, territory, supervisor_id, hire_date, notes } = body

    // Validate required fields
    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, full_name' },
        { status: 400 }
      )
    }

    console.log('🚀 Creating meter reader via signup flow...', { email, full_name })

    // Step 1: Create auth user using signup
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          account_type: 'staff'
        }
      }
    })

    if (authError) {
      console.error('❌ Auth user creation failed:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      console.error('❌ No user returned from auth creation')
      return NextResponse.json(
        { error: 'Failed to create auth user' },
        { status: 500 }
      )
    }

    console.log('✅ Auth user created:', authData.user.id)

    // Step 2: Create user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        auth_user_id: authData.user.id,
        email,
        full_name,
        phone,
        account_type: 'staff'
      })
      .select()
      .single()

    if (userError) {
      console.error('❌ User profile creation failed:', userError)
      return NextResponse.json(
        { error: userError.message },
        { status: 400 }
      )
    }

    console.log('✅ User profile created:', userData.id)

    // Step 3: Create meter reader record
    const { data: meterReaderData, error: meterReaderError } = await supabase
      .from('meter_readers')
      .insert({
        user_id: userData.id,
        assigned_route: assigned_route || null,
        territory: territory || null,
        supervisor_id: supervisor_id || null,
        hire_date: hire_date || null,
        notes: notes || null
      })
      .select()
      .single()

    if (meterReaderError) {
      console.error('❌ Meter reader record creation failed:', meterReaderError)
      // Clean up user profile
      await supabase.from('users').delete().eq('id', userData.id)
      return NextResponse.json(
        { error: meterReaderError.message },
        { status: 400 }
      )
    }

    console.log('✅ Meter reader record created:', meterReaderData.id)

    // Step 4: Fetch the complete meter reader with user info
    const { data: completeMeterReader, error: fetchError } = await supabase
      .from('meter_readers_with_user')
      .select('*')
      .eq('id', meterReaderData.id)
      .single()

    if (fetchError) {
      console.error('❌ Failed to fetch complete meter reader:', fetchError)
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      )
    }

    console.log('✅ Meter reader creation completed successfully')
    return NextResponse.json({ data: completeMeterReader })

  } catch (error) {
    console.error('💥 Unexpected error in API route:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
