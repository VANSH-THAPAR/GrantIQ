'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, useSpring, useTransform, SpringOptions } from 'framer-motion'
import { cn } from '@/lib/utils'

type InteractiveSpotlightProps = {
  className?: string
  size?: number
  color?: string
  springOptions?: SpringOptions
}

export function InteractiveSpotlight({
  className,
  size = 160,
  color = 'rgba(255, 255, 255, 0.5)',
  springOptions = { stiffness: 200, damping: 22, mass: 0.12 },
}: InteractiveSpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [parentElement, setParentElement] = useState<HTMLElement | null>(null)

  const mouseX = useSpring(0, springOptions)
  const mouseY = useSpring(0, springOptions)

  const spotlightLeft = useTransform(mouseX, x => `${x - size / 2}px`)
  const spotlightTop = useTransform(mouseY, y => `${y - size / 2}px`)

  useEffect(() => {
    if (containerRef.current?.parentElement) {
      const parent = containerRef.current.parentElement
      parent.style.position = 'relative'
      parent.style.overflow = 'hidden'
      setParentElement(parent)
    }
  }, [])

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!parentElement) return
      const { left, top } = parentElement.getBoundingClientRect()
      mouseX.set(event.clientX - left)
      mouseY.set(event.clientY - top)
    },
    [mouseX, mouseY, parentElement]
  )

  useEffect(() => {
    if (!parentElement) return

    const enter = () => setIsHovered(true)
    const leave = () => setIsHovered(false)

    parentElement.addEventListener('mousemove', handleMouseMove)
    parentElement.addEventListener('mouseenter', enter)
    parentElement.addEventListener('mouseleave', leave)

    return () => {
      parentElement.removeEventListener('mousemove', handleMouseMove)
      parentElement.removeEventListener('mouseenter', enter)
      parentElement.removeEventListener('mouseleave', leave)
    }
  }, [parentElement, handleMouseMove])

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        'pointer-events-none absolute rounded-full transition-opacity duration-150',
        isHovered ? 'opacity-100' : 'opacity-0',
        'spotlight',
        className
      )}
      style={{
        width: size,
        height: size,
        left: spotlightLeft,
        top: spotlightTop,
        zIndex: 1,
        backgroundColor: color,
        filter: 'blur(40px)',
      }}
    />
  )
}
