import { Navigate, Route, Routes } from 'react-router-dom'
import { NavBar } from './components/NavBar'
import { Browse } from './pages/Browse'
import { Detail } from './pages/Detail'
import { Discover } from './pages/Discover'
import { Genres } from './pages/Genres'
import { MediaLab } from './pages/MediaLab'

function App() {
  return (
    <div className="min-h-screen bg-[#0b0b10]">
      <NavBar />
      <Routes>
        <Route path="/" element={<Discover />} />
        <Route path="/browse/:kind" element={<Browse />} />
        <Route path="/genres" element={<Genres />} />
        <Route path="/:kind/:id" element={<Detail />} />
        <Route path="/media-lab" element={<MediaLab />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
