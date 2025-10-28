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
  Loader2,
  RefreshCw,
  Home,
  Phone,
  Mail
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConsumerService, ConsumerWithStatus } from "@/lib/consumer-service"
import { useEffect, useState } from "react"
import { AddConsumerDialog } from "@/components/add-consumer-dialog"
import { ViewConsumerDetailsDialog } from "@/components/view-consumer-details-dialog"

export default function ConsumerManagementPage() {
  const [consumers, setConsumers] = useState<ConsumerWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredConsumers, setFilteredConsumers] = useState<ConsumerWithStatus[]>([])
  const [selectedConsumer, setSelectedConsumer] = useState<ConsumerWithStatus | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  // Fetch consumers from Supabase
  const fetchConsumers = async () => {
    try {
      console.log('🚀 Starting to fetch consumers...')
      setLoading(true)
      setError(null)
      
      const { data, error } = await ConsumerService.getAllConsumers()
      
      console.log('📋 Fetch result:', { data, error })
      
      if (error) {
        console.error('💥 Error in fetchConsumers:', error)
        setError(error.message || 'Failed to fetch consumers')
        return
      }
      
      if (data) {
        console.log('📝 Formatting consumers...')
        const formattedConsumers = data.map(consumer => ConsumerService.formatConsumerForDisplay(consumer))
        console.log('✨ Formatted consumers:', formattedConsumers)
        setConsumers(formattedConsumers)
        setFilteredConsumers(formattedConsumers)
      } else {
        console.log('📭 No data returned from Supabase')
        setConsumers([])
        setFilteredConsumers([])
      }
    } catch (err) {
      console.error('💥 Unexpected error in fetchConsumers:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Handle opening consumer details
  const handleViewDetails = (consumer: ConsumerWithStatus) => {
    setSelectedConsumer(consumer)
    setDetailsDialogOpen(true)
  }

  // Handle consumer payment status update
  const handleStatusUpdate = async (consumerId: string, paymentStatus: string) => {
    try {
      const { error } = await ConsumerService.updateConsumerPaymentStatus(consumerId, paymentStatus)
      if (error) {
        setError(error.message || 'Failed to update consumer payment status')
        return
      }
      // Refresh the consumers list
      await fetchConsumers()
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Error updating consumer payment status:', err)
    }
  }

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredConsumers(consumers)
      return
    }
    
    const filtered = consumers.filter(consumer => 
      consumer.water_meter_no.toLowerCase().includes(query.toLowerCase()) ||
      consumer.account?.email?.toLowerCase().includes(query.toLowerCase()) ||
      consumer.account?.full_name?.toLowerCase().includes(query.toLowerCase()) ||
      consumer.account?.full_address?.toLowerCase().includes(query.toLowerCase())
    )
    setFilteredConsumers(filtered)
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

  // Load consumers on component mount
  useEffect(() => {
    console.log('🎯 Component mounted, starting consumer fetch...')
    fetchConsumers()
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Consumers</h1>
            <p className="text-muted-foreground">
              Manage consumer accounts and water service connections
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={fetchConsumers} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <AddConsumerDialog onConsumerAdded={fetchConsumers} />
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

        {/* Consumers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Consumer Accounts</CardTitle>
            <CardDescription>
              Manage all consumer accounts and water service connections
            </CardDescription>
            <div className="flex items-center space-x-2 pt-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search consumers..." 
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
                <span>Loading consumers...</span>
              </div>
            ) : filteredConsumers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No consumers found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search criteria' : 'No consumers have been registered yet'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Consumer</TableHead>
                    <TableHead>Water Meter</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConsumers.map((consumer) => (
                    <TableRow key={consumer.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <Home className="h-4 w-4 text-muted-foreground" />
                          <span>{consumer.account?.full_name || 'No name provided'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-mono">
                          {consumer.water_meter_no}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span>{consumer.account?.email || 'No email provided'}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {consumer.account?.full_address || 'No address provided'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(consumer.status)}</TableCell>
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
                            <DropdownMenuItem onClick={() => handleViewDetails(consumer)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit Billing</DropdownMenuItem>
                            <DropdownMenuItem>View Meter Readings</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {consumer.latest_billing?.payment_status === 'unpaid' ? (
                              <DropdownMenuItem 
                                onClick={() => handleStatusUpdate(consumer.id, 'paid')}
                                className="text-green-600"
                              >
                                Mark as Paid
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={() => handleStatusUpdate(consumer.id, 'unpaid')}
                                className="text-orange-600"
                              >
                                Mark as Unpaid
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              Delete Record
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

      {/* Consumer Details Dialog */}
      <ViewConsumerDetailsDialog
        consumer={selectedConsumer}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />
    </AdminLayout>
  )
}
