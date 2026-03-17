// import { useEffect, useState, useRef } from 'react'
import { NavbarMinimal } from "./components/navbar/Navbar"
import { useMantineColorScheme, useComputedColorScheme } from "@mantine/core"
import AppRoutes from "./Router"
export default function MyApp() {
    // const [audioUrl, setAudioURL] = useState<string | null>(null)
    const { setColorScheme } = useMantineColorScheme({
        keepTransitions: true
    });
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const toggleColorScheme = () => {
        setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark')
    }

    return (
        
        <div className="page-layout">
            <header className="navbar-container">
                <NavbarMinimal colorScheme={computedColorScheme} toggleColorScheme={toggleColorScheme} />
            </header>
            <main className="content">
                <AppRoutes />
            </main>
            {/* <AudioPlayer audioUrl={audioUrl} />
            <SSEComponent audioStateChanger={setAudioURL} /> */}
        </div>
    )
}