"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useState } from "react"

interface LikeButtonProps {
  postId: string
  initialLikes: number
  isLiked: boolean
}

export function LikeButton({ postId, initialLikes, isLiked }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [liked, setLiked] = useState(isLiked)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleLike = async () => {
    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      if (liked) {
        // Unlike
        const { error } = await supabase.from("likes").delete().eq("user_id", user.id).eq("post_id", postId)

        if (!error) {
          setLikes((prev) => prev - 1)
          setLiked(false)
        }
      } else {
        // Like
        const { error } = await supabase.from("likes").insert({
          user_id: user.id,
          post_id: postId,
        })

        if (!error) {
          setLikes((prev) => prev + 1)
          setLiked(true)
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLike} disabled={isLoading} className={liked ? "text-primary" : ""}>
      <Heart className={`h-4 w-4 mr-2 ${liked ? "fill-current" : ""}`} />
      {likes}
    </Button>
  )
}
