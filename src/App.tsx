import { AppProvider, useAppStore } from './store'
import { AppLayout } from './components/layout/AppLayout'

// Lazy load screens to keep bundle clean, though since it's an MVP it's not strictly necessary.
// For now, standard imports are fine.
import { WelcomeScreen } from './screens/WelcomeScreen'
import { DashboardScreen } from './screens/DashboardScreen'
import { ViewerScreen } from './screens/ViewerScreen'
import { ExplorerScreen } from './screens/ExplorerScreen'
import { ReportScreen } from './screens/ReportScreen'
import { HistoryScreen } from './screens/HistoryScreen'
import { PresentationScreen } from './screens/PresentationScreen'
import { FeedbackScreen } from './screens/FeedbackScreen'

function ScreenRouter() {
  const { view } = useAppStore()

  switch (view) {
    case 'welcome': return <WelcomeScreen />
    case 'dashboard': return <DashboardScreen />
    case 'viewer': return <ViewerScreen />
    case 'explorer': return <ExplorerScreen />
    case 'report': return <ReportScreen />
    case 'history': return <HistoryScreen />
    case 'presentation': return <PresentationScreen />
    case 'feedback': return <FeedbackScreen />
    default: return <DashboardScreen />
  }
}

export default function App() {
  return (
    <AppProvider>
      <AppLayout>
        <ScreenRouter />
      </AppLayout>
    </AppProvider>
  )
}
