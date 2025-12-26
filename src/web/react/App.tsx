import { useEffect, useState, useRef } from 'react'

export default function MyApp() {
    interface Props {
        audioUrl: string | null
    }

    interface SSEComponentProps {
        audioStateChanger: React.Dispatch<React.SetStateAction<string | null>>
    }

    const AudioPlayer = ({ audioUrl }: Props) => {
        const audioRef = useRef<HTMLAudioElement>(null)

        useEffect(() => {
            if (audioUrl && audioRef.current) {
                audioRef.current.src = audioUrl // Set the source programmatically
                audioRef.current.volume = 0.5
                audioRef.current.autoplay = true
                audioRef.current.load() // Load the new source
                audioRef.current.play()
            }
        }, [audioUrl]) // run whenever audio url changes

        return (
            <div>
                {/* controls=false for custom controls */}
                <audio ref={audioRef} controls={false} muted />
            </div>
        )
    }

    const SSEComponent: React.FC<SSEComponentProps> = ({
        audioStateChanger,
    }) => {
        const [connectionState, setConnectionState] = useState('CONNECTING')

        useEffect(() => {
            const es = new EventSource('http://localhost:4000/events')

            es.onopen = () => {
                console.log('SSE Connection Opened')
                setConnectionState('OPEN')
            }

            es.onerror = (err) => {
                console.error('Event Source Error: ', err)
                setConnectionState('ERROR')
                es.close()
            }

            es.onmessage = (e) => {
                const data = JSON.parse(e.data)
                console.log('Generic Message Received:', data)
            }

            es.addEventListener('play', (event) => {
                const filename = JSON.parse(event.data)
                console.log('Play event received for id:', filename)
                const audioString = `/audio/${filename}.wav`
                audioStateChanger(audioString)
            })

            return () => {
                es.close()
                console.log('SSE Connection closed')
            }
        }, [])

        return (
            <div>
                <p>Connection state: {connectionState}</p>
            </div>
        )
    }

    const [audioUrl, setAudioURL] = useState<string | null>(null)

    return (
        <div>
            <AudioPlayer audioUrl={audioUrl} />
            <SSEComponent audioStateChanger={setAudioURL} />
        </div>
    )
}
