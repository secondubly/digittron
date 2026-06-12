import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Commands from './pages/Commands'
import Register from './pages/Register'
import ChatModeration from './pages/ChatModeration'
import SongRequests from './pages/SongRequests'
import SpotifyLogin from './pages/SpotifyLogin'
import TwitchLogin from './pages/TwitchLogin'
import ProtectedRoute from "./components/protected_routes/ProtectedRoutes";
import Giveaways from "./pages/Giveaways";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/commands" element={
                <Commands />
            } />
            <Route path="/register" element={<Register />} />
            <Route path="/giveaways" element={
                <ProtectedRoute>
                    <Giveaways />
                </ProtectedRoute>
            } />
            <Route path="/chat_moderation" element={
                <ProtectedRoute>
                    <ChatModeration />
                </ProtectedRoute>
            } />
            <Route path="/song_requests" element={
                <SongRequests />
            } />

            {/* TODO: create hidden page for bot authentication AND for audio alerts/general stream stuff */}
            <Route path="/spotify_login" element={
                <SpotifyLogin />
             } />

            <Route path="/twitch_login" element={
                <TwitchLogin />
             } />
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}

export default AppRoutes