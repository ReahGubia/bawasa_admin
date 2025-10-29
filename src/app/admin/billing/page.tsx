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
  CreditCard, 
  Search, 
  Filter, 
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Download,
  Send,
  Loader2,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BillingService, BillingWithDetails } from "@/lib/billing-service"
import { useEffect, useState } from "react"

export default function BillingManagementPage() {
  const [billings, setBillings] = useState<BillingWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredBillings, setFilteredBillings] = useState<BillingWithDetails[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Fetch billings from database
  const fetchBillings = async () => {
    try {
      console.log('🚀 Starting to fetch billings...')
      setLoading(true)
      setError(null)
      
      const { data, error } = await BillingService.getAllBillings()
      
      console.log('📋 Fetch result:', { data, error })
      
      if (error) {
        console.error('💥 Error in fetchBillings:', error)
        setError(error.message || 'Failed to fetch billings')
        return
      }
      
      if (data) {
        console.log('📝 Setting billings...')
        setBillings(data)
        setFilteredBillings(data)
      } else {
        console.log('📭 No data returned from Supabase')
        setBillings([])
        setFilteredBillings([])
      }
    } catch (err) {
      console.error('💥 Unexpected error in fetchBillings:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredBillings(billings)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const { data, error } = await BillingService.searchBillings(searchQuery)
      
      if (error) {
        setError(error.message || 'Failed to search billings')
        return
      }
      
      setFilteredBillings(data || [])
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Handle status filter
  const handleStatusFilter = async (status: string) => {
    setStatusFilter(status)
    
    try {
      setLoading(true)
      setError(null)
      
      if (status === 'all') {
        setFilteredBillings(billings)
      } else {
        const { data, error } = await BillingService.getBillingsByStatus(status as 'unpaid' | 'partial' | 'paid' | 'overdue')
        
        if (error) {
          setError(error.message || 'Failed to filter billings')
          return
        }
        
        setFilteredBillings(data || [])
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Handle status update
  const handleStatusUpdate = async (billingId: string, newStatus: 'unpaid' | 'partial' | 'paid' | 'overdue') => {
    try {
      const { error } = await BillingService.updateBillingStatus(billingId, newStatus)
      if (error) {
        setError(error.message || 'Failed to update billing status')
        return
      }
      // Refresh the billings list
      await fetchBillings()
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Error updating billing status:', err)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>
      case "unpaid":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Unpaid</Badge>
      case "partial":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Partial</Badge>
      case "overdue":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Overdue</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Load billings on component mount
  useEffect(() => {
    console.log('🎯 Component mounted, starting billing fetch...')
    fetchBillings()
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Billing Management</h1>
            <p className="text-muted-foreground">
              Manage bills, payments, and billing reports
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={fetchBillings} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bills Table */}
        <Card>
          <CardHeader>
            <CardTitle>Bills Overview</CardTitle>
            <CardDescription>
              Manage all bills generated from meter readings
            </CardDescription>
            <div className="flex items-center space-x-2 pt-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search bills..." 
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
                  <DropdownMenuItem onClick={() => handleStatusFilter('all')}>
                    All Bills
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusFilter('unpaid')}>
                    Unpaid
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusFilter('partial')}>
                    Partial
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusFilter('paid')}>
                    Paid
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusFilter('overdue')}>
                    Overdue
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading billings...</span>
              </div>
            ) : filteredBillings.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No billings found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search criteria' : 'No billings have been generated yet'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Water Meter</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Billing Month</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBillings.map((billing) => (
                    <TableRow key={billing.id}>
                      <TableCell className="font-medium">{billing.id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{billing.account?.full_name || 'Unknown Customer'}</div>
                          <div className="text-sm text-muted-foreground">{billing.account?.email || 'No email'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {billing.consumer?.water_meter_no || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">₱{billing.total_amount_due?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>{billing.billing_month}</TableCell>
                      <TableCell>{formatDate(billing.due_date)}</TableCell>
                      <TableCell>{getStatusBadge(billing.payment_status)}</TableCell>
                      <TableCell>{billing.payment_date ? formatDate(billing.payment_date) : "N/A"}</TableCell>
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
                            <DropdownMenuItem>View Bill Details</DropdownMenuItem>
                            <DropdownMenuItem>Download PDF</DropdownMenuItem>
                            <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {billing.payment_status === 'unpaid' ? (
                              <DropdownMenuItem 
                                onClick={() => handleStatusUpdate(billing.id, 'paid')}
                                className="text-green-600"
                              >
                                Mark as Paid
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={() => handleStatusUpdate(billing.id, 'unpaid')}
                                className="text-orange-600"
                              >
                                Mark as Unpaid
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>Generate Receipt</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              Cancel Bill
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
