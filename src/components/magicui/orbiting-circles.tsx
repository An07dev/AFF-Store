"use client"

import React from "react"
import styles from "./orbiting-circles.module.css"

export interface OrbitingCirclesProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: React.ReactNode
  reverse?: boolean
  duration?: number
  delay?: number
  radius?: number
  path?: boolean
  iconSize?: number
  speed?: number
  strokeColor?: string
}

export function OrbitingCircles({
  className = "",
  children,
  reverse = false,
  duration = 20,
  radius = 160,
  path = true,
  iconSize = 40,
  speed = 1,
  strokeColor,
  style,
  ...props
}: OrbitingCirclesProps) {
  const calculatedDuration = duration / speed
  const childCount = React.Children.count(children)

  return (
    <>
      {path && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          className={styles.orbitSvg}
        >
          <circle
            className={styles.orbitPath}
            style={
              {
                stroke: strokeColor,
                r: `calc(${radius}px * var(--orbit-scale, 1))`,
              } as React.CSSProperties
            }
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
          />
        </svg>
      )}
      {React.Children.map(children, (child, index) => {
        const angle = (360 / (childCount || 1)) * index
        return (
          <div
            style={
              {
                "--duration": `${calculatedDuration}s`,
                "--radius": `${radius}px`,
                "--angle": `${angle}deg`,
                "--icon-size": `${iconSize}px`,
                width: `${iconSize}px`,
                height: `${iconSize}px`,
                ...style,
              } as React.CSSProperties
            }
            className={`${styles.orbitItem} ${reverse ? styles.orbitReverse : ''} ${className}`}
            {...props}
          >
            {child}
          </div>
        )
      })}
    </>
  )
}

export default OrbitingCircles
