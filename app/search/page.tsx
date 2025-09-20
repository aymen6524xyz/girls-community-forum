"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/navigation/header"
import { Footer } from "@/components/navigation/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

interface SearchResult {
  id: string
  type: "thread" | "post" | "user"
  title?: string
  content?: string
  display_name?: string
  username?: string
  avatar_url?: string
  category?: {
    name: string
    color: string
    slug: string
  }
  author?: {
    display_name: string
    username: string
  }
  created_at: string
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const query = searchParams.get("q")
    if (query) {
      setSearchQuery(query)
      performSearch(query)
    }
  }, [searchParams])

  const performSearch = async (query: string) => {
    if (!query.trim()) return

    setIsLoading(true)
    try {
      const searchTerm = `%${query.toLowerCase()}%`

      // Search threads
      const { data: threads } = await supabase
        .from("threads")
        .select(`
          id,
          title,
          content,
          created_at,
          author:profiles(display_name, username),
          category:categories(name, color, slug)
        `)
        .or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)
        .eq("is_deleted", false)
        .limit(20)

      // Search posts
      const { data: posts } = await supabase
        .from("posts")
        .select(`
          id,
          content,
          created_at,
          author:profiles(display_name, username),
          thread:threads(id, title, category:categories(name, color, slug))
        `)
        .ilike("content", searchTerm)
        .eq("is_deleted", false)
        .limit(20)

      // Search users
      const { data: users } = await supabase
        .from("profiles")
        .select("id, display_name, username, avatar_url, joined_at")
        .or(`display_name.ilike.${searchTerm},username.ilike.${searchTerm}`)
        .eq("is_banned", false)
        .limit(10)

      // Combine and format results
      const allResults: SearchResult[] = [
        ...(threads?.map((thread) => ({
          id: thread.id,
          type: "thread" as const,
          title: thread.title,
          content: thread.content,
          category: thread.category,
          author: thread.author,
          created_at: thread.created_at,
        })) || []),
        ...(posts?.map((post) => ({
          id: post.id,
          type: "post" as const,
          content: post.content,
          category: post.thread?.category,
          author: post.author,
          created_at: post.created_at,
        })) || []),
        ...(users?.map((user) => ({
          id: user.id,
          type: "user" as const,
          display_name: user.display_name,
          username: user.username,
          avatar_url: user.avatar_url,
          created_at: user.joined_at,
        })) || []),
      ]

      setResults(allResults)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
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

  const filteredResults = results.filter((result) => {
    if (activeTab === "all") return true
    return result.type === activeTab
  })

  const getResultCounts = () => {
    return {
      all: results.length,
      thread: results.filter((r) => r.type === "thread").length,
      post: results.filter((r) => r.type === "post").length,
      user: results.filter((r) => r.type === "user").length,
    }
  }

  const counts = getResultCounts()

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance mb-4">Search Community</h1>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search threads, posts, and members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </form>
        </div>

        {/* Results */}
        {searchQuery && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                {isLoading ? "Searching..." : `Found ${results.length} results for "${searchQuery}"`}
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
                <TabsTrigger value="thread">Threads ({counts.thread})</TabsTrigger>
                <TabsTrigger value="post">Posts ({counts.post})</TabsTrigger>
                <TabsTrigger value="user">Users ({counts.user})</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                {filteredResults.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No results found</h3>
                      <p className="text-muted-foreground">Try adjusting your search terms or browse our categories.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredResults.map((result) => (
                      <Card key={`${result.type}-${result.id}`} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          {result.type === "thread" && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  style={{
                                    backgroundColor: `${result.category?.color}20`,
                                    color: result.category?.color,
                                  }}
                                >
                                  {result.category?.name}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  Thread
                                </Badge>
                              </div>
                              <Link
                                href={`/forum/thread/${result.id}`}
                                className="block font-semibold hover:text-primary transition-colors text-pretty"
                              >
                                {result.title}
                              </Link>
                              <p className="text-sm text-muted-foreground line-clamp-2">{result.content}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>by {result.author?.display_name}</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTimeAgo(result.created_at)}
                                </span>
                              </div>
                            </div>
                          )}

                          {result.type === "post" && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  Post
                                </Badge>
                                {result.category && (
                                  <Badge
                                    variant="secondary"
                                    style={{
                                      backgroundColor: `${result.category.color}20`,
                                      color: result.category.color,
                                    }}
                                  >
                                    {result.category.name}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-pretty line-clamp-3">{result.content}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>by {result.author?.display_name}</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTimeAgo(result.created_at)}
                                </span>
                              </div>
                            </div>
                          )}

                          {result.type === "user" && (
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={result.avatar_url || "/placeholder.svg"} />
                                <AvatarFallback>{result.display_name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    User
                                  </Badge>
                                </div>
                                <p className="font-semibold">{result.display_name}</p>
                                <p className="text-sm text-muted-foreground">@{result.username}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Joined {formatTimeAgo(result.created_at)}
                                </p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
