"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Calendar, Clock, User } from "lucide-react"
import { toast } from "sonner"
import { IssueService } from "@/lib/issue-service"

interface ScheduleFixDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  issueId: number
  issueTitle: string
  customerName: string
  onScheduleSet?: () => void
}

export function ScheduleFixDialog({
  open,
  onOpenChange,
  issueId,
  issueTitle,
  customerName,
  onScheduleSet,
}: ScheduleFixDialogProps) {
  const [loading, setLoading] = useState(false)
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("09:00")
  const [technician, setTechnician] = useState("")
  const [notes, setNotes] = useState("")

  const handleSchedule = async () => {
    if (!scheduledDate) {
      toast.error("Please select a date for the fix")
      return
    }

    try {
      setLoading(true)

      // Combine date and time
      const scheduledDateTime = `${scheduledDate}T${scheduledTime}:00.000Z`

      // Use the IssueService to schedule the issue
      // This will update the status to 'assigned' automatically
      const result = await IssueService.scheduleIssue(
        issueId,
        scheduledDateTime,
        technician || undefined,
        notes || undefined
      )

      if (result.error) {
        throw new Error(`Failed to schedule fix: ${result.error.message}`)
      }

      toast.success("Fix scheduled successfully!", {
        description: `Status updated to "Assigned". Technician will visit on ${new Date(scheduledDateTime).toLocaleDateString('en-US', {
          dateStyle: 'full'
        })} at ${scheduledTime}`
      })

      // Call refresh callback if provided
      onScheduleSet?.()

      // Reset form
      setScheduledDate("")
      setTechnician("")
      setNotes("")
      setScheduledTime("09:00")

      onOpenChange(false)
    } catch (error) {
      console.error('Error scheduling fix:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to schedule fix')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>Schedule Fix</span>
          </DialogTitle>
          <DialogDescription>
            Schedule when the water technician will fix this issue
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Issue Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Issue:</span>
              <Badge variant="outline">{issueTitle}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Customer:</span>
              <span className="text-sm text-gray-900">{customerName}</span>
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="scheduledDate" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Fix Date *</span>
            </Label>
            <Input
              id="scheduledDate"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label htmlFor="scheduledTime" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Fix Time</span>
            </Label>
            <Input
              id="scheduledTime"
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Default: 9:00 AM
            </p>
          </div>

          {/* Technician Assignment */}
          <div className="space-y-2">
            <Label htmlFor="technician" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Assigned Technician (Optional)</span>
            </Label>
            <Input
              id="technician"
              placeholder="Enter technician name"
              value={technician}
              onChange={(e) => setTechnician(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any special instructions or notes for the technician..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSchedule}
              disabled={loading || !scheduledDate}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Fix
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

