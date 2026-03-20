import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { MantineProvider } from '@mantine/core'
import theme from './components/theme.js'
import { BrowserRouter } from 'react-router-dom'
import { Notifications } from '@mantine/notifications'
import '@mantine/core/styles.css';
import './styles/global.css'
import '@mantine/notifications/styles.css';
import { AuthProvider } from './contexts/AuthContext.js'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <MantineProvider theme={theme}>
        <Notifications />
        <AuthProvider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </AuthProvider>
    </MantineProvider>,
)
