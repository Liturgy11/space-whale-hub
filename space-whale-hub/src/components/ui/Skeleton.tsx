'use client'

import React from 'react'

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-gray-200/70 ${className}`} />
  )
}

export function SkeletonText({ lines = 1 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'} rounded bg-gray-200/70 animate-pulse`} />
      ))}
    </div>
  )
}

export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size }} className="rounded-full bg-gray-200/70 animate-pulse" />
  )
}




