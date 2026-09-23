import { Route, Routes } from 'react-router-dom'
import classes from './styles/AppShell.module.css'
import Home from './pages/Home'
import Commands from './pages/Commands'
import ProtectedRoute from './components/protected_routes/ProtectedRoutes'
import Giveaways from './pages/Giveaways'
import ChatModeration from './pages/ChatModeration'
import SongRequests from './pages/SongRequests'
import SpotifyLogin from './pages/SpotifyLogin'
import TwitchLogin from './pages/TwitchLogin'
import { OverlayPage } from './pages/Overlay'
import NotFound from './pages/NotFound'
import { BlankLayout } from './layouts/BlankLayout'
import { DashboardLayout } from './layouts/DashboardLayout'

export default function MyApp() {
  return (
    <Routes>


      <Route path="/overlay" element={<BlankLayout><OverlayPage /></BlankLayout>} />
      <Route path="*" element={<BlankLayout><NotFound /></BlankLayout>} />

      <Route path="/" element={<DashboardLayout><Home /></DashboardLayout>} />
      <Route path="/commands" element={<DashboardLayout><Commands /></DashboardLayout>} />
      <Route
        path="/giveaways"
        element={
          <ProtectedRoute>
            <DashboardLayout><Giveaways /></DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat_moderation"
        element={
          <ProtectedRoute>
            <DashboardLayout><ChatModeration /></DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/song_requests" element={<DashboardLayout><SongRequests /></DashboardLayout>} />

      {/* TODO: create hidden page for bot authentication AND for audio alerts/general stream stuff */}
      <Route path="/spotify_login" element={<DashboardLayout><SpotifyLogin /></DashboardLayout>} />

      <Route path="/twitch_login" element={<DashboardLayout><TwitchLogin /></DashboardLayout>} />
    </Routes>
  )
}