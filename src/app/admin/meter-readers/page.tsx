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
  Users, 
  Search, 
  Filter, 
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  Loader2,
  RefreshCw,
  Droplets,
  MapPin,
  Calendar,
  Activity
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserService, UserWithStatus } from "@/lib/user-service"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"

export default function MeterReaderManagementPage() {
  const [meterReaders, setMeterReaders] = useState<UserWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredMeterReaders, setFilteredMeterReaders] = useState<UserWithStatus[]>([])

  // Fetch meter readers from Supabase
  const fetchMeterReaders = async () => {
    try {
      console.log('🚀 Starting to fetch meter readers...')
      setLoading(true)
      setError(null)
      
      // For now, we'll filter staff users as meter readers
      // In a real implementation, you might have a specific role field
      const { data, error } = await UserService.getUsersByAccountType('staff')
      
      console.log('📋 Fetch result:', { data, error })
      
      if (error) {
        console.error('💥 Error in fetchMeterReaders:', error)
        setError(error.message || 'Failed to fetch meter readers')
        return
      }
      
      if (data) {
        console.log('📝 Formatting meter readers...')
        const formattedMeterReaders = data.map(reader => UserService.formatUserForDisplay(reader))
        console.log('✨ Formatted meter readers:', formattedMeterReaders)
        setMeterReaders(formattedMeterReaders)
        setFilteredMeterReaders(formattedMeterReaders)
      } else {
        console.log('📭 No data returned from Supabase')
        setMeterReaders([])
        setFilteredMeterReaders([])
      }
    } catch (err) {
      console.error('💥 Unexpected error in fetchMeterReaders:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Handle meter reader status update
  const handleStatusUpdate = async (readerId: string, isActive: boolean) => {
    try {
      const { error } = await UserService.updateUserStatus(readerId, isActive)
      if (error) {
        setError(error.message || 'Failed to update meter reader status')
        return
      }
      // Refresh the meter readers list
      await fetchMeterReaders()
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Error updating meter reader status:', err)
    }
  }

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredMeterReaders(meterReaders)
      return
    }
    
    const filtered = meterReaders.filter(reader => 
      reader.full_name?.toLowerCase().includes(query.toLowerCase()) ||
      reader.email.toLowerCase().includes(query.toLowerCase()) ||
      reader.phone?.toLowerCase().includes(query.toLowerCase())
    )
    setFilteredMeterReaders(filtered)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Format last login date
  const formatLastLogin = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case "suspended":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Suspended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Load meter readers on component mount
  useEffect(() => {
    console.log('🎯 Component mounted, starting meter reader fetch...')
    fetchMeterReaders()
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meter Readers</h1>
            <p className="text-muted-foreground">
              Manage meter readers and their assigned routes
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={fetchMeterReaders} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add New Meter Reader
            </Button>
          </div>
        </div>

        

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-800">
                <XCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Meter Readers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Meter Reader Accounts</CardTitle>
            <CardDescription>
              Manage meter readers and their assigned routes for water meter readings
            </CardDescription>
            <div className="flex items-center space-x-2 pt-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search meter readers..." 
                  className="pl-8" 
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading meter readers...</span>
              </div>
            ) : filteredMeterReaders.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No meter readers found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search criteria' : 'No meter readers have been registered yet'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Meter Reader</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned Route</TableHead>
                    <TableHead>Last Reading</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMeterReaders.map((reader) => (
                    <TableRow key={reader.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <Droplets className="h-4 w-4 text-blue-600" />
                          <span>{reader.full_name || 'No name provided'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{reader.email}</div>
                          <div className="text-sm text-muted-foreground">
                            {reader.phone || 'No phone provided'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(reader.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">Route A-01</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">Dec 15, 2024</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatLastLogin(reader.last_login_at)}</TableCell>
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
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>Edit Reader</DropdownMenuItem>
                            <DropdownMenuItem>Assign Route</DropdownMenuItem>
                            <DropdownMenuItem>View Readings</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {reader.is_active ? (
                              <DropdownMenuItem 
                                onClick={() => handleStatusUpdate(reader.id, false)}
                                className="text-orange-600"
                              >
                                Suspend Access
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={() => handleStatusUpdate(reader.id, true)}
                                className="text-green-600"
                              >
                                Activate Access
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              Delete Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
