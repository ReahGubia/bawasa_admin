"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts"
import { RevenueStats } from "@/lib/dashboard-service"
import { TrendingUp, DollarSign, FileText, AlertTriangle } from "lucide-react"

interface RevenueChartProps {
  revenueStats: RevenueStats | null
  loading: boolean
}

export function RevenueChart({ revenueStats, loading }: RevenueChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Revenue Report
          </CardTitle>
          <CardDescription>
            Monthly revenue trends and payment statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading revenue data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!revenueStats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Revenue Report
          </CardTitle>
          <CardDescription>
            Monthly revenue trends and payment statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No revenue data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatTooltipCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Revenue Report
        </CardTitle>
        <CardDescription>
          Monthly revenue trends and payment statistics
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Revenue Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <span className="h-6 w-6 flex items-center justify-center text-green-600 mx-auto mb-2 text-2xl font-bold">₱</span>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(revenueStats.totalRevenue)}
            </div>
            <p className="text-sm text-green-600">Total Revenue</p>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-700">
              {revenueStats.paidBills}
            </div>
            <p className="text-sm text-blue-600">Paid Bills</p>
          </div>
          
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <FileText className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-700">
              {revenueStats.pendingBills}
            </div>
            <p className="text-sm text-yellow-600">Pending Bills</p>
          </div>
          
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-700">
              {revenueStats.overdueBills}
            </div>
            <p className="text-sm text-red-600">Overdue Bills</p>
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Monthly Revenue Trend</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueStats.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatCurrency}
                />
                <Tooltip 
                  formatter={(value: number) => [formatTooltipCurrency(value), 'Revenue']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bills Count Chart */}
        <div className="space-y-4 mt-6">
          <h4 className="text-lg font-semibold">Monthly Bills Issued</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueStats.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: number) => [value, 'Bills Count']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Bar 
                  dataKey="billsCount" 
                  fill="#3b82f6"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
