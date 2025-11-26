"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MeterReaderUser, MeterReaderService } from "@/lib/meter-reader-service"
import { Loader2 } from "lucide-react"

interface ViewMeterReaderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meterReader: MeterReaderUser
  onStatusChange?: (id: number, newStatus: string) => void // notify parent of status change
}

export function ViewMeterReaderDialog({
  open,
  onOpenChange,
  meterReader,
  onStatusChange
}: ViewMeterReaderDialogProps) {
  const [fullName, setFullName] = useState(meterReader.full_name ?? "")
  const [email, setEmail] = useState(meterReader.email ?? "")
  const [mobileNo, setMobileNo] = useState(meterReader.mobile_no?.toString() ?? "")
  const [address, setAddress] = useState(meterReader.full_address ?? "")
  const [status, setStatus] = useState(meterReader.status ?? "active")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setFullName(meterReader.full_name ?? "")
    setEmail(meterReader.email ?? "")
    setMobileNo(meterReader.mobile_no?.toString() ?? "")
    setAddress(meterReader.full_address ?? "")
    setStatus(meterReader.status ?? "active")
  }, [meterReader])

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await MeterReaderService.updateMeterReader(meterReader.id.toString(), {
        full_name: fullName,
        email,
        mobile_no: mobileNo ? Number(mobileNo) : null,
        full_address: address,
        status
      })

      if (error) {
        setError(error.message || "Failed to update meter reader")
      } else {
        // Notify parent of status change to dynamically update Assign button
        if (onStatusChange) onStatusChange(meterReader.id, status)
        onOpenChange(false) // close dialog
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>View / Edit Meter Reader</DialogTitle>
          <DialogDescription>Update meter reader information and status.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mobile Number</label>
            <Input value={mobileNo} onChange={(e) => setMobileNo(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Full Address</label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded-md p-2"
            >
              <option value="active">Active</option>
              <option value="suspended">Suspend</option>
              <option value="deleted">Archive</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
