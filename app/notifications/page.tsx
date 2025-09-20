"use client"

import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/navigation/header"
import { Footer } from "@/components/navigation/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, MessageCircle, Heart, Users, Check, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Notification {
  id: string
  type: "reply" | "like" | "mention" | "follow" | "system"
  title: string
  message: string
  link?: string
  is_read: boolean
  created_at: string
  user_id: string
  from_user?: {
    display_name: string
    username: string
    avatar_url?: string
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchNotifications = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      // For demo purposes, we'll create mock notifications
      const mockNotifications: Notification[] = [
        {
          id: "1",
          type: "reply",
          title: "New reply to your thread",
          message: "Sarah replied to your thread 'Study Tips for Finals'",
          link: "/forum/thread/123",
          is_read: false,
          created_at: new Date().toISOString(),
          user_id: user.id,
          from_user: {
            display_name: "Sarah Johnson",
            username: "sarah_j",
            avatar_url: "/placeholder.svg",
          },
        },
        {
          id: "2",
          type: "like",
          title: "Someone liked your post",
          message: "Emma liked your post in 'General Discussion'",
          link: "/forum/thread/456",
          is_read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          user_id: user.id,
          from_user: {
            display_name: "Emma Davis",
            username: "emma_d",
            avatar_url: "/placeholder.svg",
          },
        },
        {
          id: "3",
          type: "mention",
          title: "You were mentioned",
          message: "Lisa mentioned you in a thread about 'Career Advice'",
          link: "/forum/thread/789",
          is_read: true,
          created_at: new Date(Date.now() - 7200000).toISOString(),
          user_id: user.id,
          from_user: {
            display_name: "Lisa Chen",
            username: "lisa_c",
            avatar_url: "/placeholder.svg",
          },
        },
        {
          id: "4",
          type: "system",
          title: "Welcome to the community!",
          message: "Thanks for joining our community. Check out our community guidelines to get started.",
          link: "/guidelines",
          is_read: true,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          user_id: user.id,
        },
      ]

      setNotifications(mockNotifications)
      setIsLoading(false)
    }

    fetchNotifications()
  }, [supabase, router])

  const markAsRead = async (notificationId: string) => {
    setNotifications(notifications.map((notif) => (notif.id === notificationId ? { ...notif, is_read: true } : notif)))
  }

  const markAllAsRead = async () => {
    setNotifications(notifications.map((notif) => ({ ...notif, is_read: true })))
  }

  const deleteNotification = async (notificationId: string) => {
    setNotifications(notifications.filter((notif) => notif.id !== notificationId))
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "reply":
        return <MessageCircle className="h-4 w-4 text-primary" />
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />
      case "mention":
        return <Users className="h-4 w-4 text-blue-500" />
      case "follow":
        return <Users className="h-4 w-4 text-green-500" />
      case "system":
        return <Bell className="h-4 w-4 text-muted-foreground" />
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />
    }
  }

  const unreadNotifications = notifications.filter((notif) => !notif.is_read)
  const readNotifications = notifications.filter((notif) => notif.is_read)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading notifications...</div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-balance mb-2">Notifications</h1>
            <p className="text-muted-foreground text-pretty">Stay updated with community activity</p>
          </div>
          {unreadNotifications.length > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <Check className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        <Tabs defaultValue="unread" className="space-y-6">
          <TabsList>
            <TabsTrigger value="unread">
              Unread ({unreadNotifications.length})
              {unreadNotifications.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {unreadNotifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="unread">
            {unreadNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                  <p className="text-muted-foreground">You have no unread notifications.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {unreadNotifications.map((notification) => (
                  <Card key={notification.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {notification.from_user ? (
                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarImage src={notification.from_user.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback>{notification.from_user.display_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="p-2 bg-muted rounded-full shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm mb-1">{notification.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{formatTimeAgo(notification.created_at)}</span>
                                {notification.link && (
                                  <Link
                                    href={notification.link}
                                    className="text-primary hover:underline"
                                    onClick={() => markAsRead(notification.id)}
                                  >
                                    View →
                                  </Link>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="ghost" onClick={() => markAsRead(notification.id)}>
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => deleteNotification(notification.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all">
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`${!notification.is_read ? "border-l-4 border-l-primary" : "opacity-60"}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {notification.from_user ? (
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={notification.from_user.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>{notification.from_user.display_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="p-2 bg-muted rounded-full shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-sm">{notification.title}</h3>
                              {!notification.is_read && <Badge variant="destructive" className="h-2 w-2 p-0" />}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{formatTimeAgo(notification.created_at)}</span>
                              {notification.link && (
                                <Link
                                  href={notification.link}
                                  className="text-primary hover:underline"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  View →
                                </Link>
                              )}
                            </div>
                          </div>

                          <Button size="sm" variant="ghost" onClick={() => deleteNotification(notification.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  )
}
