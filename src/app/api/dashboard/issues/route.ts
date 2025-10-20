import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create client with anon key
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET() {
  try {
    console.log('📊 Fetching recent issues...')

    // Fetch recent issues with user information
    // Note: issues.user_id references auth.users, so we need to join through users table
    const { data: issues, error } = await supabase
      .from('issues')
      .select(`
        id,
        issue_number,
        title,
        description,
        priority,
        status,
        created_at,
        user_id
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('❌ Error fetching issues:', error)
      return NextResponse.json(
        { error: 'Failed to fetch issues' },
        { status: 500 }
      )
    }

    // Get user information separately since issues references auth.users directly
    const userIds = issues?.map(issue => issue.user_id) || []
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('auth_user_id, full_name, email')
      .in('auth_user_id', userIds)

    if (usersError) {
      console.error('❌ Error fetching users for issues:', usersError)
      return NextResponse.json(
        { error: 'Failed to fetch user information' },
        { status: 500 }
      )
    }

    // Create a map for quick user lookup
    const userMap = new Map(users?.map(user => [user.auth_user_id, user]) || [])

    // Transform the data to match the expected format
    const formattedIssues = issues?.map(issue => {
      const user = userMap.get(issue.user_id)
      return {
        id: issue.issue_number,
        user: user?.full_name || 'Unknown User',
        issue: issue.title,
        priority: issue.priority,
        status: issue.status
      }
    }) || []

    console.log('✅ Recent issues fetched successfully')
    return NextResponse.json({ data: formattedIssues })

  } catch (error) {
    console.error('💥 Unexpected error in issues API:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
