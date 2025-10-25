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
import { UserPlus, Loader2 } from "lucide-react"
import { CashierService, CreateCashierData } from "@/lib/cashier-service"

interface AddCashierDialogProps {
  onCashierAdded: () => void
}

export function AddCashierDialog({ onCashierAdded }: AddCashierDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateCashierData>({
    email: '',
    password: '',
    full_name: '',
    full_address: '',
    mobile_no: '',
    hire_date: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password || !formData.full_name || !formData.hire_date) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await CashierService.createCashier(formData)
      
      if (error) {
        setError(error.message || 'Failed to create cashier')
        return
      }

      if (data) {
        // Reset form
        setFormData({
          email: '',
          password: '',
          full_name: '',
          full_address: '',
          mobile_no: '',
          hire_date: ''
        })
        setOpen(false)
        onCashierAdded()
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Error creating cashier:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateCashierData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add New Cashier
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Cashier</DialogTitle>
          <DialogDescription>
            Create a new cashier account for billing operations.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile_no">Mobile Number</Label>
            <Input
              id="mobile_no"
              value={formData.mobile_no}
              onChange={(e) => handleInputChange('mobile_no', e.target.value)}
              placeholder="Enter mobile number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hire_date">Hire Date *</Label>
            <Input
              id="hire_date"
              type="date"
              value={formData.hire_date}
              onChange={(e) => handleInputChange('hire_date', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_address">Address</Label>
            <Textarea
              id="full_address"
              value={formData.full_address}
              onChange={(e) => handleInputChange('full_address', e.target.value)}
              placeholder="Enter full address"
              rows={3}
            />
          </div>

          <DialogFooter>
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
              Create Cashier
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
