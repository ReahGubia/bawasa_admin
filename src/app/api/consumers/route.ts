import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { BAWASABillingCalculator } from '@/lib/bawasa-billing-calculator'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create client with anon key
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      full_name,
      phone,
      address,
      registered_voter,
      water_meter_no,
      billing_month,
      meter_reading_date,
      previous_reading,
      present_reading,
      consumption_cubic_meters,
      amount_current_billing,
      due_date,
      payment_status,
      notes
    } = body

    // Validate required fields
    if (!water_meter_no || !full_name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: water_meter_no, full_name, email, password' },
        { status: 400 }
      )
    }

    console.log('🚀 Creating water billing record...', { water_meter_no, full_name })

    // Check if water meter number already exists
    const { data: existingMeter, error: checkError } = await supabase
      .from('bawasa_consumers')
      .select('water_meter_no')
      .eq('water_meter_no', water_meter_no)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error checking existing meter:', checkError)
      return NextResponse.json(
        { error: 'Failed to validate water meter number' },
        { status: 500 }
      )
    }

    if (existingMeter) {
      console.error('❌ Water meter number already exists:', water_meter_no)
      return NextResponse.json(
        { error: `Water meter number ${water_meter_no} already exists. Please use a different meter number.` },
        { status: 400 }
      )
    }

    console.log('✅ Water meter number is unique:', water_meter_no)

    // Step 1: Hash the password before saving
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    console.log('✅ Password hashed successfully')

    // Step 2: Create account record in accounts table first
    const accountData = {
      email,
      password: hashedPassword, // Now properly hashed
      full_name,
      full_address: address || null,
      mobile_no: phone || null, // Add phone number to mobile_no column
      user_type: 'consumer' // Set user type as consumer for admin-created accounts
    }

    const { data: accountData_result, error: accountError } = await supabase
      .from('accounts')
      .insert(accountData)
      .select()
      .single()

    if (accountError) {
      console.error('❌ Account record creation failed:', accountError)
      return NextResponse.json(
        { error: `Failed to create account record: ${accountError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Account record created:', accountData_result.id)

    // Step 3: Calculate consumption for billing calculations
    const consumption = parseFloat(consumption_cubic_meters) || 0
    
    // Use BAWASA billing calculator for accurate calculations
    const billingCalculation = BAWASABillingCalculator.calculateBilling(consumption)
    
    // Step 4: Create water billing record with consumer_id foreign key
    const billingData = {
      water_meter_no,
      billing_month: billing_month || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      meter_reading_date: meter_reading_date || new Date().toISOString().split('T')[0],
      previous_reading: parseFloat(previous_reading) || 0,
      present_reading: parseFloat(present_reading) || 0,
      // Note: consumption_cubic_meters is a generated column, don't include it
      
      // Billing calculations (matching BAWASA form structure)
      consumption_10_or_below: billingCalculation.consumption_10_or_below,
      amount_10_or_below: billingCalculation.amount_10_or_below,
      amount_10_or_below_with_discount: billingCalculation.amount_10_or_below_with_discount,
      
      consumption_over_10: billingCalculation.consumption_over_10,
      amount_over_10: billingCalculation.amount_over_10,
      
      amount_current_billing: billingCalculation.amount_current_billing,
      arrears_to_be_paid: 0,
      
      due_date: due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      arrears_after_due_date: 0,
      
      payment_status: payment_status || 'unpaid',
      amount_paid: 0,
      registered_voter: registered_voter === 'yes' || registered_voter === true,
      consumer_id: accountData_result.id // Foreign key reference to accounts table
    }

    const { data: billingData_result, error: billingError } = await supabase
      .from('bawasa_consumers')
      .insert(billingData)
      .select()
      .single()

    if (billingError) {
      console.error('❌ Water billing creation failed:', billingError)
      return NextResponse.json(
        { error: `Account created but water billing record failed: ${billingError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Water billing record created:', billingData_result.id)

    return NextResponse.json({
      success: true,
      message: 'Consumer and water billing record created successfully',
      data: {
        billing: billingData_result,
        account: accountData_result
      }
    })

  } catch (error) {
    console.error('💥 Unexpected error creating water billing record:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
