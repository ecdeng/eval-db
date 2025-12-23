"use client"

import * as React from "react"
import { createPortal } from "react-dom"

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
}

export function Tooltip({ children, content, side = "top" }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [position, setPosition] = React.useState<{
    top: number
    left: number
  } | null>(null)
  const [isPositioned, setIsPositioned] = React.useState(false)
  const triggerRef = React.useRef<HTMLDivElement>(null)
  const tooltipRef = React.useRef<HTMLDivElement>(null)

  const calculatePosition = React.useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const padding = 8 // Padding from viewport edges

    let top = 0
    let left = 0

    // Calculate position based on preferred side
    switch (side) {
      case "top":
        top = triggerRect.top - tooltipRect.height - padding
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2
        // If tooltip goes above viewport, flip to bottom
        if (top < padding) {
          top = triggerRect.bottom + padding
        }
        break
      case "bottom":
        top = triggerRect.bottom + padding
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2
        // If tooltip goes below viewport, flip to top
        if (top + tooltipRect.height > viewportHeight - padding) {
          top = triggerRect.top - tooltipRect.height - padding
        }
        break
      case "left":
        left = triggerRect.left - tooltipRect.width - padding
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2
        // If tooltip goes left of viewport, flip to right
        if (left < padding) {
          left = triggerRect.right + padding
        }
        break
      case "right":
        left = triggerRect.right + padding
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2
        // If tooltip goes right of viewport, flip to left
        if (left + tooltipRect.width > viewportWidth - padding) {
          left = triggerRect.left - tooltipRect.width - padding
        }
        break
    }

    // Adjust horizontal position to stay within viewport
    if (left < padding) {
      left = padding
    } else if (left + tooltipRect.width > viewportWidth - padding) {
      left = viewportWidth - tooltipRect.width - padding
    }

    // Adjust vertical position to stay within viewport
    if (top < padding) {
      top = padding
    } else if (top + tooltipRect.height > viewportHeight - padding) {
      top = viewportHeight - tooltipRect.height - padding
    }

    setPosition({ top, left })
    setIsPositioned(true)
  }, [side])

  React.useEffect(() => {
    if (isVisible) {
      setIsPositioned(false)
      // First render tooltip off-screen to measure it
      setPosition({ top: -9999, left: -9999 })
      
      // Then calculate actual position after render
      const timeoutId = setTimeout(() => {
        calculatePosition()
      }, 0)
      
      return () => clearTimeout(timeoutId)
    } else {
      setPosition(null)
      setIsPositioned(false)
    }
  }, [isVisible, calculatePosition])

  React.useEffect(() => {
    if (isVisible && position) {
      const handleScroll = () => {
        calculatePosition()
      }
      const handleResize = () => {
        calculatePosition()
      }

      window.addEventListener("scroll", handleScroll, true)
      window.addEventListener("resize", handleResize)

      return () => {
        window.removeEventListener("scroll", handleScroll, true)
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [isVisible, position, calculatePosition])

  const tooltipContent = isVisible && position && (
    <div
      ref={tooltipRef}
      className="fixed z-[9999] px-3 py-2 text-sm text-white bg-gray-900 rounded-md shadow-lg whitespace-normal max-w-xs pointer-events-none"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        visibility: isPositioned ? "visible" : "hidden",
      }}
    >
      {content}
    </div>
  )

  return (
    <>
      <div
        ref={triggerRef}
        className="relative inline-block"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {typeof window !== "undefined" && tooltipContent
        ? createPortal(tooltipContent, document.body)
        : null}
    </>
  )
}

