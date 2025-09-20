import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/navigation/header"
import { Footer } from "@/components/navigation/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Heart,
  MessageCircle,
  Users,
  TrendingUp,
  BookOpen,
  Star,
  Activity,
  Palette,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import Link from "next/link"

export default async function HomePage() {
  const supabase = await createClient()

  // Get some basic stats
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name, description, color, icon, thread_count, post_count")
    .eq("is_active", true)
    .order("sort_order")

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const categories = categoriesData || []

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      MessageCircle,
      Heart,
      Star,
      BookOpen,
      Activity,
      Palette,
    }
    return icons[iconName] || MessageCircle
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-background via-secondary/20 to-accent/20">
          <div className="container mx-auto text-center max-w-4xl">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-primary/10 rounded-full">
                <Heart className="h-12 w-12 text-primary fill-primary/20" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">
              Welcome to Our
              <span className="text-primary block">Safe Space</span>
            </h1>
            <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-2xl mx-auto">
              A supportive community where girls can connect, share experiences, seek advice, and celebrate each other's
              journeys.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button size="lg" asChild className="rounded-full">
                  <Link href="/forum">
                    Explore Forum
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild className="rounded-full">
                    <Link href="/auth/sign-up">
                      Join Our Community
                      <Sparkles className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild className="rounded-full bg-transparent">
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Community Stats */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card className="text-center border-border/50">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">1,200+</h3>
                  <p className="text-muted-foreground">Active Members</p>
                </CardContent>
              </Card>
              <Card className="text-center border-border/50">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-secondary/50 rounded-full">
                      <MessageCircle className="h-8 w-8 text-secondary-foreground" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">15,000+</h3>
                  <p className="text-muted-foreground">Discussions</p>
                </CardContent>
              </Card>
              <Card className="text-center border-border/50">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-accent/50 rounded-full">
                      <TrendingUp className="h-8 w-8 text-accent-foreground" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">98%</h3>
                  <p className="text-muted-foreground">Positive Feedback</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Forum Categories */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-balance mb-4">Explore Our Community</h2>
              <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
                Find your tribe in our diverse range of discussion topics
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {categories.map((category) => {
                const IconComponent = getIconComponent(category.icon)
                return (
                  <Card key={category.id} className="hover:shadow-lg transition-shadow border-border/50">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${category.color}20` }}>
                          <IconComponent className="h-5 w-5" style={{ color: category.color }} />
                        </div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                      </div>
                      <CardDescription className="text-pretty">{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{category.thread_count || 0} threads</span>
                        <span>{category.post_count || 0} posts</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="text-center mt-12">
              <Button variant="outline" size="lg" asChild className="rounded-full bg-transparent">
                <Link href="/forum">
                  View All Categories
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Community Guidelines Preview */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-balance mb-4">Our Community Values</h2>
              <p className="text-lg text-muted-foreground text-pretty">
                We're committed to creating a safe, inclusive space for everyone
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Respect & Kindness</h3>
                    <p className="text-sm text-muted-foreground">
                      We treat each other with respect, empathy, and understanding.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="p-2 bg-secondary/50 rounded-lg shrink-0">
                    <Users className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Inclusive Community</h3>
                    <p className="text-sm text-muted-foreground">
                      Everyone is welcome regardless of background, identity, or experience.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="p-2 bg-accent/50 rounded-lg shrink-0">
                    <MessageCircle className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Supportive Discussions</h3>
                    <p className="text-sm text-muted-foreground">
                      We encourage open, honest conversations and mutual support.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Personal Growth</h3>
                    <p className="text-sm text-muted-foreground">
                      We celebrate achievements and support each other's journeys.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
