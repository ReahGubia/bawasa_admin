"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  Image as ImageIcon,
  Loader2,
  X
} from "lucide-react"
import { IssueService, IssueReportWithUser } from "@/lib/issue-service"

interface IssueDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  issueId: number | null
}

export function IssueDetailsModal({ isOpen, onClose, issueId }: IssueDetailsModalProps) {
  const [issue, setIssue] = useState<IssueReportWithUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    if (isOpen && issueId) {
      loadIssueDetails()
    }
  }, [isOpen, issueId])

  const loadIssueDetails = async () => {
    if (!issueId) return

    try {
      setLoading(true)
      setError(null)
      const result = await IssueService.getIssueById(issueId)
      
      if (result.error) {
        throw new Error(`Failed to fetch issue details: ${result.error.message}`)
      }
      
      setIssue(result.data)
    } catch (err) {
      console.error('Error loading issue details:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
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
    return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Open</Badge>
  }

  const parseImages = (imagesJson: any): string[] => {
    if (!imagesJson) return []
    
    try {
      // If it's already an array, return it
      if (Array.isArray(imagesJson)) {
        return imagesJson.filter(img => typeof img === 'string')
      }
      
      // If it's a string, try to parse it as JSON
      if (typeof imagesJson === 'string') {
        const parsed = JSON.parse(imagesJson)
        return Array.isArray(parsed) ? parsed.filter(img => typeof img === 'string') : []
      }
      
      // If it's an object, try to extract image URLs
      if (typeof imagesJson === 'object') {
        const values = Object.values(imagesJson)
        return values.filter(img => typeof img === 'string') as string[]
      }
      
      return []
    } catch (error) {
      console.error('Error parsing images:', error)
      return []
    }
  }

  const images = issue ? parseImages(issue.issue_images) : []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Issue Details #{issueId}
          </DialogTitle>
          <DialogDescription>
            Detailed information about the reported issue
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-muted-foreground">Loading issue details...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
            <Button onClick={loadIssueDetails} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : issue ? (
          <div className="space-y-6">
            {/* Issue Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{issue.issue_title || 'No Title'}</span>
                  <div className="flex gap-2">
                    {getPriorityBadge(issue.priority || 'low')}
                    {getStatusBadge('open')}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Customer:</span>
                      <span>{issue.user_name || 'Unknown User'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Email:</span>
                      <span>{issue.user_email || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Phone:</span>
                      <span>{issue.user_phone || 'Not provided'}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Reported:</span>
                      <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Type:</span>
                      <Badge variant="outline">{issue.issue_type || 'Unknown'}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Issue ID:</span>
                      <span className="font-mono">#{issue.id}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {issue.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {issue.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Images */}
            {images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Issue Images ({images.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Main Image Display */}
                    <div className="relative">
                      <img
                        src={images[selectedImageIndex]}
                        alt={`Issue image ${selectedImageIndex + 1}`}
                        className="w-full h-64 object-cover rounded-lg border"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const errorDiv = document.createElement('div')
                          errorDiv.className = 'w-full h-64 bg-gray-100 rounded-lg border flex items-center justify-center text-gray-500'
                          errorDiv.textContent = 'Image failed to load'
                          target.parentNode?.insertBefore(errorDiv, target)
                        }}
                      />
                      {images.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                          {selectedImageIndex + 1} / {images.length}
                        </div>
                      )}
                    </div>

                    {/* Image Thumbnails */}
                    {images.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                              selectedImageIndex === index 
                                ? 'border-blue-500 ring-2 ring-blue-200' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <img
                              src={image}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                const errorDiv = document.createElement('div')
                                errorDiv.className = 'w-full h-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs'
                                errorDiv.textContent = 'Error'
                                target.parentNode?.insertBefore(errorDiv, target)
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button>
                Assign to Technician
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
