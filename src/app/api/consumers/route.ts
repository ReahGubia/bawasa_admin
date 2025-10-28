import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { BAWASABillingCalculator } from '@/lib/bawasa-billing-calculator'
import { EmailService } from '@/lib/email-service'
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
      due_date,
      payment_status
    } = body

    // Validate required fields
    if (!water_meter_no || !full_name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: water_meter_no, full_name, email, password' },
        { status: 400 }
      )
    }

    console.log('🚀 Creating consumer with new table structure...', { water_meter_no, full_name })

    // Check if water meter number already exists in consumers table
    const { data: existingMeter, error: checkError } = await supabase
      .from('consumers')
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
      password: hashedPassword,
      full_name,
      full_address: address || null,
      mobile_no: phone || null,
      user_type: 'consumer'
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

    // Step 3: Create consumer record in consumers table
    const consumerData = {
      water_meter_no,
      consumer_id: accountData_result.id, // Foreign key to accounts table
      registered_voter: registered_voter === 'yes' || registered_voter === true
    }

    const { data: consumerData_result, error: consumerError } = await supabase
      .from('consumers')
      .insert(consumerData)
      .select()
      .single()

    if (consumerError) {
      console.error('❌ Consumer record creation failed:', consumerError)
      return NextResponse.json(
        { error: `Account created but consumer record failed: ${consumerError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Consumer record created:', consumerData_result.id)

    // Step 4: Create meter reading record in bawasa_meter_readings table
    const meterReadingData = {
      consumer_id: consumerData_result.id, // Foreign key to consumers table
      reading_date: meter_reading_date || new Date().toISOString().split('T')[0],
      previous_reading: parseFloat(previous_reading) || 0,
      present_reading: parseFloat(present_reading) || 0
      // consumption_cubic_meters is a generated column, will be calculated automatically
    }

    const { data: meterReadingData_result, error: meterReadingError } = await supabase
      .from('bawasa_meter_readings')
      .insert(meterReadingData)
      .select()
      .single()

    if (meterReadingError) {
      console.error('❌ Meter reading record creation failed:', meterReadingError)
      return NextResponse.json(
        { error: `Consumer created but meter reading record failed: ${meterReadingError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Meter reading record created:', meterReadingData_result.id)

    // Step 5: Calculate consumption for billing calculations
    const consumption = parseFloat(consumption_cubic_meters) || 0
    
    // Use BAWASA billing calculator for accurate calculations
    const billingCalculation = BAWASABillingCalculator.calculateBilling(consumption)
    
    // Step 6: Create billing record in bawasa_billings table
    const billingData = {
      consumer_id: consumerData_result.id, // Foreign key to consumers table
      meter_reading_id: meterReadingData_result.id, // Foreign key to meter readings table
      billing_month: billing_month || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      
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
      amount_paid: 0
      // total_amount_due is a generated column, will be calculated automatically
    }

    const { data: billingData_result, error: billingError } = await supabase
      .from('bawasa_billings')
      .insert(billingData)
      .select()
      .single()

    if (billingError) {
      console.error('❌ Billing record creation failed:', billingError)
      return NextResponse.json(
        { error: `Consumer and meter reading created but billing record failed: ${billingError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Billing record created:', billingData_result.id)

    // Step 7: Send bill email to consumer
    console.log('📧 Sending bill email to consumer...')
    try {
      const billEmailData = {
        consumerName: full_name,
        email: email,
        waterMeterNo: water_meter_no,
        billingMonth: billing_month || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        previousReading: parseFloat(previous_reading) || 0,
        presentReading: parseFloat(present_reading) || 0,
        consumption: consumption,
        amountCurrentBilling: billingCalculation.amount_current_billing,
        dueDate: due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentStatus: payment_status || 'unpaid',
        address: address || undefined,
        phone: phone || undefined
      }

      const emailResult = await EmailService.sendBillEmail(billEmailData)
      
      if (emailResult.success) {
        console.log('✅ Bill email sent successfully to:', email)
      } else {
        console.error('❌ Failed to send bill email:', emailResult.error)
        // Don't fail the entire operation if email fails, just log it
      }
    } catch (emailError) {
      console.error('💥 Error sending bill email:', emailError)
      // Don't fail the entire operation if email fails, just log it
    }

    return NextResponse.json({
      success: true,
      message: 'Consumer, meter reading, and billing records created successfully',
      data: {
        consumer: consumerData_result,
        meterReading: meterReadingData_result,
        billing: billingData_result,
        account: accountData_result
      }
    })

  } catch (error) {
    console.error('💥 Unexpected error creating consumer records:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
