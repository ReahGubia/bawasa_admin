"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  Droplets, 
  DollarSign, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Home,
  Mail,
  Phone,
  FileText,
  TrendingUp
} from "lucide-react"
import { ConsumerWithStatus } from "@/lib/consumer-service"

interface ViewConsumerDetailsDialogProps {
  consumer: ConsumerWithStatus | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewConsumerDetailsDialog({ 
  consumer, 
  open, 
  onOpenChange 
}: ViewConsumerDetailsDialogProps) {
  if (!consumer) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>
      case "unpaid":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Unpaid</Badge>
      case "partial":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800"><AlertCircle className="h-3 w-3 mr-1" />Partial</Badge>
      case "overdue":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Overdue</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const isOverdue = () => {
    if (consumer.payment_status === 'paid') return false
    const dueDate = new Date(consumer.due_date)
    const today = new Date()
    return today > dueDate
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Home className="h-5 w-5" />
            <span>Consumer Details</span>
          </DialogTitle>
          <DialogDescription>
            Complete information for {consumer.account?.full_name || 'Consumer'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Consumer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Home className="h-5 w-5" />
                <span>Consumer Information</span>
              </CardTitle>
              <CardDescription>
                Personal and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <div className="flex items-center space-x-2">
                    <Home className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{consumer.account?.full_name || 'Not provided'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Email Address</label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{consumer.account?.email || 'Not provided'}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Address</label>
                <div className="flex items-start space-x-2">
                  <Home className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-sm">{consumer.account?.full_address || 'Not provided'}</span>
                </div>
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
                Meter details and readings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Water Meter Number</label>
                  <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {consumer.water_meter_no}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Billing Month</label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{consumer.billing_month}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Previous Reading</label>
                  <div className="text-sm font-medium">{consumer.previous_reading} cu.m</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Present Reading</label>
                  <div className="text-sm font-medium">{consumer.present_reading} cu.m</div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Consumption</label>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="text-lg font-semibold text-blue-600">
                    {consumer.consumption_cubic_meters.toFixed(2)} cubic meters
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Meter Reading Date</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{formatDate(consumer.meter_reading_date)}</span>
                </div>
              </div>
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
                Payment details and amounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Payment Status</label>
                  <div>{getStatusBadge(consumer.payment_status)}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Due Date</label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className={`text-sm ${isOverdue() ? 'text-red-600 font-semibold' : ''}`}>
                      {formatDate(consumer.due_date)}
                    </span>
                    {isOverdue() && (
                      <Badge variant="destructive" className="text-xs">Overdue</Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Billing Breakdown</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Consumption (10 cu.m or below):</span>
                      <span>{consumer.consumption_10_or_below.toFixed(2)} cu.m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount (10 cu.m or below):</span>
                      <span>₱{consumer.amount_10_or_below.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount with discount (25%):</span>
                      <span>₱{consumer.amount_10_or_below_with_discount.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Consumption (over 10 cu.m):</span>
                      <span>{consumer.consumption_over_10.toFixed(2)} cu.m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount (over 10 cu.m):</span>
                      <span>₱{consumer.amount_over_10.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Arrears to be paid:</span>
                      <span>₱{consumer.arrears_to_be_paid.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Current Billing:</span>
                    <span>₱{consumer.amount_current_billing.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold text-green-600">
                    <span>Total Amount Due:</span>
                    <span>₱{consumer.total_amount_due.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Payment Information</span>
              </CardTitle>
              <CardDescription>
                Payment history and details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Amount Paid</label>
                  <div className="text-lg font-semibold text-green-600">
                    ₱{consumer.amount_paid.toFixed(2)}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Payment Date</label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{formatDateTime(consumer.payment_date)}</span>
                  </div>
                </div>
              </div>
              {consumer.arrears_after_due_date && consumer.arrears_after_due_date > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Arrears After Due Date</label>
                  <div className="text-sm text-red-600 font-semibold">
                    ₱{consumer.arrears_after_due_date.toFixed(2)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>System Information</span>
              </CardTitle>
              <CardDescription>
                Record creation and update details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Record Created</label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{formatDateTime(consumer.created_at)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{formatDateTime(consumer.updated_at)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
