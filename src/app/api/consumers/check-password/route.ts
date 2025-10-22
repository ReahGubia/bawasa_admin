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
    const { password, email } = body

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    // Since passwords are now hashed, we can't directly compare them for uniqueness
    // Instead, we'll check if the email already exists (which would indicate a duplicate account)
    if (email) {
      const { data: existingAccount, error } = await supabase
        .from('accounts')
        .select('email')
        .eq('email', email)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Error checking existing email:', error)
        return NextResponse.json(
          { error: 'Failed to validate email' },
          { status: 500 }
        )
      }

      // If email exists, return that the account already exists
      if (existingAccount) {
        return NextResponse.json({
          exists: true,
          message: 'An account with this email already exists'
        })
      }
    }

    // For password uniqueness, we'll check against all existing passwords
    // This is computationally expensive but necessary for true uniqueness
    const { data: allAccounts, error } = await supabase
      .from('accounts')
      .select('password')

    if (error) {
      console.error('❌ Error fetching accounts:', error)
      return NextResponse.json(
        { error: 'Failed to validate password' },
        { status: 500 }
      )
    }

    // Check if the plain text password matches any existing hashed password
    let passwordExists = false
    for (const account of allAccounts || []) {
      const isMatch = await bcrypt.compare(password, account.password)
      if (isMatch) {
        passwordExists = true
        break
      }
    }

    return NextResponse.json({
      exists: passwordExists,
      message: passwordExists ? 'This password is already in use' : 'Password is available'
    })

  } catch (error) {
    console.error('💥 Unexpected error checking password:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
