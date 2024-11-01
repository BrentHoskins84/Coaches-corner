'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface LoadingDotsProps {
  size?: number
  gap?: number
}

export default function LoadingDots({
  size = 12,
  gap = 4
}: LoadingDotsProps) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ gap: gap }}
      role="status"
      aria-label="Loading"
    >
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="bg-primary rounded-full"
          style={{
            width: size,
            height: size,
          }}
          animate={{
            y: ['0%', '-50%', '0%'],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut',
            delay: index * 0.2,
          }}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  )
}
