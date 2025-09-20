"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Search, MessageCircle, Users } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface QuickSearchResult {
  id: string
  type: "thread" | "user"
  title?: string
  display_name?: string
  username?: string
  category?: {
    name: string
    color: string
  }
}

export function SearchModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<QuickSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const performQuickSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const searchTerm = `%${searchQuery.toLowerCase()}%`

      // Quick search for threads and users
      const [{ data: threads }, { data: users }] = await Promise.all([
        supabase
          .from("threads")
          .select(`
            id,
            title,
            category:categories(name, color)
          `)
          .ilike("title", searchTerm)
          .eq("is_deleted", false)
          .limit(5),
        supabase
          .from("profiles")
          .select("id, display_name, username")
          .or(`display_name.ilike.${searchTerm},username.ilike.${searchTerm}`)
          .eq("is_banned", false)
          .limit(5),
      ])

      const quickResults: QuickSearchResult[] = [
        ...(threads?.map((thread) => ({
          id: thread.id,
          type: "thread" as const,
          title: thread.title,
          category: thread.category,
        })) || []),
        ...(users?.map((user) => ({
          id: user.id,
          type: "user" as const,
          display_name: user.display_name,
          username: user.username,
        })) || []),
      ]

      setResults(quickResults)
    } catch (error) {
      console.error("Quick search error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (value: string) => {
    setQuery(value)
    performQuickSearch(value)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="hidden sm:flex">
          <Search className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search Community</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search threads, posts, and members..."
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {query && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-4 text-muted-foreground">Searching...</div>
              ) : results.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No results found</div>
              ) : (
                <>
                  {results.map((result) => (
                    <Link
                      key={`${result.type}-${result.id}`}
                      href={result.type === "thread" ? `/forum/thread/${result.id}` : `/profile/${result.username}`}
                      className="block p-3 hover:bg-muted rounded-lg transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-full">
                          {result.type === "thread" ? (
                            <MessageCircle className="h-4 w-4" />
                          ) : (
                            <Users className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          {result.type === "thread" ? (
                            <>
                              <p className="font-medium text-sm line-clamp-1">{result.title}</p>
                              {result.category && (
                                <Badge
                                  variant="secondary"
                                  style={{
                                    backgroundColor: `${result.category.color}20`,
                                    color: result.category.color,
                                  }}
                                  className="text-xs mt-1"
                                >
                                  {result.category.name}
                                </Badge>
                              )}
                            </>
                          ) : (
                            <>
                              <p className="font-medium text-sm">{result.display_name}</p>
                              <p className="text-xs text-muted-foreground">@{result.username}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                  <div className="pt-2 border-t">
                    <Link
                      href={`/search?q=${encodeURIComponent(query)}`}
                      className="block text-center text-sm text-primary hover:underline py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      View all results →
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
