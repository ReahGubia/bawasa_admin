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
import { MeterReaderService, MeterReaderWithUser } from "@/lib/meter-reader-service"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { AddMeterReaderDialog } from "@/components/add-meter-reader-dialog"

export default function MeterReaderManagementPage() {
  const [meterReaders, setMeterReaders] = useState<MeterReaderWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredMeterReaders, setFilteredMeterReaders] = useState<MeterReaderWithUser[]>([])

  // Fetch meter readers from Supabase
  const fetchMeterReaders = async () => {
    try {
      console.log('🚀 Starting to fetch meter readers...')
      setLoading(true)
      setError(null)
      
      const { data, error } = await MeterReaderService.getAllMeterReaders()
      
      console.log('📋 Fetch result:', { data, error })
      
      if (error) {
        console.error('💥 Error in fetchMeterReaders:', error)
        setError(error.message || 'Failed to fetch meter readers')
        return
      }
      
      if (data) {
        console.log('✨ Meter readers fetched:', data)
        setMeterReaders(data)
        setFilteredMeterReaders(data)
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
      const { error } = await MeterReaderService.updateMeterReaderStatus(readerId, isActive)
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
      reader.phone?.toLowerCase().includes(query.toLowerCase()) ||
      reader.employee_id?.toLowerCase().includes(query.toLowerCase())
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

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
    } else {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Inactive</Badge>
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
            <AddMeterReaderDialog onMeterReaderAdded={fetchMeterReaders} />
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
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned Route</TableHead>
                    <TableHead>Territory</TableHead>
                    <TableHead>Last Reading</TableHead>
                    <TableHead>Performance</TableHead>
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
                        <div className="flex items-center space-x-1">
                          <Activity className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-mono">{reader.employee_id}</span>
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
                      <TableCell>{getStatusBadge(reader.is_active)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{reader.assigned_route || 'Not assigned'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{reader.territory || 'Not assigned'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {reader.last_reading_date ? formatDate(reader.last_reading_date) : 'No readings'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Activity className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {reader.performance_rating > 0 ? `${reader.performance_rating}/5.0` : 'Not rated'}
                          </span>
                        </div>
                      </TableCell>
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
                                Deactivate Reader
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={() => handleStatusUpdate(reader.id, true)}
                                className="text-green-600"
                              >
                                Activate Reader
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
