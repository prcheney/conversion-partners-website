export function Footer() {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">© 2025 Conversion Partners Network LLC</p>
          </div>
          <div>
            <a href="mailto:info@conversionpartners.net" className="text-sm hover:text-accent transition-colors">
              info@conversionpartners.net
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
