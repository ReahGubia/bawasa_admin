"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Users,
  Search,
  MoreHorizontal,
  Loader2,
  RefreshCw,
  Droplets,
  XCircle
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MeterReaderService, MeterReaderUser } from "@/lib/meter-reader-service"
import { supabase } from "@/lib/supabase"
import { AddMeterReaderDialog } from "@/components/add-meter-reader-dialog"
import { AssignConsumersDialog } from "@/components/assign-consumers-dialog"
import { ViewAssignedConsumersDialog } from "@/components/view-assigned-consumers-dialog"
import { ViewMeterReaderDialog } from "@/components/ViewMeterReaderDialog"

export default function MeterReaderManagementPage() {
  const [meterReaders, setMeterReaders] = useState<MeterReaderUser[]>([])
  const [filteredMeterReaders, setFilteredMeterReaders] = useState<MeterReaderUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedMeterReaderForAssignment, setSelectedMeterReaderForAssignment] = useState<{id: number, name: string} | null>(null)

  const [viewAssignedDialogOpen, setViewAssignedDialogOpen] = useState(false)
  const [selectedMeterReaderForViewing, setSelectedMeterReaderForViewing] = useState<{id: number, name: string} | null>(null)

  const [viewMeterReaderDialogOpen, setViewMeterReaderDialogOpen] = useState(false)
  const [selectedMeterReader, setSelectedMeterReader] = useState<MeterReaderUser | null>(null)

  const [assignmentCounts, setAssignmentCounts] = useState<Record<number, number>>({})
  const [completedCounts, setCompletedCounts] = useState<Record<number, number>>({})

  // Fetch all meter readers
  const fetchMeterReaders = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await MeterReaderService.getAllMeterReaders()
      if (error) {
        setError(error.message || "Failed to fetch meter readers")
        return
      }
      if (data) {
        // Normalize status to only active, suspended, or deleted
        const normalizedData = data.map((reader: any) => ({
          ...reader,
          status: ['active', 'suspended', 'deleted'].includes(reader.status) ? reader.status : 'active',
        }))
        setMeterReaders(normalizedData)
        setFilteredMeterReaders(normalizedData)
        const meterReaderIds = normalizedData.map(m => m.meter_reader_id).filter(Boolean)
        fetchAssignmentCounts(meterReaderIds)
        fetchCompletedCounts(meterReaderIds)
      }
    } catch {
      setError("Unexpected error fetching meter readers")
    } finally {
      setLoading(false)
    }
  }

  const fetchAssignmentCounts = async (ids: (number | null)[]) => {
    const counts: Record<number, number> = {}
    for (const id of ids) {
      if (!id) continue
      const { count } = await supabase.from('meter_reader_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('meter_reader_id', id)
        .in('status', ['assigned', 'ongoing'])
      counts[id] = count || 0
    }
    setAssignmentCounts(counts)
  }

  const fetchCompletedCounts = async (ids: (number | null)[]) => {
    const counts: Record<number, number> = {}
    for (const id of ids) {
      if (!id) continue
      const { count } = await supabase.from('meter_reader_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('meter_reader_id', id)
        .eq('status', 'completed')
      counts[id] = count || 0
    }
    setCompletedCounts(counts)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredMeterReaders(meterReaders)
      return
    }
    const filtered = meterReaders.filter(r =>
      r.full_name?.toLowerCase().includes(query.toLowerCase()) ||
      r.email?.toLowerCase().includes(query.toLowerCase()) ||
      r.mobile_no?.toString().includes(query)
    )
    setFilteredMeterReaders(filtered)
  }

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

  useEffect(() => { fetchMeterReaders() }, [])

  // Handle suspension/deletion: release all assigned consumers
  const handleStatusChange = async (id: number, newStatus: string) => {
    setMeterReaders(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m))
    setFilteredMeterReaders(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m))

    if (newStatus === 'suspended' || newStatus === 'deleted') {
      await supabase.from('meter_reader_assignments')
        .update({ status: 'unassigned', meter_reader_id: null })
        .eq('meter_reader_id', id)
        .in('status', ['assigned', 'ongoing'])

      const meterReaderIds = meterReaders.map(m => m.meter_reader_id).filter(Boolean)
      fetchAssignmentCounts(meterReaderIds)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meter Readers</h1>
            <p className="text-muted-foreground">Manage meter readers and assigned routes</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={fetchMeterReaders} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <AddMeterReaderDialog onMeterReaderAdded={fetchMeterReaders} />
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

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Meter Reader Accounts</CardTitle>
            <CardDescription>Manage meter readers and assigned consumers</CardDescription>
            <div className="flex items-center space-x-2 pt-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search meter readers..." className="pl-8" value={searchQuery} onChange={e => handleSearch(e.target.value)} />
              </div>
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
                <p className="text-muted-foreground">{searchQuery ? 'Try adjusting your search criteria' : 'No meter readers registered yet'}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Mobile Number</TableHead>
                    <TableHead>Assigned</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMeterReaders.map(reader => (
                    <TableRow key={reader.id}>
                      {/* Name + Status Dot */}
                      <TableCell className="font-medium flex items-center space-x-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span>{reader.full_name || 'No name provided'}</span>
                        <span
                          className={`h-2 w-2 rounded-full inline-block ${
                            reader.status === 'active'
                              ? 'bg-green-500'
                              : reader.status === 'suspended'
                              ? 'bg-red-500'
                              : 'bg-gray-400'
                          }`}
                          title={reader.status ?? ""}
                        />
                      </TableCell>

                      <TableCell>{reader.email || 'No email provided'}</TableCell>
                      <TableCell>{reader.mobile_no?.toString() || 'No phone provided'}</TableCell>

                      {/* Assigned and Completed Counts */}
                      <TableCell>
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                          {assignmentCounts[reader.meter_reader_id] || 0} consumer{assignmentCounts[reader.meter_reader_id] !== 1 ? 's' : ''}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-50 text-green-700 border-green-200">
                          {completedCounts[reader.meter_reader_id] || 0} reading{completedCounts[reader.meter_reader_id] !== 1 ? 's' : ''}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(reader.created_at)}</TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => {
                              setSelectedMeterReaderForViewing({id: reader.id, name: reader.full_name || 'Unknown'})
                              setViewAssignedDialogOpen(true)
                            }}>
                              <Users className="h-4 w-4 mr-2" />View Assigned Consumers
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedMeterReader({ ...reader })
                              setViewMeterReaderDialogOpen(true)
                            }}>
                              <Users className="h-4 w-4 mr-2" />View / Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedMeterReaderForAssignment({id: reader.id, name: reader.full_name || 'Unknown'})
                                setAssignDialogOpen(true)
                              }}
                              disabled={reader.status !== 'active'}
                            >
                              <Droplets className="h-4 w-4 mr-2" />Assign Consumers
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

      {/* Dialogs */}
      {selectedMeterReaderForAssignment && (
        <AssignConsumersDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          meterReaderId={selectedMeterReaderForAssignment.id}
          meterReaderName={selectedMeterReaderForAssignment.name}
        />
      )}

      {selectedMeterReaderForViewing && (
        <ViewAssignedConsumersDialog
          open={viewAssignedDialogOpen}
          onOpenChange={setViewAssignedDialogOpen}
          meterReaderId={selectedMeterReaderForViewing.id}
          meterReaderName={selectedMeterReaderForViewing.name}
        />
      )}

      {selectedMeterReader && (
        <ViewMeterReaderDialog
          open={viewMeterReaderDialogOpen}
          onOpenChange={setViewMeterReaderDialogOpen}
          meterReader={selectedMeterReader}
          onStatusChange={handleStatusChange}
        />
      )}
    </AdminLayout>
  )
}
