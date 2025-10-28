"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"
import { MeterReadingsService, MeterReadingWithUser } from "@/lib/meter-readings-service"

interface UserMeterReadingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userName: string
  userEmail: string
}

export function UserMeterReadingsDialog({
  open,
  onOpenChange,
  userId,
  userName,
  userEmail,
}: UserMeterReadingsDialogProps) {
  const [readings, setReadings] = useState<MeterReadingWithUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && userId) {
      loadUserReadings()
    }
  }, [open, userId])

  const loadUserReadings = async () => {
    try {
      setLoading(true)
      setError(null)
      const userReadings = await MeterReadingsService.getMeterReadingsByUserId(userId)
      setReadings(userReadings)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load meter readings')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>
      case "unpaid":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Unpaid</Badge>
      case "partial":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Partial</Badge>
      case "overdue":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Overdue</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Meter Readings History</DialogTitle>
          <DialogDescription>
            Complete meter readings history for {userName} ({userEmail})
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800">{error}</span>
              <Button variant="outline" size="sm" onClick={loadUserReadings} className="ml-auto">
                Retry
              </Button>
            </div>
          )}
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading meter readings...</span>
            </div>
          ) : readings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No meter readings found for this user.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reading ID</TableHead>
                  <TableHead>Water Meter No</TableHead>
                  <TableHead>Previous Reading</TableHead>
                  <TableHead>Present Reading</TableHead>
                  <TableHead>Consumption</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {readings.map((reading) => (
                  <TableRow key={reading.id}>
                    <TableCell className="font-medium">{reading.id.slice(0, 8)}...</TableCell>
                    <TableCell>
                      <Badge variant="outline">{reading.water_meter_no}</Badge>
                    </TableCell>
                    <TableCell className="font-mono">{reading.previous_reading?.toLocaleString() || '0'}</TableCell>
                    <TableCell className="font-mono">{reading.present_reading?.toLocaleString() || '0'}</TableCell>
                    <TableCell className="font-mono font-semibold text-blue-600">
                      {reading.consumption_cubic_meters?.toLocaleString() || '0'} cu.m
                    </TableCell>
                    <TableCell>{getStatusBadge(reading.payment_status)}</TableCell>
                    <TableCell>{formatDate(reading.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Total readings: {readings.length}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
