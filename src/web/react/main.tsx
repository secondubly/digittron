import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { MantineProvider } from '@mantine/core'
import theme from './components/theme.js'
import { BrowserRouter } from 'react-router-dom'
import '@mantine/core/styles.css';
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <MantineProvider theme={theme}>
        <BrowserRouter>
        <App />
        </BrowserRouter>
    </MantineProvider>,
)
