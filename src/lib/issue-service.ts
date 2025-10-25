import { supabase } from './supabase'

export interface IssueReport {
  id: number
  issue_type: string | null
  priority: string | null
  issue_title: string | null
  description: string | null
  issue_images: any | null
  created_at: string
  consumer_id: string | null
}

export interface IssueReportWithUser extends IssueReport {
  user_name: string | null
  user_email: string | null
  user_phone: number | null
}

export class IssueService {
  /**
   * Fetch all issue reports with user information
   */
  static async getAllIssues(): Promise<{ data: IssueReportWithUser[] | null; error: any }> {
    try {
      console.log('🔍 Fetching issue reports from Supabase...')
      
      const { data: issues, error } = await supabase
        .from('issue_report')
        .select(`
          *,
          consumers!consumer_id (
            accounts!consumer_id (
              full_name,
              email,
              mobile_no
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Issues fetch failed:', error)
        return { data: null, error }
      }

      // Transform the data to include user information
      const transformedData = (issues || []).map(issue => {
        const account = (issue.consumers as any)?.accounts
        return {
          ...issue,
          user_name: account?.full_name || 'Unknown User',
          user_email: account?.email || null,
          user_phone: account?.mobile_no || null
        }
      })

      console.log('✅ Successfully fetched issue reports:', transformedData.length, 'issues')
      return { data: transformedData, error: null }
    } catch (error) {
      console.error('💥 Unexpected error fetching issue reports:', error)
      return { data: null, error }
    }
  }

  /**
   * Fetch a single issue report by ID
   */
  static async getIssueById(id: number): Promise<{ data: IssueReportWithUser | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('issue_report')
        .select(`
          *,
          consumers!consumer_id (
            accounts!consumer_id (
              full_name,
              email,
              mobile_no
            )
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('❌ Issue fetch failed:', error)
        return { data: null, error }
      }

      // Transform the data to include user information
      const account = (data.consumers as any)?.accounts
      const transformedData = {
        ...data,
        user_name: account?.full_name || 'Unknown User',
        user_email: account?.email || null,
        user_phone: account?.mobile_no || null
      }

      return { data: transformedData, error: null }
    } catch (error) {
      console.error('Error fetching issue report:', error)
      return { data: null, error }
    }
  }

  /**
   * Search issue reports by title, description, or user name
   */
  static async searchIssues(query: string): Promise<{ data: IssueReportWithUser[] | null; error: any }> {
    try {
      const { data: issues, error } = await supabase
        .from('issue_report')
        .select(`
          *,
          consumers!consumer_id (
            accounts!consumer_id (
              full_name,
              email,
              mobile_no
            )
          )
        `)
        .or(`issue_title.ilike.%${query}%,description.ilike.%${query}%,consumers.accounts.full_name.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Issues search failed:', error)
        return { data: null, error }
      }

      // Transform the data to include user information
      const transformedData = (issues || []).map(issue => {
        const account = (issue.consumers as any)?.accounts
        return {
          ...issue,
          user_name: account?.full_name || 'Unknown User',
          user_email: account?.email || null,
          user_phone: account?.mobile_no || null
        }
      })

      return { data: transformedData, error: null }
    } catch (error) {
      console.error('Error searching issue reports:', error)
      return { data: null, error }
    }
  }

  /**
   * Filter issue reports by priority
   */
  static async getIssuesByPriority(priority: string): Promise<{ data: IssueReportWithUser[] | null; error: any }> {
    try {
      const { data: issues, error } = await supabase
        .from('issue_report')
        .select(`
          *,
          consumers!consumer_id (
            accounts!consumer_id (
              full_name,
              email,
              mobile_no
            )
          )
        `)
        .eq('priority', priority)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Issues filter failed:', error)
        return { data: null, error }
      }

      // Transform the data to include user information
      const transformedData = (issues || []).map(issue => {
        const account = (issue.consumers as any)?.accounts
        return {
          ...issue,
          user_name: account?.full_name || 'Unknown User',
          user_email: account?.email || null,
          user_phone: account?.mobile_no || null
        }
      })

      return { data: transformedData, error: null }
    } catch (error) {
      console.error('Error filtering issue reports:', error)
      return { data: null, error }
    }
  }

  /**
   * Get issue statistics
   */
  static async getIssueStats(): Promise<{
    total: number
    high: number
    medium: number
    low: number
    byType: Record<string, number>
  }> {
    try {
      const { data, error } = await supabase
        .from('issue_report')
        .select('priority, issue_type')

      if (error) {
        console.error('❌ Issue stats fetch failed:', error)
        return { total: 0, high: 0, medium: 0, low: 0, byType: {} }
      }

      const stats = {
        total: data?.length || 0,
        high: data?.filter(issue => issue.priority === 'high').length || 0,
        medium: data?.filter(issue => issue.priority === 'medium').length || 0,
        low: data?.filter(issue => issue.priority === 'low').length || 0,
        byType: {} as Record<string, number>
      }

      // Count by issue type
      data?.forEach(issue => {
        const type = issue.issue_type || 'Unknown'
        stats.byType[type] = (stats.byType[type] || 0) + 1
      })

      return stats
    } catch (error) {
      console.error('Error fetching issue stats:', error)
      return { total: 0, high: 0, medium: 0, low: 0, byType: {} }
    }
  }
}
