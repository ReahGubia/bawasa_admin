"use client"

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
  Users, 
  Search, 
  Filter, 
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Loader2,
  RefreshCw
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserService, UserWithStatus } from "@/lib/user-service"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredUsers, setFilteredUsers] = useState<UserWithStatus[]>([])

  // Fetch users from Supabase
  const fetchUsers = async () => {
    try {
      console.log('🚀 Starting to fetch users...')
      setLoading(true)
      setError(null)
      
      const { data, error } = await UserService.getAllUsers()
      
      console.log('📋 Fetch result:', { data, error })
      
      if (error) {
        console.error('💥 Error in fetchUsers:', error)
        setError(error.message || 'Failed to fetch users')
        return
      }
      
      if (data) {
        console.log('📝 Formatting users...')
        const formattedUsers = data.map(user => UserService.formatUserForDisplay(user))
        console.log('✨ Formatted users:', formattedUsers)
        setUsers(formattedUsers)
        setFilteredUsers(formattedUsers)
      } else {
        console.log('📭 No data returned from Supabase')
        setUsers([])
        setFilteredUsers([])
      }
    } catch (err) {
      console.error('💥 Unexpected error in fetchUsers:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Handle user status update
  const handleStatusUpdate = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await UserService.updateUserStatus(userId, isActive)
      if (error) {
        setError(error.message || 'Failed to update user status')
        return
      }
      // Refresh the users list
      await fetchUsers()
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Error updating user status:', err)
    }
  }

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredUsers(users)
      return
    }
    
    const filtered = users.filter(user => 
      user.full_name?.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase()) ||
      user.phone?.toLowerCase().includes(query.toLowerCase())
    )
    setFilteredUsers(filtered)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Format last login date
  const formatLastLogin = (dateString: string | null) => {
    if (!dateString) return 'Never'
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
      case "verified":
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case "suspended":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Suspended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Test Supabase connection
  const testSupabaseConnection = async () => {
    try {
      console.log('🔧 Testing Supabase connection...')
      
      // Test basic connection
      const { data: { user } } = await supabase.auth.getUser()
      console.log('👤 Current user:', user)
      
      // Test table access
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      console.log('📊 Table access test:', { data, error })
      
      if (error) {
        console.error('❌ Table access error:', error)
        setError(`Database error: ${error.message}`)
      } else {
        console.log('✅ Supabase connection successful')
      }
    } catch (err) {
      console.error('💥 Connection test failed:', err)
      setError(`Connection test failed: ${err}`)
    }
  }

  // Load users on component mount
  useEffect(() => {
    console.log('🎯 Component mounted, starting user fetch...')
    testSupabaseConnection()
    fetchUsers()
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">
              Manage consumer accounts and user verification
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={fetchUsers} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button>
              <UserCheck className="h-4 w-4 mr-2" />
              Add New User
            </Button>
          </div>
        </div>

        {/* Debug Panel */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Using fallback'}</div>
              <div><strong>Users Count:</strong> {users.length}</div>
              <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
              <div><strong>Error:</strong> {error || 'None'}</div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-800">
                <XCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>User Accounts</CardTitle>
            <CardDescription>
              Manage all consumer accounts registered through the mobile app
            </CardDescription>
            <div className="flex items-center space-x-2 pt-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search users..." 
                  className="pl-8" 
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading users...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No users found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search criteria' : 'No users have been registered yet'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Account Type</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.full_name || 'No name provided'}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{user.email}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.phone || 'No phone provided'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.account_type}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell>{formatLastLogin(user.last_login_at)}</TableCell>
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
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>Edit User</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.is_active ? (
                              <DropdownMenuItem 
                                onClick={() => handleStatusUpdate(user.id, false)}
                                className="text-orange-600"
                              >
                                Suspend Account
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={() => handleStatusUpdate(user.id, true)}
                                className="text-green-600"
                              >
                                Activate Account
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              Delete Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
