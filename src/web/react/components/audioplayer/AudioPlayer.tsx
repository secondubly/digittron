import { useEffect, useRef } from 'react'

interface Props {
  audioUrl: string | null
}

export const AudioPlayer = ({ audioUrl }: Props) => {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl // Set the source programmatically
      audioRef.current.volume = 0.5
      audioRef.current.autoplay = true
      audioRef.current.load() // Load the new source
      audioRef.current.play()

      // if (playPromise !== undefined) {
      //     playPromise.then(_ => {
      //         console.log('playing audio')
      //     }).catch(error => {
      //         console.error(error)
      //     })
      // }
    }
  }, [audioUrl]) // run whenever audio url changes

  return (
    <div>
      {/* controls=false for custom controls */}
      <audio ref={audioRef} controls={false} />
    </div>
  )
}
