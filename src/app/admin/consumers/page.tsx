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
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  Home,
  Mail
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConsumerService, ConsumerWithStatus } from "@/lib/consumer-service"
import { useEffect, useState } from "react"
import { AddConsumerDialog } from "@/components/add-consumer-dialog"
import { ViewConsumerDetailsDialog } from "@/components/view-consumer-details-dialog"

export default function Page() {
  const [consumers, setConsumers] = useState<ConsumerWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredConsumers, setFilteredConsumers] = useState<ConsumerWithStatus[]>([])
  const [selectedConsumer, setSelectedConsumer] = useState<ConsumerWithStatus | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  // Fetch consumers
  const fetchConsumers = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await ConsumerService.getAllConsumers()
      if (error) {
        setError(error.message || "Failed to fetch consumers")
        return
      }
      if (data) {
        const formatted = data.map(ConsumerService.formatConsumerForDisplay)
        setConsumers(formatted)
        setFilteredConsumers(formatted)
      } else {
        setConsumers([])
        setFilteredConsumers([])
      }
    } catch (err) {
      console.error(err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConsumers()
  }, [])

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

  // View consumer details
  const handleViewDetails = (consumer: ConsumerWithStatus) => {
    setSelectedConsumer(consumer)
    setDetailsDialogOpen(true)
  }

  // Suspend or unsuspend consumer
  const handleToggleSuspension = async (consumer: ConsumerWithStatus) => {
    try {
      const newSuspensionState = !consumer.is_suspended
      await ConsumerService.updateConsumerSuspension(consumer.id, newSuspensionState)
      await fetchConsumers()
    } catch (err) {
      console.error(err)
      setError("Failed to update suspension")
    }
  }

  // Format date
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

  // Status badge
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Consumers</h1>
            <p className="text-muted-foreground">Manage consumer accounts and water service connections</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={fetchConsumers} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <AddConsumerDialog onConsumerAdded={fetchConsumers} />
          </div>
        </div>

        {/* Error */}
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
            <CardDescription>Manage all consumer accounts and water service connections</CardDescription>
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
                <p className="text-muted-foreground">{searchQuery ? 'Try adjusting your search' : 'No consumers registered yet'}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Consumer</TableHead>
                    <TableHead>Water Meter</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Date Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConsumers.map((consumer) => (
                    <TableRow 
                      key={consumer.id} 
                      className={consumer.is_suspended ? "bg-red-50 opacity-80" : ""}
                    >
                      <TableCell className="font-medium flex items-center space-x-2">
                        <Home className="h-4 w-4 text-muted-foreground" />
                        <span>{consumer.account?.full_name || 'No name'}</span>
                        {consumer.is_suspended && <Badge variant="destructive">Suspended</Badge>}
                      </TableCell>
                      <TableCell className="text-sm font-mono">{consumer.water_meter_no}</TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span>{consumer.account?.email || 'No email'}</span>
                          </div>
                          <div className="text-muted-foreground">{consumer.account?.full_address || 'No address'}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(consumer.created_at)}</TableCell>
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
                            <DropdownMenuItem onClick={() => handleToggleSuspension(consumer)}>
                              {consumer.is_suspended ? 'Revoke Suspension' : 'Suspend'}
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
