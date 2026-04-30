import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import HomePage from './pages/HomePage'
import ProtocolBrowser from './pages/ProtocolBrowser'
import ProtocolDetail from './pages/ProtocolDetail'
import DrugSearch from './pages/DrugSearch'
import DrugDetail from './pages/DrugDetail'
import DoseCalculator from './pages/DoseCalculator'
import DrugClasses from './pages/DrugClasses'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/protocols" element={<ProtocolBrowser />} />
            <Route path="/protocols/:id" element={<ProtocolDetail />} />
            <Route path="/drugs" element={<DrugSearch />} />
            <Route path="/drugs/:name" element={<DrugDetail />} />
            <Route path="/dose" element={<DoseCalculator />} />
            <Route path="/classes" element={<DrugClasses />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
