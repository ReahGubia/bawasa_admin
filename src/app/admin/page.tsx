"use client"

import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Droplets, 
  CreditCard, 
  AlertTriangle, 
  Activity,
  Calendar,
  CheckCircle,
  DollarSign,
  Loader2
} from "lucide-react"
import { useEffect, useState } from "react"
import { DashboardService, DashboardStats, MeterReading, Issue } from "@/lib/dashboard-service"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [meterReadings, setMeterReadings] = useState<MeterReading[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch all dashboard data in parallel
        const [statsResult, meterReadingsResult, issuesResult] = await Promise.all([
          DashboardService.getStats(),
          DashboardService.getRecentMeterReadings(),
          DashboardService.getRecentIssues()
        ])

        if (statsResult.error) {
          throw new Error(`Failed to fetch stats: ${statsResult.error.message}`)
        }
        if (meterReadingsResult.error) {
          throw new Error(`Failed to fetch meter readings: ${meterReadingsResult.error.message}`)
        }
        if (issuesResult.error) {
          throw new Error(`Failed to fetch issues: ${issuesResult.error.message}`)
        }

        setStats(statsResult.data || null)
        setMeterReadings(meterReadingsResult.data || [])
        setIssues(issuesResult.data || [])
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your BAWASA system and monitor mobile app activities
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Key Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalUsers?.toLocaleString() || '0'}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered users
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meter Readings</CardTitle>
              <Droplets className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalMeterReadings?.toLocaleString() || '0'}</div>
                  <p className="text-xs text-muted-foreground">
                    Total readings submitted
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.pendingBills?.toLocaleString() || '0'}</div>
                  <p className="text-xs text-muted-foreground">
                    Bills awaiting payment
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.openIssues?.toLocaleString() || '0'}</div>
                  <p className="text-xs text-muted-foreground">
                    Issues requiring attention
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Recent Meter Readings */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Recent Meter Readings</CardTitle>
              <CardDescription>
                Latest meter readings submitted via mobile app
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span className="text-muted-foreground">Loading meter readings...</span>
                </div>
              ) : meterReadings.length === 0 ? (
                <div className="text-center py-8">
                  <Droplets className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No meter readings found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {meterReadings.map((reading) => (
                    <div key={reading.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Droplets className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="font-medium">{reading.user}</p>
                          <p className="text-sm text-muted-foreground">{reading.value} units</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={reading.status === "confirmed" ? "default" : "secondary"}>
                          {reading.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{reading.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Current system health and performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Mobile App API</span>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Online
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Database</span>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Online
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Payment Gateway</span>
                </div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Maintenance
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Notification Service</span>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Online
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recent Issues */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Recent Issues & Support</CardTitle>
              <CardDescription>
                Latest issues reported through mobile app
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span className="text-muted-foreground">Loading issues...</span>
                </div>
              ) : issues.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No issues found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {issues.map((issue) => (
                    <div key={issue.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className={`h-4 w-4 ${
                          issue.priority === "high" ? "text-red-600" : 
                          issue.priority === "medium" ? "text-yellow-600" : "text-green-600"
                        }`} />
                        <div>
                          <p className="font-medium">{issue.user}</p>
                          <p className="text-sm text-muted-foreground">{issue.issue}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          issue.priority === "high" ? "destructive" : 
                          issue.priority === "medium" ? "secondary" : "outline"
                        }>
                          {issue.priority}
                        </Badge>
                        <Badge variant={issue.status === "resolved" ? "default" : "secondary"}>
                          {issue.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg cursor-pointer">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Approve Meter Readings</span>
              </div>
              <div className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg cursor-pointer">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm">Verify New Users</span>
              </div>
              <div className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg cursor-pointer">
                <DollarSign className="h-4 w-4 text-yellow-600" />
                <span className="text-sm">Generate Bills</span>
              </div>
              <div className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg cursor-pointer">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="text-sm">Schedule Maintenance</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
