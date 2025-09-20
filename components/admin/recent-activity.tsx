"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, MessageCircle, Users, TrendingUp } from "lucide-react"

export function RecentActivity() {
  // Mock data for demonstration
  const activities = [
    {
      id: "1",
      type: "new_user",
      user: { name: "Sarah Johnson", avatar: "/placeholder.svg" },
      action: "joined the community",
      time: "2 minutes ago",
    },
    {
      id: "2",
      type: "new_thread",
      user: { name: "Emma Davis", avatar: "/placeholder.svg" },
      action: "created a new thread in General Discussion",
      time: "15 minutes ago",
    },
    {
      id: "3",
      type: "report",
      user: { name: "Lisa Chen", avatar: "/placeholder.svg" },
      action: "reported a post for inappropriate content",
      time: "1 hour ago",
    },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "new_user":
        return <Users className="h-4 w-4 text-primary" />
      case "new_thread":
        return <MessageCircle className="h-4 w-4 text-secondary-foreground" />
      case "report":
        return <TrendingUp className="h-4 w-4 text-destructive" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="p-2 bg-muted rounded-full">{getActivityIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={activity.user.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">{activity.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">{activity.user.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">{activity.action}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
