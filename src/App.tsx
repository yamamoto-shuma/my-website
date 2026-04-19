import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AwsQuiz from './pages/AwsQuiz'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/aws-quiz" element={<AwsQuiz />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
