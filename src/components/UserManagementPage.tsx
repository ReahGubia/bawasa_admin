"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Users, MoreHorizontal, XCircle, CheckCircle, Clock } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { ConsumerService } from "@/lib/consumer-service"
import { MeterReaderService } from "@/lib/meter-reader-service"
import { CashierService } from "@/lib/cashier-service"
import { ViewConsumerDetailsDialog } from "@/components/view-consumer-details-dialog"
import { AssignConsumersDialog } from "@/components/assign-consumers-dialog"
import { ViewAssignedConsumersDialog } from "@/components/view-assigned-consumers-dialog"
import { AddConsumerDialog } from "@/components/add-consumer-dialog"
import { AddMeterReaderDialog } from "@/components/add-meter-reader-dialog"
import { AddCashierDialog } from "@/components/add-cashier-dialog"
import { ViewMeterReaderDialog } from "@/components/ViewMeterReaderDialog"

type UserType = "consumer" | "meterReader" | "cashier"

interface UserManagementPageProps {
  type: UserType
}

export default function UserManagementPage({ type }: UserManagementPageProps) {
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  
  const [selectedConsumer, setSelectedConsumer] = useState<any | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedMeterReaderForAssignment, setSelectedMeterReaderForAssignment] = useState<{id: number, name: string} | null>(null)
  const [viewAssignedDialogOpen, setViewAssignedDialogOpen] = useState(false)
  const [selectedMeterReaderForViewing, setSelectedMeterReaderForViewing] = useState<{id: number, name: string} | null>(null)
  const [viewMeterReaderDialogOpen, setViewMeterReaderDialogOpen] = useState(false)
  const [selectedMeterReader, setSelectedMeterReader] = useState<any | null>(null)

  // Map type to service and dialogs
  const serviceMap: Record<UserType, any> = {
    consumer: ConsumerService,
    meterReader: MeterReaderService,
    cashier: CashierService,
  }

  const addDialogMap: Record<UserType, any> = {
    consumer: AddConsumerDialog,
    meterReader: AddMeterReaderDialog,
    cashier: AddCashierDialog,
  }

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await serviceMap[type].getAllUsers?.() || await serviceMap[type].getAllConsumers?.() || await serviceMap[type].getAllMeterReaders?.() || await serviceMap[type].getAllCashiers?.()
      if (error) {
        setError(error.message || "Failed to fetch data")
        return
      }
      if (data) {
        setUsers(data)
        setFilteredUsers(data)
      } else {
        setUsers([])
        setFilteredUsers([])
      }
    } catch (err) {
      console.error(err)
      setError("Unexpected error fetching data")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredUsers(users)
      return
    }
    const filtered = users.filter(u =>
      u.full_name?.toLowerCase().includes(query.toLowerCase()) ||
      u.email?.toLowerCase().includes(query.toLowerCase()) ||
      u.mobile_no?.toString().includes(query) ||
      u.water_meter_no?.toLowerCase().includes(query) ||
      u.employee_id?.toLowerCase().includes(query)
    )
    setFilteredUsers(filtered)
  }

  const handleStatusChange = async (id: string | number, newStatus: string | boolean) => {
    try {
      if (type === "consumer") {
        await serviceMap[type].updateConsumerSuspension(id, newStatus)
      } else if (type === "meterReader") {
        await serviceMap[type].updateMeterReaderStatus?.(id, newStatus)
      } else if (type === "cashier") {
        await serviceMap[type].updateCashierStatus?.(id, newStatus)
      }
      await fetchUsers()
    } catch (err) {
      console.error(err)
      setError("Failed to update status")
    }
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

  useEffect(() => { fetchUsers() }, [])

  const AddDialog = addDialogMap[type]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {type === "consumer" ? "Consumers" : type === "meterReader" ? "Meter Readers" : "Cashiers"}
            </h1>
            <p className="text-muted-foreground">
              Manage {type === "consumer" ? "consumer accounts" : type === "meterReader" ? "meter readers and assignments" : "cashiers and billing operations"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={fetchUsers} disabled={loading}>Refresh</Button>
            <AddDialog onAdded={fetchUsers} />
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 flex items-center space-x-2 text-red-800">
              <XCircle className="h-4 w-4" />
              <span>{error}</span>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>
              {type === "consumer" ? "Consumer Accounts" : type === "meterReader" ? "Meter Reader Accounts" : "Cashier Accounts"}
            </CardTitle>
            <CardDescription>
              Manage all {type === "consumer" ? "consumer accounts" : type === "meterReader" ? "meter readers and their assignments" : "cashier accounts and billing operations"}
            </CardDescription>
            <div className="pt-4 relative max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-8" value={searchQuery} onChange={e => handleSearch(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Users className="h-6 w-6 animate-spin mr-2" />
                <span>Loading {type === "consumer" ? "consumers" : type === "meterReader" ? "meter readers" : "cashiers"}...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No {type === "consumer" ? "consumers" : type === "meterReader" ? "meter readers" : "cashiers"} found</h3>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    {type === "consumer" && <TableHead>Water Meter</TableHead>}
                    {type === "cashier" && <TableHead>Employee ID</TableHead>}
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      {type === "consumer" && <TableCell>{user.water_meter_no}</TableCell>}
                      {type === "cashier" && <TableCell>{user.employee_id}</TableCell>}
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.is_suspended || user.status === "suspended" ? (
                          <Badge variant="destructive">Suspended</Badge>
                        ) : (
                          <Badge variant="default">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            {type === "consumer" && (
                              <DropdownMenuItem onClick={() => { setSelectedConsumer(user); setDetailsDialogOpen(true) }}>
                                View Details
                              </DropdownMenuItem>
                            )}
                            {(type === "meterReader" || type === "cashier") && (
                              <DropdownMenuItem onClick={() => handleStatusChange(user.id, !(user.is_suspended || user.status === "suspended"))}>
                                {(user.is_suspended || user.status === "suspended") ? "Activate" : "Suspend"}
                              </DropdownMenuItem>
                            )}
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

      {/* Dialogs */}
      {type === "consumer" && selectedConsumer && (
        <ViewConsumerDetailsDialog
          consumer={selectedConsumer}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
        />
      )}

      {type === "meterReader" && selectedMeterReaderForAssignment && (
        <AssignConsumersDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          meterReaderId={selectedMeterReaderForAssignment.id}
          meterReaderName={selectedMeterReaderForAssignment.name}
        />
      )}

      {type === "meterReader" && selectedMeterReaderForViewing && (
        <ViewAssignedConsumersDialog
          open={viewAssignedDialogOpen}
          onOpenChange={setViewAssignedDialogOpen}
          meterReaderId={selectedMeterReaderForViewing.id}
          meterReaderName={selectedMeterReaderForViewing.name}
        />
      )}

      {type === "meterReader" && selectedMeterReader && (
        <ViewMeterReaderDialog
          open={viewMeterReaderDialogOpen}
          onOpenChange={setViewMeterReaderDialogOpen}
          meterReader={selectedMeterReader}
          onStatusChange={(id, status) => handleStatusChange(id, status)}
        />
      )}
    </AdminLayout>
  )
}
