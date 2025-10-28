"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"
import { LatestMeterReadingByUser } from "@/lib/meter-readings-service"

interface MeterReadingDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reading: LatestMeterReadingByUser | null
}

export function MeterReadingDetailsDialog({
  open,
  onOpenChange,
  reading,
}: MeterReadingDetailsDialogProps) {
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

  if (!reading) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Meter Reading Details</DialogTitle>
          <DialogDescription>
            Detailed information about this meter reading
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* User Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">User Name</div>
              <div className="text-base font-semibold">{reading.user_name || 'Unknown User'}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Email</div>
              <div className="text-base">{reading.user_email || 'N/A'}</div>
            </div>
          </div>

          {/* Meter Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Reading ID</div>
              <div className="text-base font-mono">{reading.id}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Water Meter Number</div>
              <Badge variant="outline" className="text-base">{reading.water_meter_no}</Badge>
            </div>
          </div>

          {/* Reading Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Present Reading</div>
              <div className="text-2xl font-bold font-mono text-blue-600">
                {reading.present_reading?.toLocaleString() || '0'}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Previous Reading</div>
              <div className="text-2xl font-bold font-mono text-gray-600">
                {reading.previous_reading?.toLocaleString() || '0'}
              </div>
            </div>
          </div>

          {/* Consumption */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Consumption (Cubic Meters)</div>
            <div className="text-3xl font-bold font-mono text-green-600">
              {reading.consumption_cubic_meters?.toLocaleString() || '0'} cu.m
            </div>
          </div>

          {/* Billing Information */}
          <div className="grid grid-cols-2 gap-4">
            
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Payment Status</div>
              <div>{getStatusBadge(reading.payment_status)}</div>
            </div>
          </div>

          {/* Date Information */}
          <div className="grid grid-cols-2 gap-4">
           
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Last Submitted</div>
              <div className="text-base">{formatDate(reading.created_at)}</div>
            </div>
          </div>

          {/* Total Readings */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Total Readings for User</div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-base">
              {reading.total_readings} reading{reading.total_readings !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

