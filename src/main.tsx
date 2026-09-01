import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ThemeProvider } from './hooks/useTheme'
import { useAndroidBackButton } from './hooks/useAndroidBackButton'
import './index.css'

const queryClient = new QueryClient()
const router = createRouter({ routeTree })

function App() {
  useAndroidBackButton(router as unknown as Parameters<typeof useAndroidBackButton>[0])
  const [toast, setToast] = React.useState<string | null>(null)

  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as string
      setToast(detail)
      setTimeout(() => setToast(null), 2000)
    }
    window.addEventListener('android:toast' as unknown as string, handler as EventListener)
    return () => window.removeEventListener('android:toast' as unknown as string, handler as EventListener)
  }, [])

  return (
    <>
      <RouterProvider router={router} />
      {toast && (
        <div className="fixed bottom-20 left-1/2 z-[100] -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background shadow-lg">
          {toast}
        </div>
      )}
    </>
  )
}

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>,
)