"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { UserPlus, Loader2, Home, DollarSign, Droplets } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AddConsumerDialogProps {
  onConsumerAdded?: () => void
}

interface ConsumerFormData {
  // Personal Information
  email: string
  password: string
  full_name: string
  phone: string
  address: string
  
  // Water Meter Information
  water_meter_no: string
  billing_month: string
  meter_reading_date: string
  
  // Initial Meter Readings
  previous_reading: string
  present_reading: string
  
  // Billing Information
  due_date: string
  payment_status: string
  notes: string
}

export function AddConsumerDialog({ onConsumerAdded }: AddConsumerDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<ConsumerFormData>({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    address: "",
    water_meter_no: "",
    billing_month: "",
    meter_reading_date: "",
    previous_reading: "0",
    present_reading: "0",
    due_date: "",
    payment_status: "unpaid",
    notes: ""
  })

  const [meterValidationError, setMeterValidationError] = useState<string | null>(null)

  const handleInputChange = (field: keyof ConsumerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
    if (meterValidationError) setMeterValidationError(null)
  }

  // Check if water meter number already exists
  const checkMeterNumber = async (meterNumber: string) => {
    if (!meterNumber.trim()) {
      setMeterValidationError(null)
      return
    }

    try {
      const response = await fetch('/api/consumers/check-meter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ water_meter_no: meterNumber }),
      })

      const result = await response.json()

      if (response.ok) {
        if (result.exists) {
          setMeterValidationError(`Water meter number ${meterNumber} already exists`)
        } else {
          setMeterValidationError(null)
        }
      } else {
        console.error('Error checking meter number:', result.error)
      }
    } catch (err) {
      console.error('Error checking meter number:', err)
    }
  }

  // Debounced meter number validation
  const debouncedCheckMeter = (() => {
    let timeoutId: NodeJS.Timeout
    return (meterNumber: string) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => checkMeterNumber(meterNumber), 500)
    }
  })()

  const generateWaterMeterNumber = async () => {
    const currentYear = new Date().getFullYear()
    let attempts = 0
    const maxAttempts = 10
    
    while (attempts < maxAttempts) {
      const randomNumber = Math.floor(Math.random() * 999) + 1
      const meterNumber = `B-${currentYear}-${randomNumber.toString().padStart(3, '0')}`
      
      // Check if this meter number already exists
      try {
        const response = await fetch('/api/consumers/check-meter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ water_meter_no: meterNumber }),
        })

        const result = await response.json()

        if (response.ok && !result.exists) {
          // Meter number is unique, use it
          handleInputChange("water_meter_no", meterNumber)
          setMeterValidationError(null)
          return
        }
      } catch (err) {
        console.error('Error checking generated meter number:', err)
      }
      
      attempts++
    }
    
    // If we couldn't generate a unique number after max attempts
    setMeterValidationError('Unable to generate a unique meter number. Please try again.')
  }

  const calculateConsumption = () => {
    const prev = parseFloat(formData.previous_reading) || 0
    const present = parseFloat(formData.present_reading) || 0
    return Math.max(0, present - prev)
  }

  const getCurrentMonth = () => {
    const now = new Date()
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ]
    return `${monthNames[now.getMonth()]} ${now.getFullYear()}`
  }

  const getDefaultDueDate = () => {
    const now = new Date()
    const dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 15) // 15th of next month
    return dueDate.toISOString().split('T')[0]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.email || !formData.password || !formData.full_name || !formData.water_meter_no) {
      setError("Please fill in all required fields")
      return
    }

    if (meterValidationError) {
      setError("Please fix the water meter number error before submitting")
      return
    }

    if (parseFloat(formData.present_reading) < parseFloat(formData.previous_reading)) {
      setError("Present reading cannot be less than previous reading")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/consumers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          billing_month: formData.billing_month || getCurrentMonth(),
          meter_reading_date: formData.meter_reading_date || new Date().toISOString().split('T')[0],
          due_date: formData.due_date || getDefaultDueDate(),
          consumption_cubic_meters: calculateConsumption(),
          amount_current_billing: calculateConsumption() * 25, // Assuming 25 pesos per cubic meter
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create consumer')
      }

      console.log('✅ Consumer created successfully:', result)
      
      // Reset form
      setFormData({
        email: "",
        password: "",
        full_name: "",
        phone: "",
        address: "",
        water_meter_no: "",
        billing_month: "",
        meter_reading_date: "",
        previous_reading: "0",
        present_reading: "0",
        due_date: "",
        payment_status: "unpaid",
        notes: ""
      })
      
      setOpen(false)
      onConsumerAdded?.()
      
    } catch (err) {
      console.error('❌ Error creating consumer:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const consumption = calculateConsumption()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add New Consumer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Water Billing Record</DialogTitle>
          <DialogDescription>
            Create a new water billing record with meter and consumer information.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Home className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription>
                Basic consumer account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+63 912 345 6789"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Service Address</Label>
                <Textarea
                  id="address"
                  placeholder="123 Main Street, Barangay, City, Province"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Water Meter Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Droplets className="h-5 w-5" />
                <span>Water Meter Information</span>
              </CardTitle>
              <CardDescription>
                Water meter details and initial readings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="water_meter_no">Water Meter Number *</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="water_meter_no"
                      placeholder="B-2024-001"
                      value={formData.water_meter_no}
                      onChange={(e) => {
                        handleInputChange("water_meter_no", e.target.value)
                        debouncedCheckMeter(e.target.value)
                      }}
                      required
                      className={meterValidationError ? "border-red-500" : ""}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateWaterMeterNumber}
                      className="whitespace-nowrap"
                    >
                      Generate
                    </Button>
                  </div>
                  {meterValidationError && (
                    <p className="text-sm text-red-600">{meterValidationError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing_month">Billing Month</Label>
                  <Input
                    id="billing_month"
                    placeholder={getCurrentMonth()}
                    value={formData.billing_month}
                    onChange={(e) => handleInputChange("billing_month", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="previous_reading">Previous Reading (cu.m)</Label>
                  <Input
                    id="previous_reading"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.previous_reading}
                    onChange={(e) => handleInputChange("previous_reading", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="present_reading">Present Reading (cu.m)</Label>
                  <Input
                    id="present_reading"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.present_reading}
                    onChange={(e) => handleInputChange("present_reading", e.target.value)}
                  />
                </div>
              </div>
              
              {consumption > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="flex items-center space-x-2 text-blue-800">
                    <Droplets className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Consumption: {consumption.toFixed(2)} cubic meters
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Billing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Billing Information</span>
              </CardTitle>
              <CardDescription>
                Billing period and payment details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="meter_reading_date">Meter Reading Date</Label>
                  <Input
                    id="meter_reading_date"
                    type="date"
                    value={formData.meter_reading_date}
                    onChange={(e) => handleInputChange("meter_reading_date", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => handleInputChange("due_date", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payment_status">Payment Status</Label>
                <Select
                  value={formData.payment_status}
                  onValueChange={(value) => handleInputChange("payment_status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes or comments..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Water Billing Record
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
