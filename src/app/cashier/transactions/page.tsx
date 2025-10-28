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
  History, 
  Search, 
  Filter, 
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Loader2,
  DollarSign,
  Calendar,
  Download
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
import { supabase } from "@/lib/supabase"

interface TransactionRecord {
  id: string
  consumer_id: string
  billing_month: string
  total_amount_due: number
  amount_paid: number
  payment_date: string
  payment_status: string
  consumer?: {
    water_meter_no?: string
    accounts?: {
      full_name?: string
      email?: string
    }
  }
}

export default function CashierTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    handleSearch(searchQuery)
  }, [transactions, searchQuery, statusFilter, dateFilter])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('bawasa_billings')
        .select(`
          *,
          consumers!consumer_id (
            water_meter_no,
            accounts!consumer_id (
              full_name,
              email
            )
          )
        `)
        .not('payment_date', 'is', null)
        .order('payment_date', { ascending: false })

      if (error) {
        console.error('Error fetching transactions:', error)
        setError('Failed to fetch transaction data')
        return
      }

      setTransactions(data || [])
    } catch (err) {
      console.error('Transaction fetch error:', err)
      setError('Failed to load transaction data')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    
    let filtered = transactions

    // Filter by search query
    if (query.trim()) {
      filtered = filtered.filter(transaction => 
        transaction.consumer?.accounts?.full_name?.toLowerCase().includes(query.toLowerCase()) ||
        transaction.consumer?.water_meter_no?.toLowerCase().includes(query.toLowerCase()) ||
        transaction.consumer?.accounts?.email?.toLowerCase().includes(query.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(transaction => transaction.payment_status === statusFilter)
    }

    // Filter by date
    if (dateFilter !== "all") {
      const today = new Date()
      const filterDate = new Date()
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          filtered = filtered.filter(transaction => 
            new Date(transaction.payment_date) >= filterDate
          )
          break
        case 'week':
          filterDate.setDate(today.getDate() - 7)
          filtered = filtered.filter(transaction => 
            new Date(transaction.payment_date) >= filterDate
          )
          break
        case 'month':
          filterDate.setMonth(today.getMonth() - 1)
          filtered = filtered.filter(transaction => 
            new Date(transaction.payment_date) >= filterDate
          )
          break
      }
    }

    setFilteredTransactions(filtered)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
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
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>
      case 'partial':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800"><AlertCircle className="h-3 w-3 mr-1" />Partial</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTotalRevenue = () => {
    return filteredTransactions.reduce((sum, transaction) => sum + transaction.amount_paid, 0)
  }

  const getTransactionCount = () => {
    return filteredTransactions.length
  }

  return (
    <CashierLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
            <p className="text-gray-600">View and manage payment transactions</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={fetchTransactions} disabled={loading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTransactionCount()}</div>
              <p className="text-xs text-muted-foreground">
                Based on current filters
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(getTotalRevenue())}</div>
              <p className="text-xs text-muted-foreground">
                From filtered transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Payment</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {getTransactionCount() > 0 ? formatCurrency(getTotalRevenue() / getTransactionCount()) : formatCurrency(0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Per transaction
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              Search and filter payment transactions
            </CardDescription>
            <div className="flex items-center space-x-2 pt-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search transactions..." 
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
                  <DropdownMenuItem onClick={() => setStatusFilter('paid')}>Paid</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('partial')}>Partial</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Date: {dateFilter === 'all' ? 'All' : dateFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setDateFilter('all')}>All Time</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDateFilter('today')}>Today</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDateFilter('week')}>This Week</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDateFilter('month')}>This Month</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading transactions...</span>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No transactions found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search criteria' : 'No transactions have been recorded yet'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Water Meter</TableHead>
                    <TableHead>Billing Month</TableHead>
                    <TableHead>Amount Due</TableHead>
                    <TableHead>Amount Paid</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        <div className="font-mono text-sm">
                          {transaction.id.slice(0, 8)}...
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{transaction.consumer?.accounts?.full_name || 'Unknown Customer'}</div>
                          <div className="text-sm text-muted-foreground">{transaction.consumer?.accounts?.email || 'No email'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {transaction.consumer?.water_meter_no || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>{transaction.billing_month}</TableCell>
                      <TableCell className="font-mono">{formatCurrency(transaction.total_amount_due)}</TableCell>
                      <TableCell className="font-mono font-semibold text-green-600">
                        {formatCurrency(transaction.amount_paid)}
                      </TableCell>
                      <TableCell>{formatDateTime(transaction.payment_date)}</TableCell>
                      <TableCell>{getStatusBadge(transaction.payment_status)}</TableCell>
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
                            <DropdownMenuItem>Print Receipt</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Refund Transaction</DropdownMenuItem>
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
    </CashierLayout>
  )
}
