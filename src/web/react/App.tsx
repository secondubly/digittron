// import { useEffect, useState, useRef } from 'react'
import { NavbarMinimal } from "./components/navbar/Navbar"

export default function MyApp() {
    // const [audioUrl, setAudioURL] = useState<string | null>(null)

    return (
        <div>
            <NavbarMinimal />
            {/* <AudioPlayer audioUrl={audioUrl} />
            <SSEComponent audioStateChanger={setAudioURL} /> */}
        </div>
    )
}