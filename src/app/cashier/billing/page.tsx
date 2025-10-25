"use client"

import { useState, useEffect } from "react"
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
  AlertCircle,
  RefreshCw,
  Loader2
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CashierLayout } from "@/components/cashier-sidebar"
import { BillingService, BillingWithDetails } from "@/lib/billing-service"

export default function CashierBillingPage() {
  const [billings, setBillings] = useState<BillingWithDetails[]>([])
  const [filteredBillings, setFilteredBillings] = useState<BillingWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    fetchBillings()
  }, [])

  useEffect(() => {
    handleSearch(searchQuery)
  }, [billings, searchQuery, statusFilter])

  const fetchBillings = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await BillingService.getAllBillings()

      if (error) {
        console.error('Error fetching billings:', error)
        setError('Failed to fetch billing data')
        return
      }

      setBillings(data || [])
    } catch (err) {
      console.error('Billing fetch error:', err)
      setError('Failed to load billing data')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    
    let filtered = billings

    // Filter by search query
    if (query.trim()) {
      filtered = filtered.filter(billing => 
        billing.consumer?.accounts?.full_name?.toLowerCase().includes(query.toLowerCase()) ||
        billing.consumer?.water_meter_no?.toLowerCase().includes(query.toLowerCase()) ||
        billing.consumer?.accounts?.email?.toLowerCase().includes(query.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(billing => billing.payment_status === statusFilter)
    }

    setFilteredBillings(filtered)
  }

  const handleStatusUpdate = async (billingId: string, newStatus: string) => {
    try {
      const { error } = await BillingService.updateBillingStatus(billingId, newStatus)

      if (error) {
        console.error('Error updating billing status:', error)
        setError('Failed to update billing status')
        return
      }

      // Refresh the billings list
      await fetchBillings()
    } catch (err) {
      console.error('Status update error:', err)
      setError('Failed to update billing status')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>
      case 'unpaid':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Unpaid</Badge>
      case 'partial':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800"><AlertCircle className="h-3 w-3 mr-1" />Partial</Badge>
      case 'overdue':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Overdue</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'paid') return false
    const due = new Date(dueDate)
    const today = new Date()
    return today > due
  }

  return (
    <CashierLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Billing Management</h1>
            <p className="text-gray-600">Manage customer bills and payments</p>
          </div>
          <Button onClick={fetchBillings} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
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

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Bills</CardTitle>
            <CardDescription>
              Search and filter customer bills
            </CardDescription>
            <div className="flex items-center space-x-2 pt-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search bills..." 
                  className="pl-8" 
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Status: {statusFilter === 'all' ? 'All' : statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter('all')}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('unpaid')}>Unpaid</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('paid')}>Paid</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('partial')}>Partial</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('overdue')}>Overdue</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading bills...</span>
              </div>
            ) : filteredBillings.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No bills found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search criteria' : 'No bills have been created yet'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Water Meter</TableHead>
                    <TableHead>Billing Month</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBillings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="text-muted-foreground">
                          {loading ? 'Loading bills...' : 'No bills found'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBillings.map((billing) => (
                      <TableRow key={billing.id}>
                        <TableCell className="font-medium">
                          <div className="space-y-1">
                            <div className="font-medium">{billing.consumer?.accounts?.full_name || 'Unknown Customer'}</div>
                            <div className="text-sm text-muted-foreground">{billing.consumer?.accounts?.email || 'No email'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-sm">
                            {billing.consumer?.water_meter_no || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>{billing.billing_month}</TableCell>
                        <TableCell className="font-mono">{formatCurrency(billing.total_amount_due)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(billing.due_date)}
                            {isOverdue(billing.due_date, billing.payment_status) && (
                              <Badge variant="destructive" className="ml-2 text-xs">Overdue</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(billing.payment_status)}</TableCell>
                        <TableCell>
                          {billing.payment_date ? formatDate(billing.payment_date) : "N/A"}
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
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Print Bill</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {billing.payment_status === 'unpaid' ? (
                                <DropdownMenuItem
                                  onClick={() => handleStatusUpdate(billing.id, 'paid')}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark as Paid
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleStatusUpdate(billing.id, 'unpaid')}
                                  className="text-orange-600"
                                >
                                  <Clock className="h-4 w-4 mr-2" />
                                  Mark as Unpaid
                                </DropdownMenuItem>
                              )}
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
      </div>
    </CashierLayout>
  )
}
