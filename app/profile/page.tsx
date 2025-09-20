import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/navigation/header"
import { Footer } from "@/components/navigation/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle, Heart, Calendar, MapPin, Globe, Settings } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get user's threads
  const { data: threads } = await supabase
    .from("threads")
    .select(`
      *,
      category:categories(name, color, slug)
    `)
    .eq("author_id", user.id)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(10)

  // Get user's posts
  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      thread:threads(id, title, category:categories(name, slug))
    `)
    .eq("author_id", user.id)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(10)

  // Get user's liked posts
  const { data: likedPosts } = await supabase
    .from("likes")
    .select(`
      created_at,
      post:posts(
        id,
        content,
        thread:threads(id, title, category:categories(name, slug)),
        author:profiles(display_name, username)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="h-24 w-24 shrink-0">
                <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl">{profile?.display_name?.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold">{profile?.display_name}</h1>
                      {profile?.is_moderator && <Badge variant="secondary">Moderator</Badge>}
                    </div>
                    <p className="text-muted-foreground">@{profile?.username}</p>
                  </div>
                  <Button asChild>
                    <Link href="/settings">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                </div>

                {profile?.bio && <p className="text-pretty mb-4">{profile.bio}</p>}

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {formatJoinDate(profile?.joined_at || "")}
                  </div>
                  {profile?.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </div>
                  )}
                  {profile?.website && (
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                      >
                        Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{profile?.post_count || 0}</div>
                <div className="text-sm text-muted-foreground">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{threads?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Threads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{likedPosts?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Likes Given</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{profile?.reputation || 0}</div>
                <div className="text-sm text-muted-foreground">Reputation</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Tabs */}
        <Tabs defaultValue="threads" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="threads">My Threads</TabsTrigger>
            <TabsTrigger value="posts">Recent Posts</TabsTrigger>
            <TabsTrigger value="likes">Liked Posts</TabsTrigger>
          </TabsList>

          <TabsContent value="threads" className="space-y-4">
            {threads?.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No threads yet</h3>
                  <p className="text-muted-foreground mb-4">Start a conversation in the community!</p>
                  <Button asChild>
                    <Link href="/forum">Browse Forum</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              threads?.map((thread) => (
                <Card key={thread.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="secondary"
                            style={{
                              backgroundColor: `${thread.category.color}20`,
                              color: thread.category.color,
                            }}
                          >
                            {thread.category.name}
                          </Badge>
                        </div>
                        <Link
                          href={`/forum/thread/${thread.id}`}
                          className="font-semibold hover:text-primary transition-colors text-pretty block mb-2"
                        >
                          {thread.title}
                        </Link>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {thread.reply_count} replies
                          </span>
                          <span>{formatTimeAgo(thread.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="posts" className="space-y-4">
            {posts?.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground mb-4">Join the conversation by replying to threads!</p>
                  <Button asChild>
                    <Link href="/forum">Browse Forum</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              posts?.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor: `${post.thread.category.color}20`,
                            color: post.thread.category.color,
                          }}
                        >
                          {post.thread.category.name}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          in{" "}
                          <Link
                            href={`/forum/thread/${post.thread.id}`}
                            className="hover:text-primary transition-colors"
                          >
                            {post.thread.title}
                          </Link>
                        </span>
                      </div>
                      <p className="text-pretty line-clamp-3">{post.content}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {post.like_count || 0} likes
                        </span>
                        <span>{formatTimeAgo(post.created_at)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="likes" className="space-y-4">
            {likedPosts?.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No liked posts yet</h3>
                  <p className="text-muted-foreground mb-4">Show some love by liking posts you enjoy!</p>
                  <Button asChild>
                    <Link href="/forum">Browse Forum</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              likedPosts?.map((like) => (
                <Card key={like.post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor: `${like.post.thread.category.color}20`,
                            color: like.post.thread.category.color,
                          }}
                        >
                          {like.post.thread.category.name}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          by {like.post.author.display_name} in{" "}
                          <Link
                            href={`/forum/thread/${like.post.thread.id}`}
                            className="hover:text-primary transition-colors"
                          >
                            {like.post.thread.title}
                          </Link>
                        </span>
                      </div>
                      <p className="text-pretty line-clamp-3">{like.post.content}</p>
                      <div className="text-sm text-muted-foreground">Liked {formatTimeAgo(like.created_at)}</div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  )
}
