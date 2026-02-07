import { useState, useEffect } from 'react'
import App from './App'
import Management from './Management'

function Router() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  if (currentPath === '/management') {
    return <Management />
  }

  return <App />
}

export default Router
