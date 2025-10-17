"use client"

import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Droplets, 
  Search, 
  Filter, 
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  TrendingUp,
  Loader2,
  AlertCircle
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MeterReadingsService, MeterReadingWithUser, LatestMeterReadingByUser } from "@/lib/meter-readings-service"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { UserMeterReadingsDialog } from "@/components/UserMeterReadingsDialog"

export default function MeterReadingsPage() {
  const [meterReadings, setMeterReadings] = useState<LatestMeterReadingByUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<{
    id: string
    name: string
    email: string
  } | null>(null)

  // Load meter readings on component mount
  useEffect(() => {
    loadMeterReadings()
    getCurrentUser()
  }, [])

  const loadMeterReadings = async () => {
    try {
      setLoading(true)
      setError(null)
      const readings = await MeterReadingsService.getLatestMeterReadingsByUser()
      setMeterReadings(readings)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load meter readings')
    } finally {
      setLoading(false)
    }
  }

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    } catch (err) {
      console.error('Error getting current user:', err)
    }
  }

  const handleStatusUpdate = async (readingId: string, newStatus: 'confirmed' | 'rejected') => {
    if (!currentUser) return

    try {
      await MeterReadingsService.updateMeterReadingStatus(readingId, newStatus, currentUser.id)
      // Reload readings to reflect the change
      await loadMeterReadings()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update reading status')
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      await loadMeterReadings()
      return
    }

    try {
      setLoading(true)
      setError(null)
      const readings = await MeterReadingsService.searchMeterReadings(searchQuery)
      // Convert to LatestMeterReadingByUser format by grouping
      const groupedReadings = groupReadingsByUser(readings)
      setMeterReadings(groupedReadings)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search meter readings')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterByStatus = async (status: string) => {
    setStatusFilter(status)
    
    try {
      setLoading(true)
      setError(null)
      
      if (status === 'all') {
        await loadMeterReadings()
      } else {
        const readings = await MeterReadingsService.getMeterReadingsByStatus(status as 'pending' | 'confirmed' | 'rejected')
        // Convert to LatestMeterReadingByUser format by grouping
        const groupedReadings = groupReadingsByUser(readings)
        setMeterReadings(groupedReadings)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to filter meter readings')
    } finally {
      setLoading(false)
    }
  }

  // Helper function to group readings by user and get latest
  const groupReadingsByUser = (readings: MeterReadingWithUser[]): LatestMeterReadingByUser[] => {
    const userGroups = new Map<string, MeterReadingWithUser[]>()
    
    // Group readings by user_id_ref
    readings.forEach(reading => {
      if (!userGroups.has(reading.user_id_ref)) {
        userGroups.set(reading.user_id_ref, [])
      }
      userGroups.get(reading.user_id_ref)!.push(reading)
    })

    // Get latest reading for each user and add total count
    const latestReadings: LatestMeterReadingByUser[] = []
    userGroups.forEach((userReadings, userId) => {
      const latestReading = userReadings[0] // Already sorted by created_at desc
      latestReadings.push({
        ...latestReading,
        total_readings: userReadings.length
      })
    })

    // Sort by latest reading date
    return latestReadings.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }

  const handleUserClick = (reading: LatestMeterReadingByUser) => {
    setSelectedUser({
      id: reading.user_id_ref,
      name: reading.user_name,
      email: reading.user_email
    })
    setDialogOpen(true)
  }

  // Filter readings based on current filters
  const filteredReadings = meterReadings.filter(reading => {
    if (statusFilter !== 'all' && reading.status !== statusFilter) {
      return false
    }
    return true
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meter Readings Management</h1>
            <p className="text-muted-foreground">
              Review latest meter readings by user - click on user to view complete history
            </p>
          </div>
          <Button>
            <TrendingUp className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
        </div>

        {/* Meter Readings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Latest Meter Readings by User</CardTitle>
            <CardDescription>
              View the most recent meter reading for each user. Click on a user to see their complete reading history.
            </CardDescription>
            <div className="flex items-center space-x-2 pt-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by user name or email..." 
                  className="pl-8" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button variant="outline" onClick={handleSearch} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter by Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleFilterByStatus('all')}>
                    All Readings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterByStatus('pending')}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterByStatus('confirmed')}>
                    Confirmed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterByStatus('rejected')}>
                    Rejected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-800">{error}</span>
                <Button variant="outline" size="sm" onClick={loadMeterReadings} className="ml-auto">
                  Retry
                </Button>
              </div>
            )}
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading meter readings...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Latest Reading ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Total Readings</TableHead>
                    <TableHead>Meter Type</TableHead>
                    <TableHead>Latest Value</TableHead>
                    <TableHead>Latest Reading Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReadings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No meter readings found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReadings.map((reading) => (
                      <TableRow key={reading.id}>
                        <TableCell className="font-medium">{reading.id.slice(0, 8)}...</TableCell>
                        <TableCell>
                          <div 
                            className="cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
                            onClick={() => handleUserClick(reading)}
                            title="Click to view user's meter readings history"
                          >
                            <div className="font-medium text-blue-600 hover:text-blue-800">{reading.user_name || 'Unknown User'}</div>
                            <div className="text-sm text-muted-foreground">{reading.user_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {reading.total_readings} reading{reading.total_readings !== 1 ? 's' : ''}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{reading.meter_type}</Badge>
                        </TableCell>
                        <TableCell className="font-mono">{reading.reading_value.toLocaleString()}</TableCell>
                        <TableCell>{new Date(reading.reading_date).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(reading.status)}</TableCell>
                        <TableCell>{new Date(reading.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {reading.status === 'pending' && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => handleStatusUpdate(reading.id, 'confirmed')}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Confirm Reading
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleStatusUpdate(reading.id, 'rejected')}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject Reading
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Edit Reading</DropdownMenuItem>
                              <DropdownMenuItem>Download Receipt</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Reading Analytics */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Reading Trends</CardTitle>
              <CardDescription>
                Monthly meter reading submission trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">January 2024</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <span className="text-sm font-medium">8,421</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">December 2023</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                    <span className="text-sm font-medium">7,789</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">November 2023</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                    </div>
                    <span className="text-sm font-medium">7,234</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common meter reading management tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <CheckCircle className="h-4 w-4 mr-2" />
                Bulk Approve Readings
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                Generate Usage Report
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Droplets className="h-4 w-4 mr-2" />
                Export Reading Data
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                Set Reading Schedule
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* User Meter Readings Dialog */}
      {selectedUser && (
        <UserMeterReadingsDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          userId={selectedUser.id}
          userName={selectedUser.name}
          userEmail={selectedUser.email}
        />
      )}
    </AdminLayout>
  )
}
