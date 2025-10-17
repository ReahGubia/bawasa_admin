import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Droplets, 
  CreditCard, 
  AlertTriangle, 
  TrendingUp, 
  Activity,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign
} from "lucide-react"

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your BAWASA system and monitor mobile app activities
          </p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,543</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meter Readings</CardTitle>
              <Droplets className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8,421</div>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                -3% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">
                -15% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Recent Meter Readings */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Recent Meter Readings</CardTitle>
              <CardDescription>
                Latest meter readings submitted via mobile app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: "MR001", user: "John Doe", value: "1,234", status: "pending", date: "2024-01-15" },
                  { id: "MR002", user: "Jane Smith", value: "2,456", status: "approved", date: "2024-01-15" },
                  { id: "MR003", user: "Bob Johnson", value: "3,789", status: "pending", date: "2024-01-14" },
                  { id: "MR004", user: "Alice Brown", value: "1,567", status: "approved", date: "2024-01-14" },
                ].map((reading) => (
                  <div key={reading.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Droplets className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="font-medium">{reading.user}</p>
                        <p className="text-sm text-muted-foreground">{reading.value} units</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={reading.status === "approved" ? "default" : "secondary"}>
                        {reading.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{reading.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Current system health and performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Mobile App API</span>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Online
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Database</span>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Online
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Payment Gateway</span>
                </div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Maintenance
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Notification Service</span>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Online
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recent Issues */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Recent Issues & Support</CardTitle>
              <CardDescription>
                Latest issues reported through mobile app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: "ISS001", user: "Mike Wilson", issue: "Water pressure low", priority: "high", status: "open" },
                  { id: "ISS002", user: "Sarah Davis", issue: "Billing discrepancy", priority: "medium", status: "in-progress" },
                  { id: "ISS003", user: "Tom Brown", issue: "App login issues", priority: "low", status: "resolved" },
                ].map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className={`h-4 w-4 ${
                        issue.priority === "high" ? "text-red-600" : 
                        issue.priority === "medium" ? "text-yellow-600" : "text-green-600"
                      }`} />
                      <div>
                        <p className="font-medium">{issue.user}</p>
                        <p className="text-sm text-muted-foreground">{issue.issue}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        issue.priority === "high" ? "destructive" : 
                        issue.priority === "medium" ? "secondary" : "outline"
                      }>
                        {issue.priority}
                      </Badge>
                      <Badge variant={issue.status === "resolved" ? "default" : "secondary"}>
                        {issue.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg cursor-pointer">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Approve Meter Readings</span>
              </div>
              <div className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg cursor-pointer">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm">Verify New Users</span>
              </div>
              <div className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg cursor-pointer">
                <DollarSign className="h-4 w-4 text-yellow-600" />
                <span className="text-sm">Generate Bills</span>
              </div>
              <div className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg cursor-pointer">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="text-sm">Schedule Maintenance</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
