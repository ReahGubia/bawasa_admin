"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, Droplets, Calendar } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { MeterReaderAssignmentService } from "@/lib/meter-reader-assignment-service"

interface AssignConsumersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meterReaderId: number
  meterReaderName: string
}

interface Consumer {
  id: string
  water_meter_no: string
  full_name: string
  email: string
  address: string
  needsReading: boolean
  lastReadingDate: string | null
  isAlreadyAssigned: boolean
  assignedMeterReaderId?: number
  hasCompletedReading: boolean
  isSuspended: boolean
  existingAssignmentStatus?: string
}

export function AssignConsumersDialog({
  open,
  onOpenChange,
  meterReaderId,
  meterReaderName,
}: AssignConsumersDialogProps) {
  const [consumers, setConsumers] = useState<Consumer[]>([])
  const [filteredConsumers, setFilteredConsumers] = useState<Consumer[]>([])
  const [selectedConsumers, setSelectedConsumers] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isNearEndOfMonth, setIsNearEndOfMonth] = useState(false)

  useEffect(() => {
    if (open) {
      checkEndOfMonth()
      loadConsumers()
    }
  }, [open])

  const checkEndOfMonth = () => {
    const today = new Date()
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    const daysUntilEnd = lastDayOfMonth.getDate() - today.getDate()
    setIsNearEndOfMonth(daysUntilEnd <= 3)
  }

  const loadConsumers = async () => {
    try {
      setLoading(true)
      const { data: allConsumers, error: consumersError } = await supabase
        .from('consumers')
        .select(`
          id,
          water_meter_no,
          is_suspended,
          accounts!consumer_id (
            full_name,
            email,
            full_address
          )
        `)

      if (consumersError) throw new Error(consumersError.message)

      const { data: existingAssignments } = await supabase
        .from('meter_reader_assignments')
        .select('consumer_id, meter_reader_id, status')
        .in('status', ['assigned', 'ongoing'])

      const assignedConsumerMap = new Map(
        (existingAssignments || []).map(a => [a.consumer_id, a.meter_reader_id])
      )

      const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      const currentMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59)

      const { data: completedAssignments } = await supabase
        .from('meter_reader_assignments')
        .select('consumer_id')
        .eq('status', 'completed')
        .gte('updated_at', currentMonthStart.toISOString())
        .lte('updated_at', currentMonthEnd.toISOString())

      const completedConsumerIds = new Set((completedAssignments || []).map(a => a.consumer_id))

      const consumersWithReadings = await Promise.all(
        (allConsumers || []).map(async (consumer: any) => {
          const { data: lastReading } = await supabase
            .from('bawasa_meter_readings')
            .select('created_at')
            .eq('consumer_id', consumer.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          const assignedMeterReaderId = assignedConsumerMap.get(consumer.id) || null
          const isAlreadyAssigned = assignedMeterReaderId !== null

          const hasCompletedReading = completedConsumerIds.has(consumer.id)
          const needsReading = !lastReading || shouldNeedNewReading(lastReading.created_at)

          return {
            id: consumer.id,
            water_meter_no: consumer.water_meter_no,
            full_name: (consumer.accounts as any)?.full_name || 'Unknown',
            email: (consumer.accounts as any)?.email || 'No email',
            address: (consumer.accounts as any)?.full_address || 'No address',
            needsReading,
            lastReadingDate: lastReading?.created_at || null,
            isAlreadyAssigned,
            assignedMeterReaderId,
            hasCompletedReading,
            isSuspended: consumer.is_suspended,
          }
        })
      )

      setConsumers(consumersWithReadings)
      setFilteredConsumers(consumersWithReadings)
    } catch (error) {
      console.error(error)
      toast.error('Failed to load consumers')
    } finally {
      setLoading(false)
    }
  }

  const shouldNeedNewReading = (lastReadingDate: string): boolean => {
    const today = new Date()
    const lastDate = new Date(lastReadingDate)
    const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
    return daysDiff >= 25
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredConsumers(consumers)
      return
    }
    const filtered = consumers.filter(consumer =>
      consumer.full_name.toLowerCase().includes(query.toLowerCase()) ||
      consumer.water_meter_no.includes(query) ||
      consumer.email.toLowerCase().includes(query.toLowerCase())
    )
    setFilteredConsumers(filtered)
  }

  const toggleConsumer = (consumerId: string, disabled: boolean) => {
    if (disabled) return
    const newSelected = new Set(selectedConsumers)
    if (newSelected.has(consumerId)) newSelected.delete(consumerId)
    else newSelected.add(consumerId)
    setSelectedConsumers(newSelected)
  }

  const handleAssign = async () => {
    if (selectedConsumers.size === 0) {
      toast.error('Please select at least one consumer')
      return
    }
    try {
      setLoading(true)
      const selectedConsumerIds = Array.from(selectedConsumers)
      const { error } = await MeterReaderAssignmentService.assignConsumers(
        meterReaderId,
        selectedConsumerIds
      )
      if (error) throw new Error(error.message || 'Failed to assign consumers')
      toast.success(`Successfully assigned ${selectedConsumerIds.length} consumer(s) to ${meterReaderName}`)
      onOpenChange(false)
      setSelectedConsumers(new Set())
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Failed to assign consumers')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Droplets className="h-5 w-5 text-blue-600" />
            <span>Assign Consumers to Meter Reader</span>
          </DialogTitle>
          <DialogDescription>
            Select consumers for <strong>{meterReaderName}</strong> to visit and collect meter readings.
            {isNearEndOfMonth && (
              <Badge variant="outline" className="ml-2 bg-orange-50 border-orange-200 text-orange-700">
                <Calendar className="h-3 w-3 mr-1" />
                End of month approaching
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Search by name, email, or water meter number..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full"
          />

          <div className="border rounded-lg max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading consumers...</span>
              </div>
            ) : filteredConsumers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No consumers found
              </div>
            ) : (
              <div className="divide-y">
                {filteredConsumers.map((consumer) => (
                  <div
                    key={consumer.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors 
                      ${selectedConsumers.has(consumer.id) ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
                      ${consumer.isSuspended || (consumer.isAlreadyAssigned && consumer.assignedMeterReaderId !== meterReaderId) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => toggleConsumer(consumer.id, consumer.isSuspended || (consumer.isAlreadyAssigned && consumer.assignedMeterReaderId !== meterReaderId))}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{consumer.full_name}</span>
                          {consumer.needsReading && (
                            <Badge variant="destructive" className="text-xs">Needs Reading</Badge>
                          )}
                          {consumer.lastReadingDate && (
                            <Badge variant="outline" className="text-xs">
                              Last: {new Date(consumer.lastReadingDate).toLocaleDateString()}
                            </Badge>
                          )}
                          {consumer.isSuspended && (
                            <Badge variant="destructive" className="text-xs">Suspended</Badge>
                          )}
                          {consumer.isAlreadyAssigned && consumer.assignedMeterReaderId !== meterReaderId && (
                            <Badge variant="outline" className="text-xs">
                              Assigned to another meter reader
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Meter: <span className="font-mono">{consumer.water_meter_no}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{consumer.email}</p>
                      </div>
                      <div>
                        {selectedConsumers.has(consumer.id) ? (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        ) : (
                          <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedConsumers.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <span className="text-sm font-medium">
                {selectedConsumers.size} consumer{selectedConsumers.size > 1 ? 's' : ''} selected
              </span>
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button onClick={handleAssign} disabled={loading || selectedConsumers.size === 0}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Assign {selectedConsumers.size} Consumer{selectedConsumers.size > 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
