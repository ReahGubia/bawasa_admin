import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  CreditCard, 
  Search, 
  Filter, 
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Download,
  Send
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function BillingManagementPage() {
  // Mock data for demonstration
  const bills = [
    {
      id: "BILL001",
      userId: "John Doe",
      amount: 125.50,
      dueDate: "2024-02-15",
      status: "paid",
      issueDate: "2024-01-15",
      paymentDate: "2024-01-20",
      meterReading: "MR001",
    },
    {
      id: "BILL002",
      userId: "Jane Smith",
      amount: 89.75,
      dueDate: "2024-02-15",
      status: "pending",
      issueDate: "2024-01-15",
      paymentDate: null,
      meterReading: "MR002",
    },
    {
      id: "BILL003",
      userId: "Bob Johnson",
      amount: 156.25,
      dueDate: "2024-02-15",
      status: "overdue",
      issueDate: "2024-01-15",
      paymentDate: null,
      meterReading: "MR003",
    },
    {
      id: "BILL004",
      userId: "Alice Brown",
      amount: 98.30,
      dueDate: "2024-02-15",
      status: "paid",
      issueDate: "2024-01-15",
      paymentDate: "2024-01-18",
      meterReading: "MR004",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case "overdue":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Overdue</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Billing Management</h1>
            <p className="text-muted-foreground">
              Manage bills, payments, and billing reports
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Bills
            </Button>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Send Reminders
            </Button>
          </div>
        </div>

        {/* Bills Table */}
        <Card>
          <CardHeader>
            <CardTitle>Bills Overview</CardTitle>
            <CardDescription>
              Manage all bills generated from meter readings
            </CardDescription>
            <div className="flex items-center space-x-2 pt-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search bills..." className="pl-8" />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-medium">{bill.id}</TableCell>
                    <TableCell>{bill.userId}</TableCell>
                    <TableCell className="font-mono">${bill.amount.toFixed(2)}</TableCell>
                    <TableCell>{bill.issueDate}</TableCell>
                    <TableCell>{bill.dueDate}</TableCell>
                    <TableCell>{getStatusBadge(bill.status)}</TableCell>
                    <TableCell>{bill.paymentDate || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View Bill Details</DropdownMenuItem>
                          <DropdownMenuItem>Download PDF</DropdownMenuItem>
                          <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                          <DropdownMenuItem>Generate Receipt</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            Cancel Bill
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Revenue Analytics */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>
                Monthly revenue collection trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">January 2024</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                    <span className="text-sm font-medium">$45,678</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">December 2023</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <span className="text-sm font-medium">$39,234</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">November 2023</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                    <span className="text-sm font-medium">$36,789</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Distribution of payment methods used
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Mobile Payment</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <span className="text-sm font-medium">65%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Bank Transfer</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cash Payment</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                    <span className="text-sm font-medium">10%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common billing management tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Button className="h-20 flex-col" variant="outline">
                <CreditCard className="h-6 w-6 mb-2" />
                Generate Bills
              </Button>
              <Button className="h-20 flex-col" variant="outline">
                <Send className="h-6 w-6 mb-2" />
                Send Reminders
              </Button>
              <Button className="h-20 flex-col" variant="outline">
                <TrendingUp className="h-6 w-6 mb-2" />
                Revenue Report
              </Button>
              <Button className="h-20 flex-col" variant="outline">
                <Download className="h-6 w-6 mb-2" />
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
