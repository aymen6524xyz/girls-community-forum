import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/navigation/header"
import { Footer } from "@/components/navigation/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Eye, Clock, Pin, Lock, ArrowLeft, Reply, Flag } from "lucide-react"
import Link from "next/link"
import { redirect, notFound } from "next/navigation"
import { ReplyForm } from "@/components/forum/reply-form"
import { LikeButton } from "@/components/forum/like-button"

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get thread with category and author info
  const { data: thread } = await supabase
    .from("threads")
    .select(`
      *,
      category:categories(name, color, slug),
      author:profiles(username, display_name, avatar_url, is_moderator)
    `)
    .eq("id", id)
    .eq("is_deleted", false)
    .single()

  if (!thread) {
    notFound()
  }

  // Get posts in this thread
  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      author:profiles(username, display_name, avatar_url, is_moderator),
      likes:likes(user_id)
    `)
    .eq("thread_id", id)
    .eq("is_deleted", false)
    .order("created_at", { ascending: true })

  // Update view count
  await supabase
    .from("threads")
    .update({ view_count: (thread.view_count || 0) + 1 })
    .eq("id", id)

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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Thread Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/forum/category/${thread.category.slug}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to {thread.category.name}
              </Link>
            </Button>
            <Badge
              variant="secondary"
              style={{ backgroundColor: `${thread.category.color}20`, color: thread.category.color }}
            >
              {thread.category.name}
            </Badge>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {thread.is_pinned && <Pin className="h-5 w-5 text-primary" />}
                {thread.is_locked && <Lock className="h-5 w-5 text-muted-foreground" />}
                <h1 className="text-2xl font-bold text-balance">{thread.title}</h1>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {thread.reply_count} replies
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {thread.view_count} views
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatTimeAgo(thread.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Original Post */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12 shrink-0">
                <AvatarImage src={thread.author?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>{thread.author?.display_name?.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">{thread.author?.display_name}</span>
                  <span className="text-sm text-muted-foreground">@{thread.author?.username}</span>
                  {thread.author?.is_moderator && (
                    <Badge variant="secondary" className="text-xs">
                      Moderator
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground">• {formatTimeAgo(thread.created_at)}</span>
                </div>

                <div className="prose prose-sm max-w-none mb-4">
                  <p className="text-pretty whitespace-pre-wrap">{thread.content}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts/Replies */}
        <div className="space-y-4 mb-8">
          {posts?.map((post, index) => (
            <Card key={post.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={post.author?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{post.author?.display_name?.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{post.author?.display_name}</span>
                      <span className="text-sm text-muted-foreground">@{post.author?.username}</span>
                      {post.author?.is_moderator && (
                        <Badge variant="secondary" className="text-xs">
                          Moderator
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">• {formatTimeAgo(post.created_at)}</span>
                    </div>

                    <div className="prose prose-sm max-w-none mb-4">
                      <p className="text-pretty whitespace-pre-wrap">{post.content}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <LikeButton
                        postId={post.id}
                        initialLikes={post.like_count || 0}
                        isLiked={post.likes?.some((like: any) => like.user_id === user.id) || false}
                      />
                      <Button variant="ghost" size="sm">
                        <Reply className="h-4 w-4 mr-2" />
                        Reply
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Flag className="h-4 w-4 mr-2" />
                        Report
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reply Form */}
        {!thread.is_locked && <ReplyForm threadId={thread.id} />}
      </main>

      <Footer />
    </div>
  )
}
