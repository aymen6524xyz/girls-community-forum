import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/navigation/header"
import { Footer } from "@/components/navigation/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Eye, Clock, Pin, Lock, Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { redirect, notFound } from "next/navigation"

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get category
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (!category) {
    notFound()
  }

  // Get threads in this category
  const { data: threads } = await supabase
    .from("threads")
    .select(`
      *,
      author:profiles(username, display_name, avatar_url),
      last_reply_author:profiles!threads_last_reply_by_fkey(username, display_name, avatar_url)
    `)
    .eq("category_id", category.id)
    .eq("is_deleted", false)
    .order("is_pinned", { ascending: false })
    .order("last_reply_at", { ascending: false })

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
        {/* Category Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/forum">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Forum
              </Link>
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: `${category.color}20` }}>
                <MessageCircle className="h-8 w-8" style={{ color: category.color }} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-balance">{category.name}</h1>
                <p className="text-muted-foreground text-pretty mt-1">{category.description}</p>
              </div>
            </div>
            <Button asChild>
              <Link href={`/forum/category/${category.slug}/new-thread`}>
                <Plus className="h-4 w-4 mr-2" />
                New Thread
              </Link>
            </Button>
          </div>
        </div>

        {/* Threads List */}
        <div className="space-y-3">
          {threads?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No threads yet</h3>
                <p className="text-muted-foreground mb-4">Be the first to start a conversation in this category!</p>
                <Button asChild>
                  <Link href={`/forum/category/${category.slug}/new-thread`}>Create First Thread</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            threads?.map((thread) => (
              <Card key={thread.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={thread.author?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{thread.author?.display_name?.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {thread.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                            {thread.is_locked && <Lock className="h-4 w-4 text-muted-foreground" />}
                            <Link
                              href={`/forum/thread/${thread.id}`}
                              className="font-semibold hover:text-primary transition-colors text-pretty"
                            >
                              {thread.title}
                            </Link>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>by {thread.author?.display_name}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(thread.created_at)}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-1">
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {thread.reply_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {thread.view_count}
                            </span>
                          </div>
                          {thread.last_reply_by && (
                            <div className="text-xs text-muted-foreground">
                              Last by {thread.last_reply_author?.display_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
