import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Commands from './pages/Commands'
import Register from './pages/Register'
import ChatModeration from './pages/Chat_Moderation'
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
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}

export default AppRoutes