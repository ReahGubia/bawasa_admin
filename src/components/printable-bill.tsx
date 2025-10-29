"use client"

import { BillingWithDetails } from "@/lib/billing-service"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react"

interface PrintableBillProps {
  billing: BillingWithDetails
}

export function PrintableBill({ billing }: PrintableBillProps) {
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
        return 'Paid'
      case 'unpaid':
        return 'Unpaid'
      case 'partial':
        return 'Partial'
      case 'overdue':
        return 'Overdue'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-800'
      case 'unpaid':
        return 'text-yellow-800'
      case 'partial':
        return 'text-blue-800'
      case 'overdue':
        return 'text-red-800'
      default:
        return 'text-gray-800'
    }
  }

  return (
    <div className="print-container p-4 max-w-4xl mx-auto bg-white">
      {/* Print-only styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .print-container {
            margin: 0;
            padding: 10px !important;
          }
          .no-print {
            display: none !important;
          }
          * {
            margin: 0;
            padding: 0;
          }
          .section {
            margin-bottom: 8px !important;
          }
          .section-title {
            margin-bottom: 4px !important;
            font-size: 14px !important;
          }
          table {
            font-size: 11px !important;
          }
          td, th {
            padding: 4px 8px !important;
          }
        }
      `}} />

      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-2 mb-3 section">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">BAWASA</h1>
            <p className="text-xs text-gray-600">Banadero City Water District</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600">Water Bill</p>
            <p className="text-xs text-gray-500">Issue Date: {formatDate(billing.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Customer Information & Billing Period Combined */}
      <div className="mb-2 section">
        <div className="grid grid-cols-2 gap-3">
          {/* Left: Customer Info */}
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-xs font-bold text-gray-900 section-title">Bill To</p>
            <div className="space-y-1">
              <div>
                <p className="text-xs text-gray-600">Name:</p>
                <p className="text-xs font-semibold">{billing.consumer?.accounts?.full_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Water Meter:</p>
                <p className="text-xs font-semibold font-mono">{billing.consumer?.water_meter_no || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Address:</p>
                <p className="text-xs font-semibold">{billing.consumer?.accounts?.full_address || 'N/A'}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-600">Email:</p>
                  <p className="text-xs font-semibold">{billing.consumer?.accounts?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Mobile:</p>
                  <p className="text-xs font-semibold">{billing.consumer?.accounts?.mobile_no || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Billing Info */}
          <div className="bg-blue-50 p-2 rounded">
            <p className="text-xs font-bold text-gray-900 section-title">Billing Period</p>
            <div className="grid grid-cols-2 gap-1">
              <div>
                <p className="text-xs text-gray-600">Month:</p>
                <p className="text-xs font-semibold">{billing.billing_month}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Due Date:</p>
                <p className="text-xs font-semibold">{formatDate(billing.due_date)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Status:</p>
                <p className={`text-xs font-semibold ${getStatusColor(billing.payment_status)}`}>
                  {getStatusBadge(billing.payment_status)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Payment:</p>
                <p className="text-xs font-semibold">{formatDateTime(billing.payment_date)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meter Reading - Compact */}
      {billing.meter_reading && (
        <div className="mb-2 section">
          <p className="text-xs font-bold text-gray-900 section-title">Meter Reading</p>
          <div className="bg-blue-50 p-2 rounded">
            <div className="grid grid-cols-4 gap-2">
              <div>
                <p className="text-xs text-gray-600">Previous:</p>
                <p className="text-xs font-semibold">{billing.meter_reading.previous_reading}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Present:</p>
                <p className="text-xs font-semibold">{billing.meter_reading.present_reading}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Usage (cu.m):</p>
                <p className="text-xs font-semibold">{billing.meter_reading.consumption_cubic_meters}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Date:</p>
                <p className="text-xs font-semibold">{formatDate(billing.meter_reading.reading_date)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Amount Breakdown - Compact */}
      <div className="mb-2 section">
        <p className="text-xs font-bold text-gray-900 section-title">Amount Breakdown</p>
        <div className="border border-gray-300 rounded overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2 font-semibold">Description</th>
                <th className="text-right p-2 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="p-1">Water (≤10 cu.m)</td>
                <td className="p-1 text-right font-mono">{formatCurrency(billing.amount_10_or_below)}</td>
              </tr>
              <tr>
                <td className="p-1">Discount Applied</td>
                <td className="p-1 text-right font-mono">{formatCurrency(billing.amount_10_or_below_with_discount)}</td>
              </tr>
              <tr>
                <td className="p-1">Water (over 10 cu.m)</td>
                <td className="p-1 text-right font-mono">{formatCurrency(billing.amount_over_10)}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-1 font-semibold">Current Billing</td>
                <td className="p-1 text-right font-mono font-semibold">{formatCurrency(billing.amount_current_billing)}</td>
              </tr>
              <tr>
                <td className="p-1">Arrears to be Paid</td>
                <td className="p-1 text-right font-mono">{formatCurrency(billing.arrears_to_be_paid)}</td>
              </tr>
              {billing.arrears_after_due_date && billing.arrears_after_due_date > 0 && (
                <tr className="bg-red-50">
                  <td className="p-1 font-semibold text-red-800">Arrears After Due Date</td>
                  <td className="p-1 text-right font-mono font-semibold text-red-800">{formatCurrency(billing.arrears_after_due_date)}</td>
                </tr>
              )}
              <tr className="bg-green-100 border-t-2 border-green-600">
                <td className="p-2 font-bold">Total Amount Due</td>
                <td className="p-2 text-right font-mono font-bold">{formatCurrency(billing.total_amount_due)}</td>
              </tr>
              <tr>
                <td className="p-1">Amount Paid</td>
                <td className="p-1 text-right font-mono">{formatCurrency(billing.amount_paid)}</td>
              </tr>
              <tr className="bg-blue-50">
                <td className="p-1 font-semibold text-blue-900">Balance</td>
                <td className="p-1 text-right font-mono font-semibold text-blue-900">
                  {formatCurrency(billing.total_amount_due - billing.amount_paid)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer - Compact */}
      <div className="mt-3 border-t border-gray-400 pt-2 section">
        <p className="text-xs text-gray-600 text-center">
          Thank you for your payment. Please keep this bill for your records. Billing ID: {billing.id.substring(0, 8)}
        </p>
        <p className="text-xs text-gray-500 text-center mt-1">
          For inquiries, please contact BAWASA Office.
        </p>
      </div>
    </div>
  )
}
