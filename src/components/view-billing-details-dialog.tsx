"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BillingWithDetails } from "@/lib/billing-service"
import { 
  Receipt, 
  User, 
  Droplets, 
  Calendar, 
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText
} from "lucide-react"

interface ViewBillingDetailsDialogProps {
  billing: BillingWithDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewBillingDetailsDialog({ 
  billing, 
  open, 
  onOpenChange 
}: ViewBillingDetailsDialogProps) {
  
  if (!billing) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>
      case 'unpaid':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Unpaid</Badge>
      case 'partial':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800"><AlertCircle className="h-3 w-3 mr-1" />Partial</Badge>
      case 'overdue':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Overdue</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Receipt className="h-5 w-5" />
            <span>Billing Details</span>
          </DialogTitle>
          <DialogDescription>
            Complete billing information for {billing.consumer?.accounts?.full_name || 'Customer'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Customer Information</span>
              </CardTitle>
              <CardDescription>Customer details for this billing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-sm font-semibold">{billing.consumer?.accounts?.full_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm font-semibold">{billing.consumer?.accounts?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Water Meter Number</p>
                  <p className="text-sm font-semibold font-mono">{billing.consumer?.water_meter_no || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Mobile Number</p>
                  <p className="text-sm font-semibold">{billing.consumer?.accounts?.mobile_no || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-sm font-semibold">{billing.consumer?.accounts?.full_address || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Billing Summary</span>
              </CardTitle>
              <CardDescription>
                Overview of this billing period
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Billing Month</p>
                  <p className="text-sm font-semibold">{billing.billing_month}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Due Date</p>
                  <p className="text-sm font-semibold">{formatDate(billing.due_date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Status</p>
                  <div className="mt-1">{getStatusBadge(billing.payment_status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Date</p>
                  <p className="text-sm font-semibold">{formatDateTime(billing.payment_date)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consumption Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Droplets className="h-5 w-5" />
                <span>Water Consumption</span>
              </CardTitle>
              <CardDescription>
                Detailed consumption breakdown
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Consumption 10 or Below (cubic meters)</p>
                  <p className="text-sm font-semibold">{billing.consumption_10_or_below?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Consumption Over 10 (cubic meters)</p>
                  <p className="text-sm font-semibold">{billing.consumption_over_10?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
              <Separator />
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-xs font-medium text-blue-900 mb-1">Meter Reading Information</p>
                {billing.meter_reading ? (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-blue-700">Previous: </span>
                      <span className="font-semibold">{billing.meter_reading.previous_reading}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Present: </span>
                      <span className="font-semibold">{billing.meter_reading.present_reading}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Consumption: </span>
                      <span className="font-semibold">{billing.meter_reading.consumption_cubic_meters} cubic meters</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Reading Date: </span>
                      <span className="font-semibold">{formatDate(billing.meter_reading.reading_date)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No meter reading information available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Amount Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Amount Breakdown</span>
              </CardTitle>
              <CardDescription>
                Detailed billing amounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount (≤10 cu.m):</span>
                  <span className="font-semibold">{formatCurrency(billing.amount_10_or_below)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount (≤10 cu.m) with Discount:</span>
                  <span className="font-semibold">{formatCurrency(billing.amount_10_or_below_with_discount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount (over 10 cu.m):</span>
                  <span className="font-semibold">{formatCurrency(billing.amount_over_10)}</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between text-sm font-semibold">
                <span>Current Billing:</span>
                <span>{formatCurrency(billing.amount_current_billing)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Arrears to be Paid:</span>
                <span className="font-semibold">{formatCurrency(billing.arrears_to_be_paid)}</span>
              </div>
              <Separator />
              {billing.arrears_after_due_date && billing.arrears_after_due_date > 0 && (
                <>
                  <div className="flex justify-between text-sm text-red-600">
                    <span className="font-semibold">Arrears After Due Date:</span>
                    <span className="font-semibold">{formatCurrency(billing.arrears_after_due_date)}</span>
                  </div>
                  <Separator />
                </>
              )}
              <div className="bg-green-50 p-3 rounded-md flex justify-between items-center">
                <span className="font-bold text-green-900">Total Amount Due:</span>
                <span className="font-bold text-lg text-green-900">{formatCurrency(billing.total_amount_due)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-semibold">{formatCurrency(billing.amount_paid)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Billing Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Billing Dates</span>
              </CardTitle>
              <CardDescription>
                Important dates for this billing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Created At</p>
                  <p className="text-sm font-semibold">{formatDateTime(billing.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Updated At</p>
                  <p className="text-sm font-semibold">{formatDateTime(billing.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
