"use client"

import AnimatedHeading from "./AnimatedHeading"
import FadeIn from "./FadeIn"

const NAV_LINKS = ["Solar Panels", "Battery Storage", "How It Works", "About"]

export default function HeroSection() {
  const scrollToSearch = () => {
    document.getElementById("search")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="relative w-full h-screen flex flex-col overflow-hidden">
      {/* ── Video background — NO overlay ─────────────────────────────── */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4"
      />

      {/* ── Navbar ───────────────────────────────────────────────────── */}
      <div className="relative z-10 px-6 md:px-12 lg:px-16 pt-6">
        <nav className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between">
          <span className="text-2xl font-semibold tracking-tight text-white">SolarFinder</span>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm text-white/80 hover:text-gray-300 transition-colors duration-200"
              >
                {link}
              </a>
            ))}
          </div>

          <button
            onClick={scrollToSearch}
            className="bg-white text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors duration-200"
          >
            Get Started
          </button>
        </nav>
      </div>

      {/* ── Hero content — bottom aligned ────────────────────────────── */}
      <div className="relative z-10 px-6 md:px-12 lg:px-16 flex-1 flex flex-col justify-end pb-12 lg:pb-16">
        <div className="lg:grid lg:grid-cols-2 lg:items-end gap-8">

          {/* Left column */}
          <div>
            <AnimatedHeading
              text={"Find Solar Installers\nwho power your future."}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal text-white mb-4"
              initialDelay={200}
            />

            <FadeIn delay={800} duration={1000}>
              <p className="text-base md:text-lg text-gray-300 mb-5 max-w-lg">
                We connect homeowners with the UK&apos;s most trusted solar panel
                and battery storage installers. Real ratings, real results.
              </p>
            </FadeIn>

            <FadeIn delay={1200} duration={1000} className="flex flex-wrap gap-4">
              <button
                onClick={scrollToSearch}
                className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200"
              >
                Find Installers
              </button>
              <button className="liquid-glass border border-white/20 text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-black transition-all duration-300">
                How It Works
              </button>
            </FadeIn>
          </div>

          {/* Right column — tag card */}
          <FadeIn delay={1400} duration={1000} className="flex items-end justify-start lg:justify-end mt-8 lg:mt-0">
            <div className="liquid-glass border border-white/20 px-6 py-3 rounded-xl">
              <p className="text-lg md:text-xl lg:text-2xl font-light text-white">
                Install. Save. Generate.
              </p>
            </div>
          </FadeIn>

        </div>
      </div>
    </section>
  )
}
