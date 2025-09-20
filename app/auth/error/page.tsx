import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Heart } from "lucide-react"
import Link from "next/link"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/20 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-primary fill-primary/20" />
            <h1 className="text-2xl font-bold text-foreground">Girls Community</h1>
          </div>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-destructive/10 rounded-full">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-xl text-balance">Oops, something went wrong</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {params?.error ? (
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">Error: {params.error}</p>
            ) : (
              <p className="text-sm text-muted-foreground">An unexpected error occurred during authentication.</p>
            )}
            <div className="pt-4">
              <Link
                href="/auth/login"
                className="text-primary hover:text-primary/80 font-medium underline underline-offset-4"
              >
                Try signing in again
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
