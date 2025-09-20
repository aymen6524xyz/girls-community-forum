"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Check, X } from "lucide-react"
import { useEffect, useState } from "react"

interface Report {
  id: string
  type: string
  title: string
  message: string
  link?: string
  is_read: boolean
  created_at: string
  user_id: string
}

export function Reports() {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchReports = async () => {
      // For demo purposes, we'll create some mock reports since we don't have a reports table
      const mockReports: Report[] = [
        {
          id: "1",
          type: "report",
          title: "Inappropriate Content",
          message: "This post contains inappropriate language and should be reviewed.",
          link: "/forum/thread/123",
          is_read: false,
          created_at: new Date().toISOString(),
          user_id: "user1",
        },
        {
          id: "2",
          type: "report",
          title: "Spam Report",
          message: "User is posting spam links repeatedly.",
          link: "/forum/thread/456",
          is_read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          user_id: "user2",
        },
        {
          id: "3",
          type: "report",
          title: "Harassment",
          message: "User is harassing other members in private messages.",
          is_read: true,
          created_at: new Date(Date.now() - 7200000).toISOString(),
          user_id: "user3",
        },
      ]

      setReports(mockReports)
      setIsLoading(false)
    }

    fetchReports()
  }, [supabase])

  const handleReportAction = async (reportId: string, action: "resolve" | "dismiss") => {
    try {
      // In a real implementation, you would update the report status in the database
      setReports(reports.map((report) => (report.id === reportId ? { ...report, is_read: true } : report)))
    } catch (error) {
      console.error("Error updating report:", error)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading reports...</div>
  }

  const pendingReports = reports.filter((report) => !report.is_read)
  const resolvedReports = reports.filter((report) => report.is_read)

  return (
    <div className="space-y-6">
      {/* Pending Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Pending Reports ({pendingReports.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending reports. Great job keeping the community safe!
            </div>
          ) : (
            <div className="space-y-4">
              {pendingReports.map((report) => (
                <div key={report.id} className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="destructive" className="text-xs">
                          {report.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{formatTimeAgo(report.created_at)}</span>
                      </div>

                      <h3 className="font-semibold mb-2">{report.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{report.message}</p>

                      {report.link && (
                        <a
                          href={report.link}
                          className="text-sm text-primary hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View reported content →
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleReportAction(report.id, "resolve")}>
                        <Check className="h-4 w-4 mr-2" />
                        Resolve
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleReportAction(report.id, "dismiss")}>
                        <X className="h-4 w-4 mr-2" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolved Reports */}
      {resolvedReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recently Resolved ({resolvedReports.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {resolvedReports.map((report) => (
                <div key={report.id} className="p-4 border rounded-lg opacity-60">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          Resolved
                        </Badge>
                        <span className="text-sm text-muted-foreground">{formatTimeAgo(report.created_at)}</span>
                      </div>

                      <h3 className="font-semibold mb-2">{report.title}</h3>
                      <p className="text-sm text-muted-foreground">{report.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
