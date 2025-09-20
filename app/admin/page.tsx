import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/navigation/header"
import { Footer } from "@/components/navigation/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Users, MessageCircle, Flag, TrendingUp, Eye, Clock } from "lucide-react"
import { redirect } from "next/navigation"
import { UserManagement } from "@/components/admin/user-management"
import { ContentModeration } from "@/components/admin/content-moderation"
import { Reports } from "@/components/admin/reports"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is a moderator
  const { data: profile } = await supabase.from("profiles").select("is_moderator").eq("id", user.id).single()

  if (!profile?.is_moderator) {
    redirect("/")
  }

  // Get dashboard stats
  const [{ count: totalUsers }, { count: totalThreads }, { count: totalPosts }, { count: pendingReports }] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_banned", false),
      supabase.from("threads").select("*", { count: "exact", head: true }).eq("is_deleted", false),
      supabase.from("posts").select("*", { count: "exact", head: true }).eq("is_deleted", false),
      supabase.from("notifications").select("*", { count: "exact", head: true }).eq("type", "report"),
    ])

  // Get recent activity
  const { data: recentThreads } = await supabase
    .from("threads")
    .select(`
      *,
      author:profiles(display_name, username),
      category:categories(name, color)
    `)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: recentPosts } = await supabase
    .from("posts")
    .select(`
      *,
      author:profiles(display_name, username),
      thread:threads(title)
    `)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-balance">Moderation Dashboard</h1>
          </div>
          <p className="text-muted-foreground text-pretty">
            Manage and moderate the community to keep it safe and welcoming
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalUsers || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/50 rounded-full">
                  <MessageCircle className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalThreads || 0}</p>
                  <p className="text-sm text-muted-foreground">Active Threads</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/50 rounded-full">
                  <TrendingUp className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalPosts || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Posts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-destructive/10 rounded-full">
                  <Flag className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingReports || 0}</p>
                  <p className="text-sm text-muted-foreground">Pending Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Threads
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentThreads?.map((thread) => (
                    <div key={thread.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-1">{thread.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            style={{
                              backgroundColor: `${thread.category.color}20`,
                              color: thread.category.color,
                            }}
                            className="text-xs"
                          >
                            {thread.category.name}
                          </Badge>
                          <span className="text-xs text-muted-foreground">by {thread.author.display_name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        {thread.view_count}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Recent Posts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentPosts?.map((post) => (
                    <div key={post.id} className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm line-clamp-2 mb-2">{post.content}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>by {post.author.display_name}</span>
                        <span>in {post.thread.title}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="content">
            <ContentModeration />
          </TabsContent>

          <TabsContent value="reports">
            <Reports />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Community Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Registration</p>
                      <p className="text-sm text-muted-foreground">Allow new user registrations</p>
                    </div>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Verification</p>
                      <p className="text-sm text-muted-foreground">Require email verification for new accounts</p>
                    </div>
                    <Badge variant="secondary">Required</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto-Moderation</p>
                      <p className="text-sm text-muted-foreground">Automatically flag potentially harmful content</p>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  )
}
