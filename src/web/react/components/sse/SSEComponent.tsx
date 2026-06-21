import { useEffect } from 'react'

interface SSEComponentProps {
  audioStateChanger: React.Dispatch<React.SetStateAction<string | null>>
}

export const SSEComponent: React.FC<SSEComponentProps> = ({
  audioStateChanger,
}) => {
  useEffect(() => {
    const es = new EventSource('/events')

    es.onopen = () => {
      console.log('SSE Connection Opened')
    }

    es.onerror = (err) => {
      console.error('Event Source Error: ', err)
      es.close()
    }

    es.onmessage = (e) => {
      const data = JSON.parse(e.data)
      console.log('Generic Message Received:', data)
    }

    es.addEventListener('play', (event) => {
      const filename = JSON.parse(event.data)
      console.log('Play event received for id:', filename)
      const audioString = `/audio/${filename}.mp3`
      console.log('audio state changer updating')
      audioStateChanger(audioString)
    })

    return () => {
      es.close()
      console.log('SSE Connection closed')
    }
  }, [])

  return null
}
