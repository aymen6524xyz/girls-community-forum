"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Trash2, Lock, Pin, Eye } from "lucide-react"
import { useEffect, useState } from "react"

interface Thread {
  id: string
  title: string
  content: string
  is_pinned: boolean
  is_locked: boolean
  is_deleted: boolean
  view_count: number
  reply_count: number
  created_at: string
  author: {
    display_name: string
    username: string
    avatar_url?: string
  }
  category: {
    name: string
    color: string
  }
}

interface Post {
  id: string
  content: string
  like_count: number
  is_deleted: boolean
  created_at: string
  author: {
    display_name: string
    username: string
    avatar_url?: string
  }
  thread: {
    title: string
  }
}

export function ContentModeration() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchContent = async () => {
      const [threadsData, postsData] = await Promise.all([
        supabase
          .from("threads")
          .select(`
            *,
            author:profiles(display_name, username, avatar_url),
            category:categories(name, color)
          `)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("posts")
          .select(`
            *,
            author:profiles(display_name, username, avatar_url),
            thread:threads(title)
          `)
          .order("created_at", { ascending: false })
          .limit(20),
      ])

      setThreads(threadsData.data || [])
      setPosts(postsData.data || [])
      setIsLoading(false)
    }

    fetchContent()
  }, [supabase])

  const handleThreadAction = async (threadId: string, action: "delete" | "pin" | "unpin" | "lock" | "unlock") => {
    try {
      let updateData: any = {}

      switch (action) {
        case "delete":
          updateData = { is_deleted: true }
          break
        case "pin":
          updateData = { is_pinned: true }
          break
        case "unpin":
          updateData = { is_pinned: false }
          break
        case "lock":
          updateData = { is_locked: true }
          break
        case "unlock":
          updateData = { is_locked: false }
          break
      }

      const { error } = await supabase.from("threads").update(updateData).eq("id", threadId)

      if (!error) {
        setThreads(threads.map((thread) => (thread.id === threadId ? { ...thread, ...updateData } : thread)))
      }
    } catch (error) {
      console.error("Error updating thread:", error)
    }
  }

  const handlePostAction = async (postId: string, action: "delete") => {
    try {
      const { error } = await supabase.from("posts").update({ is_deleted: true }).eq("id", postId)

      if (!error) {
        setPosts(posts.map((post) => (post.id === postId ? { ...post, is_deleted: true } : post)))
      }
    } catch (error) {
      console.error("Error updating post:", error)
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
    return <div className="text-center py-8">Loading content...</div>
  }

  return (
    <Tabs defaultValue="threads" className="space-y-6">
      <TabsList>
        <TabsTrigger value="threads">Threads</TabsTrigger>
        <TabsTrigger value="posts">Posts</TabsTrigger>
      </TabsList>

      <TabsContent value="threads">
        <Card>
          <CardHeader>
            <CardTitle>Thread Moderation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {threads.map((thread) => (
                <div key={thread.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={thread.author.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{thread.author.display_name.charAt(0)}</AvatarFallback>
                  </Avatar>

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
                      {thread.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                      {thread.is_locked && <Lock className="h-4 w-4 text-muted-foreground" />}
                      {thread.is_deleted && (
                        <Badge variant="destructive" className="text-xs">
                          Deleted
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-semibold text-pretty mb-1">{thread.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{thread.content}</p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>by {thread.author.display_name}</span>
                      <span>{formatTimeAgo(thread.created_at)}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {thread.view_count} views
                      </span>
                      <span>{thread.reply_count} replies</span>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!thread.is_pinned ? (
                        <DropdownMenuItem onClick={() => handleThreadAction(thread.id, "pin")}>
                          <Pin className="h-4 w-4 mr-2" />
                          Pin Thread
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleThreadAction(thread.id, "unpin")}>
                          Unpin Thread
                        </DropdownMenuItem>
                      )}

                      {!thread.is_locked ? (
                        <DropdownMenuItem onClick={() => handleThreadAction(thread.id, "lock")}>
                          <Lock className="h-4 w-4 mr-2" />
                          Lock Thread
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleThreadAction(thread.id, "unlock")}>
                          Unlock Thread
                        </DropdownMenuItem>
                      )}

                      {!thread.is_deleted && (
                        <DropdownMenuItem
                          onClick={() => handleThreadAction(thread.id, "delete")}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Thread
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="posts">
        <Card>
          <CardHeader>
            <CardTitle>Post Moderation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={post.author.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{post.author.display_name.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{post.author.display_name}</span>
                      <span className="text-sm text-muted-foreground">in {post.thread.title}</span>
                      {post.is_deleted && (
                        <Badge variant="destructive" className="text-xs">
                          Deleted
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-pretty mb-2">{post.content}</p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{formatTimeAgo(post.created_at)}</span>
                      <span>{post.like_count} likes</span>
                    </div>
                  </div>

                  {!post.is_deleted && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handlePostAction(post.id, "delete")}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Post
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
