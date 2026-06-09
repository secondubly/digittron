import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { MantineProvider } from '@mantine/core'
import theme from './components/theme.js'
import { BrowserRouter } from 'react-router-dom'
import { Notifications } from '@mantine/notifications'
import { AuthProvider } from './contexts/AuthContext.js'
import '@mantine/core/styles.css';
import './styles/global.css'
import '@mantine/notifications/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <MantineProvider theme={theme}>
        <Notifications />
            <BrowserRouter>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </BrowserRouter>
    </MantineProvider>
)
