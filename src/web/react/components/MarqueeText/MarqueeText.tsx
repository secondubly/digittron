import { Box, Title } from '@mantine/core'
import { useRef, useEffect, useState, useCallback } from 'react'
import classes from './MarqueeText.module.css'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MarqueeTextProps {
  text: string
  /** Scroll speed in pixels per second. Default: 60 */
  speed?: number
  pauseOnHover?: boolean
  style?: React.CSSProperties
  className?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export const MarqueeText = ({
  text,
  speed = 60,
  pauseOnHover = true,
  style,
  className,
}: MarqueeTextProps) => {
  const wrapRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const copy1Ref = useRef<HTMLHeadingElement>(null)

  /** Duration (seconds) for one full scroll cycle; null = no overflow → no animation */
  const [duration, setDuration] = useState<number | null>(null)
  const [paused, setPaused] = useState(false)

  // Recalculate whenever text or speed changes, and on resize.
  const measure = useCallback(() => {
    const wrapW = wrapRef.current?.offsetWidth ?? 0
    const copy1W = copy1Ref.current?.offsetWidth ?? 0
    setDuration(copy1W > wrapW ? copy1W / speed : null)
  }, [speed])

  useEffect(() => {
    measure()
  }, [text, measure])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [measure])

  const trackStyle: React.CSSProperties = {
    animationDuration: duration ? `${duration.toFixed(2)}s` : undefined,
    animationPlayState: paused ? 'paused' : 'running',
  }

  return (
    <Box
      ref={wrapRef}
      className={`${classes.wrap} ${className ?? ''}`}
      style={style}
    >
      <div
        ref={trackRef}
        className={duration ? classes.trackAnimating : classes.trackStatic}
        style={trackStyle}
      >
        <Title
          order={2}
          ref={copy1Ref}
          fw={700}
          className={classes.copy}
          style={{ whiteSpace: 'nowrap' }}
        >
          {text}
        </Title>
        {/* <Text
          ref={copy1Ref}
          fw={700}
          className={classes.copy}
        >
          {text}
        </Text> */}

        {duration !== null && (
          <Title
            order={2}
            className={classes.copy}
            fw={700}
            style={{ whiteSpace: 'nowrap' }}
            aria-hidden
          >
            {text}
          </Title>
          // <Text
          //   ref={copy1Ref}
          //   fw={700}
          //   className={classes.copy}
          // >
          //   {text}
          // </Text>
        )}
      </div>

      {/* we don't need to show faded edges for track titles that aren't overflowing */}
      {duration && <div className={classes.fadeLeft} aria-hidden />}
      {duration && <div className={classes.fadeRight} aria-hidden />}

      {/* Invisible hover capture layer (avoids interfering with text selection) */}
      {pauseOnHover && (
        <div
          className={classes.hoverLayer}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          aria-hidden
        />
      )}
    </Box>
  )
}
