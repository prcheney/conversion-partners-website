"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ContactFormModal } from "@/components/contact-form-modal"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled ? "bg-white/95 backdrop-blur-sm border-b border-border" : "bg-white"
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/images/cpn-logo.png"
              alt="Conversion Partners Network"
              width={200}
              height={60}
              className="h-12 w-auto"
            />
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-foreground hover:text-primary transition-colors">
              Home
            </a>
            <a href="#about" className="text-foreground hover:text-primary transition-colors">
              About
            </a>
            <ContactFormModal
              trigger={<button className="text-foreground hover:text-primary transition-colors">Contact</button>}
              title="Get In Touch"
            />
          </nav>
        </div>
      </div>
    </header>
  )
}
