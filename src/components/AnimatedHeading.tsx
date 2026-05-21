"use client"

import { useEffect, useState } from "react"

interface AnimatedHeadingProps {
  text: string
  className?: string
  initialDelay?: number
}

const CHAR_DELAY = 30

export default function AnimatedHeading({ text, className = "", initialDelay = 200 }: AnimatedHeadingProps) {
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), initialDelay)
    return () => clearTimeout(t)
  }, [initialDelay])

  const lines = text.split("\n")
  let totalCharsBefore = 0

  return (
    <h1 className={className} style={{ letterSpacing: "-0.04em" }}>
      {lines.map((line, lineIndex) => {
        const lineEl = (
          <span key={lineIndex} className="block">
            {line.split("").map((char, charIndex) => {
              const delay = (totalCharsBefore + charIndex) * CHAR_DELAY
              return (
                <span
                  key={charIndex}
                  className="inline-block transition-all duration-500"
                  style={{
                    opacity: started ? 1 : 0,
                    transform: started ? "translateX(0)" : "translateX(-18px)",
                    transitionDelay: `${delay}ms`,
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              )
            })}
          </span>
        )
        totalCharsBefore += line.length
        return lineEl
      })}
    </h1>
  )
}
