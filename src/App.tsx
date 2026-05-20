import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AwsQuiz from './pages/AwsQuiz'
import VcQuiz from './pages/VcQuiz'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/aws-quiz" element={<AwsQuiz />} />
        <Route path="/vc-quiz" element={<VcQuiz />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
