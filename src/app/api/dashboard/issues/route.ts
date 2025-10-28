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
    const { data: issues, error } = await supabase
      .from('issue_report')
      .select(`
        id,
        issue_type,
        priority,
        issue_title,
        description,
        status,
        created_at,
        consumers!consumer_id (
          accounts!consumer_id (
            full_name
          )
        )
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

    // Transform the data to match the expected format
    const formattedIssues = issues?.map(issue => {
      const consumer = issue.consumers as any
      const account = consumer?.accounts as any
      
      return {
        id: issue.id.toString(),
        user: account?.full_name || 'Unknown User',
        issue: issue.issue_title || issue.issue_type || 'No title',
        priority: issue.priority || 'medium',
        status: issue.status || 'open',
        date: new Date(issue.created_at).toLocaleDateString()
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
