import { useState } from 'react'
import Welcome from './pages/Welcome'
import Dashboard from './pages/Dashboard'
import WheatField from './components/WheatField'

function App() {
  const [showWelcome, setShowWelcome] = useState(true)

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-wheat-500 selection:text-white">
      <WheatField />
      {showWelcome ? (
        <Welcome onEnter={() => setShowWelcome(false)} />
      ) : (
        <Dashboard />
      )}
    </div>
  )
}

export default App
