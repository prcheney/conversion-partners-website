import { Target, Zap, TrendingUp } from "lucide-react"

export function ValueProposition() {
  const values = [
    {
      icon: Target,
      title: "Insight",
      description: "Clarity from thousands of real-world A/B tests.",
    },
    {
      icon: Zap,
      title: "Execution",
      description: "Practical frameworks you can apply immediately.",
    },
    {
      icon: TrendingUp,
      title: "Results",
      description: "Data-proven lift in conversion, revenue, and ROI.",
    },
  ]

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12">
          {values.map((value, index) => {
            const Icon = value.icon
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">{value.title}</h3>
                <p className="text-muted-foreground text-lg">{value.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
