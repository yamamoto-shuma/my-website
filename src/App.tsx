import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AwsQuiz from './pages/AwsQuiz'
import VcQuiz from './pages/VcQuiz'
import GarminLogin from './pages/garmin/GarminLogin'
import GarminCalendar from './pages/garmin/GarminCalendar'
import GarminDate from './pages/garmin/GarminDate'
import GarminProfile from './pages/garmin/GarminProfile'
import ProtectedRoute from './components/garmin/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/aws-quiz" element={<AwsQuiz />} />
        <Route path="/vc-quiz" element={<VcQuiz />} />
        <Route path="/garmin/login" element={<GarminLogin />} />
        <Route
          path="/garmin"
          element={
            <ProtectedRoute>
              <GarminCalendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/garmin/profile"
          element={
            <ProtectedRoute>
              <GarminProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/garmin/:date"
          element={
            <ProtectedRoute>
              <GarminDate />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
