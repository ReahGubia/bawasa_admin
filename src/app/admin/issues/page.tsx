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
  Phone,
  Loader2
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"
import { IssueService, IssueReportWithUser } from "@/lib/issue-service"
import { IssueDetailsModal } from "@/components/issue-details-modal"

export default function IssuesManagementPage() {
  const [issues, setIssues] = useState<IssueReportWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null)

  useEffect(() => {
    loadIssues()
  }, [])

  const loadIssues = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await IssueService.getAllIssues()
      
      if (result.error) {
        throw new Error(`Failed to fetch issues: ${result.error.message}`)
      }
      
      setIssues(result.data || [])
    } catch (err) {
      console.error('Error loading issues:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.trim() === "") {
      await loadIssues()
      return
    }

    try {
      setLoading(true)
      const result = await IssueService.searchIssues(query)
      
      if (result.error) {
        throw new Error(`Failed to search issues: ${result.error.message}`)
      }
      
      setIssues(result.data || [])
    } catch (err) {
      console.error('Error searching issues:', err)
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  const handlePriorityFilter = async (priority: string) => {
    setPriorityFilter(priority)
    if (priority === "all") {
      await loadIssues()
      return
    }

    try {
      setLoading(true)
      const result = await IssueService.getIssuesByPriority(priority)
      
      if (result.error) {
        throw new Error(`Failed to filter issues: ${result.error.message}`)
      }
      
      setIssues(result.data || [])
    } catch (err) {
      console.error('Error filtering issues:', err)
      setError(err instanceof Error ? err.message : 'Filter failed')
    } finally {
      setLoading(false)
    }
  }

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
    // Since issue_report doesn't have status, we'll use a default "open" status
    return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Open</Badge>
  }

  const handleViewDetails = (issueId: number) => {
    setSelectedIssueId(issueId)
    setIsDetailsModalOpen(true)
  }

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false)
    setSelectedIssueId(null)
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
                <Input 
                  placeholder="Search issues..." 
                  className="pl-8" 
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter by Priority
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handlePriorityFilter('all')}>
                    All Priorities
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handlePriorityFilter('high')}>
                    High Priority
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handlePriorityFilter('medium')}>
                    Medium Priority
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handlePriorityFilter('low')}>
                    Low Priority
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-muted-foreground">Loading issues...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">{error}</p>
                <Button onClick={loadIssues} className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : issues.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No issues found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Issue ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reported</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell className="font-medium">#{issue.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{issue.user_name || 'Unknown User'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{issue.issue_title || 'No title'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{issue.issue_type || 'Unknown'}</Badge>
                      </TableCell>
                      <TableCell>{getPriorityBadge(issue.priority || 'low')}</TableCell>
                      <TableCell>{getStatusBadge('open')}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{new Date(issue.created_at).toLocaleDateString()}</span>
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
                            <DropdownMenuItem onClick={() => handleViewDetails(issue.id)}>
                              View Details
                            </DropdownMenuItem>
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
            )}
          </CardContent>
        </Card>

        

        {/* Issue Details Modal */}
        <IssueDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          issueId={selectedIssueId}
        />
      </div>
    </AdminLayout>
  )
}
