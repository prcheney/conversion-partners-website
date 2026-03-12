export function ClientLogos() {
  const clients = [
    {
      name: "Verizon",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Verizon_2024.svg/1200px-Verizon_2024.svg.png?20250120011825",
    },
    {
      name: "Disney+",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Disney%2B_logo.svg/1200px-Disney%2B_logo.svg.png?20250509231455",
    },
    {
      name: "US Bank",
      logo: "https://cdn.brandfetch.io/id6EVneWal/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1679043041885",
    },
    {
      name: "Hims & Hers",
      logo: "https://cdn.brandfetch.io/idtQFoM6ES/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1696432253698",
    },
    {
      name: "Adobe",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Adobe_Corporate_logo.svg/768px-Adobe_Corporate_logo.svg.png?20220820114255",
    },
    { name: "Intuit", logo: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Intuit_Logo.svg" },
    {
      name: "New York Times",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/NewYorkTimes.svg/278px-NewYorkTimes.svg.png?20190313030219",
    },
    {
      name: "Twilio",
      logo: "https://cdn.brandfetch.io/idT7wVo_zL/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1667570480627",
    },
    {
      name: "Expedia",
      logo: "https://cdn.brandfetch.io/idh3Xg4aUN/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1750882452574",
    },
  ]

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-6">
        <h2 className="text-2xl lg:text-3xl font-semibold text-center text-foreground mb-12">
          A few of our favorite clients
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12 opacity-60">
          {clients.map((client, index) => (
            <div key={index} className="flex items-center justify-center h-12 lg:h-16">
              <img
                src={client.logo || "/placeholder.svg"}
                alt={`${client.name} logo`}
                className="h-full w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300 max-w-[120px] lg:max-w-[160px]"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
