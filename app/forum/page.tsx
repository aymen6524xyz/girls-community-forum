import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/navigation/header"
import { Footer } from "@/components/navigation/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Users, TrendingUp, BookOpen, Star, Activity, Palette, Heart, Plus } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function ForumPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get categories with thread counts
  const { data: categories } = await supabase
    .from("categories")
    .select(`
      *,
      threads:threads(count)
    `)
    .eq("is_active", true)
    .order("sort_order")

  // Get recent threads across all categories
  const { data: recentThreads } = await supabase
    .from("threads")
    .select(`
      *,
      category:categories(name, color, slug),
      author:profiles(username, display_name, avatar_url),
      last_reply_author:profiles!threads_last_reply_by_fkey(username, display_name, avatar_url)
    `)
    .eq("is_deleted", false)
    .order("last_reply_at", { ascending: false })
    .limit(10)

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      MessageCircle,
      Heart,
      Star,
      BookOpen,
      Activity,
      Palette,
    }
    return icons[iconName] || MessageCircle
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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-balance mb-2">Community Forum</h1>
            <p className="text-muted-foreground text-pretty">
              Connect, share, and support each other in our safe space
            </p>
          </div>
          <Button asChild>
            <Link href="/forum/new-thread">
              <Plus className="h-4 w-4 mr-2" />
              New Thread
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Categories */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Categories</h2>
              <div className="space-y-3">
                {categories?.map((category) => {
                  const IconComponent = getIconComponent(category.icon)
                  const threadCount = Array.isArray(category.threads)
                    ? category.threads.length
                    : category.threads?.count || 0

                  return (
                    <Card key={category.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <Link href={`/forum/category/${category.slug}`} className="block">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg shrink-0" style={{ backgroundColor: `${category.color}20` }}>
                              <IconComponent className="h-6 w-6" style={{ color: category.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                              <p className="text-sm text-muted-foreground text-pretty mb-2">{category.description}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="h-3 w-3" />
                                  {threadCount} threads
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {category.post_count || 0} posts
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Recent Activity Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentThreads?.slice(0, 5).map((thread) => (
                  <div key={thread.id} className="space-y-2">
                    <Link href={`/forum/thread/${thread.id}`} className="block hover:text-primary transition-colors">
                      <h4 className="font-medium text-sm line-clamp-2 text-pretty">{thread.title}</h4>
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={thread.author?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">{thread.author?.display_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{thread.author?.display_name}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(thread.created_at)}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Community Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Threads</span>
                  <span className="font-semibold">{recentThreads?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Categories</span>
                  <span className="font-semibold">{categories?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Today</span>
                  <span className="font-semibold">24</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
