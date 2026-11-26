import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Welcome   from './pages/Welcome'
import Login     from './pages/Login'
import Signup    from './pages/Signup'
import VerifyOtp from './pages/VerifyOtp'

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/"           element={<Welcome />} />
                <Route path="/login"      element={<Login />} />
                <Route path="/signup"     element={<Signup />} />
                <Route path="/verify-otp" element={<VerifyOtp />} />
                <Route path="*"           element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}
