import { useState, useEffect } from 'react'
import App from './App'
import Management from './Management'

type Route = "player" | "manager" | "admin";

function getRouteFromHash(): Route {
  const h = (window.location.hash || "#/").toLowerCase();
  if (h.startsWith("#/manager")) return "manager";
  if (h.startsWith("#/admin")) return "admin";
  return "player";
}

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
