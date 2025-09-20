"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Shield, Ban, UserCheck } from "lucide-react"
import { useEffect, useState } from "react"

interface User {
  id: string
  username: string
  display_name: string
  avatar_url?: string
  is_moderator: boolean
  is_banned: boolean
  post_count: number
  reputation: number
  joined_at: string
  last_active: string
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from("profiles").select("*").order("joined_at", { ascending: false }).limit(50)

      setUsers(data || [])
      setIsLoading(false)
    }

    fetchUsers()
  }, [supabase])

  const handleUserAction = async (userId: string, action: "ban" | "unban" | "promote" | "demote") => {
    try {
      let updateData: any = {}

      switch (action) {
        case "ban":
          updateData = { is_banned: true }
          break
        case "unban":
          updateData = { is_banned: false }
          break
        case "promote":
          updateData = { is_moderator: true }
          break
        case "demote":
          updateData = { is_moderator: false }
          break
      }

      const { error } = await supabase.from("profiles").update(updateData).eq("id", userId)

      if (!error) {
        setUsers(users.map((user) => (user.id === userId ? { ...user, ...updateData } : user)))
      }
    } catch (error) {
      console.error("Error updating user:", error)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading users...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>{user.display_name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{user.display_name}</p>
                    {user.is_moderator && (
                      <Badge variant="secondary" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Moderator
                      </Badge>
                    )}
                    {user.is_banned && (
                      <Badge variant="destructive" className="text-xs">
                        <Ban className="h-3 w-3 mr-1" />
                        Banned
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span>{user.post_count} posts</span>
                    <span>{user.reputation} reputation</span>
                    <span>Joined {formatDate(user.joined_at)}</span>
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!user.is_banned ? (
                    <DropdownMenuItem onClick={() => handleUserAction(user.id, "ban")} className="text-destructive">
                      <Ban className="h-4 w-4 mr-2" />
                      Ban User
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => handleUserAction(user.id, "unban")} className="text-green-600">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Unban User
                    </DropdownMenuItem>
                  )}

                  {!user.is_moderator ? (
                    <DropdownMenuItem onClick={() => handleUserAction(user.id, "promote")}>
                      <Shield className="h-4 w-4 mr-2" />
                      Promote to Moderator
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => handleUserAction(user.id, "demote")}>
                      Remove Moderator
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
