import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/navigation/header"
import { Footer } from "@/components/navigation/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Heart, Calendar } from "lucide-react"
import { redirect } from "next/navigation"

export default async function MembersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get all members with their stats
  const { data: members } = await supabase
    .from("profiles")
    .select("*")
    .eq("is_banned", false)
    .order("reputation", { ascending: false })
    .limit(50)

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance mb-2">Community Members</h1>
          <p className="text-muted-foreground text-pretty">Meet the amazing people in our community</p>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members?.map((member) => (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarImage src={member.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{member.display_name?.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{member.display_name}</h3>
                      {member.is_moderator && (
                        <Badge variant="secondary" className="text-xs">
                          Mod
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">@{member.username}</p>

                    {member.bio && <p className="text-sm text-pretty line-clamp-2 mb-3">{member.bio}</p>}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {member.post_count || 0} posts
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {member.reputation || 0} rep
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Joined {formatJoinDate(member.joined_at)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <p className="text-muted-foreground">Showing {members?.length || 0} members</p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
