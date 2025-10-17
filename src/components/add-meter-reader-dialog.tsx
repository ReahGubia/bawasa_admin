"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UserPlus, Loader2 } from "lucide-react"
import { MeterReaderService, CreateMeterReaderData } from "@/lib/meter-reader-service"
import { toast } from "sonner"

interface AddMeterReaderDialogProps {
  onMeterReaderAdded: () => void
}

export function AddMeterReaderDialog({ onMeterReaderAdded }: AddMeterReaderDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateMeterReaderData>({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    assigned_route: "",
    territory: "",
    supervisor_id: "",
    hire_date: "",
    notes: ""
  })

  const handleInputChange = (field: keyof CreateMeterReaderData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password || !formData.full_name) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const { data, error } = await MeterReaderService.createMeterReader(formData)
      
      if (error) {
        console.error('Error creating meter reader:', error)
        toast.error(error.message || "Failed to create meter reader")
        return
      }

      if (data) {
        toast.success("Meter reader created successfully!")
        setOpen(false)
        setFormData({
          email: "",
          password: "",
          full_name: "",
          phone: "",
          assigned_route: "",
          territory: "",
          supervisor_id: "",
          hire_date: "",
          notes: ""
        })
        onMeterReaderAdded()
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add New Meter Reader
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Meter Reader</DialogTitle>
          <DialogDescription>
            Create a new meter reader account. The user will be able to log in with the provided credentials.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="meter.reader@bawasa.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter secure password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+1234567890"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assigned_route">Assigned Route</Label>
                <Select value={formData.assigned_route} onValueChange={(value) => handleInputChange("assigned_route", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select route" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Route A-01">Route A-01</SelectItem>
                    <SelectItem value="Route A-02">Route A-02</SelectItem>
                    <SelectItem value="Route B-01">Route B-01</SelectItem>
                    <SelectItem value="Route B-02">Route B-02</SelectItem>
                    <SelectItem value="Route C-01">Route C-01</SelectItem>
                    <SelectItem value="Route C-02">Route C-02</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="territory">Territory</Label>
                <Select value={formData.territory} onValueChange={(value) => handleInputChange("territory", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select territory" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="North District">North District</SelectItem>
                    <SelectItem value="South District">South District</SelectItem>
                    <SelectItem value="East District">East District</SelectItem>
                    <SelectItem value="West District">West District</SelectItem>
                    <SelectItem value="Central District">Central District</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hire_date">Hire Date</Label>
              <Input
                id="hire_date"
                type="date"
                value={formData.hire_date}
                onChange={(e) => handleInputChange("hire_date", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about this meter reader..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Meter Reader
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
