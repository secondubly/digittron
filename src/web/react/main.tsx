import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { MantineProvider } from '@mantine/core'
import { DEFAULT_THEME } from '@mantine/core'
import '@mantine/core/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <MantineProvider theme={DEFAULT_THEME}>
        <App />
    </MantineProvider>,
)
