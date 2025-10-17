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
  AlertTriangle, 
  Search, 
  Filter, 
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  User,
  Calendar,
  Phone
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function IssuesManagementPage() {
  // Mock data for demonstration
  const issues = [
    {
      id: "ISS001",
      userId: "Mike Wilson",
      title: "Water pressure low in apartment",
      description: "Water pressure has been very low for the past 3 days",
      priority: "high",
      status: "open",
      category: "Water Supply",
      reportedAt: "2024-01-20T14:30:00Z",
      assignedTo: "John Tech",
      lastUpdate: "2024-01-20T16:45:00Z",
    },
    {
      id: "ISS002",
      userId: "Sarah Davis",
      title: "Billing discrepancy",
      description: "My bill shows unusually high usage this month",
      priority: "medium",
      status: "in-progress",
      category: "Billing",
      reportedAt: "2024-01-19T10:15:00Z",
      assignedTo: "Jane Admin",
      lastUpdate: "2024-01-20T09:30:00Z",
    },
    {
      id: "ISS003",
      userId: "Tom Brown",
      title: "App login issues",
      description: "Cannot log into the mobile app",
      priority: "low",
      status: "resolved",
      category: "Technical",
      reportedAt: "2024-01-18T16:20:00Z",
      assignedTo: "Bob Developer",
      lastUpdate: "2024-01-19T11:00:00Z",
    },
    {
      id: "ISS004",
      userId: "Lisa Johnson",
      title: "Meter reading not accepted",
      description: "Submitted meter reading but it shows as rejected",
      priority: "medium",
      status: "open",
      category: "Meter Reading",
      reportedAt: "2024-01-20T08:45:00Z",
      assignedTo: "Unassigned",
      lastUpdate: "2024-01-20T08:45:00Z",
    },
  ]

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />High</Badge>
      case "medium":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Medium</Badge>
      case "low":
        return <Badge variant="outline"><CheckCircle className="h-3 w-3 mr-1" />Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Resolved</Badge>
      case "in-progress":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>
      case "open":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Open</Badge>
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
            <h1 className="text-3xl font-bold tracking-tight">Issues & Support</h1>
            <p className="text-muted-foreground">
              Manage customer issues and support tickets
            </p>
          </div>
          <Button>
            <MessageSquare className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </div>

        {/* Issues Table */}
        <Card>
          <CardHeader>
            <CardTitle>Support Tickets</CardTitle>
            <CardDescription>
              Manage customer issues and support requests
            </CardDescription>
            <div className="flex items-center space-x-2 pt-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search issues..." className="pl-8" />
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
                  <TableHead>Issue ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {issues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell className="font-medium">{issue.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{issue.userId}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{issue.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{issue.category}</Badge>
                    </TableCell>
                    <TableCell>{getPriorityBadge(issue.priority)}</TableCell>
                    <TableCell>{getStatusBadge(issue.status)}</TableCell>
                    <TableCell>{issue.assignedTo}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{new Date(issue.reportedAt).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
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
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Assign to Technician</DropdownMenuItem>
                          <DropdownMenuItem>Update Status</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Add Comment
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Phone className="h-4 w-4 mr-2" />
                            Contact Customer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Close Ticket</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Issue Categories and Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Issue Categories</CardTitle>
              <CardDescription>
                Distribution of issues by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Water Supply</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                    <span className="text-sm font-medium">40%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Billing</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Technical</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                    <span className="text-sm font-medium">20%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Meter Reading</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                    <span className="text-sm font-medium">15%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common support management tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Create New Ticket
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <User className="h-4 w-4 mr-2" />
                Assign Tickets
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <CheckCircle className="h-4 w-4 mr-2" />
                Bulk Close Tickets
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Escalate Issues
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
