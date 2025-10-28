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
    if (consumer.latest_billing?.payment_status === 'paid') return false
    const dueDate = new Date(consumer.latest_billing?.due_date || '')
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
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Water Meter Number</label>
                <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {consumer.water_meter_no}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
