import { QueryClientProvider } from '@tanstack/react-query';
import { Switch, Route } from 'wouter';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import FilesPage from './pages/FilesPage';
import ChartsPage from './pages/ChartsPage';
import ChartCreate from './pages/ChartCreate';
import ChartView from './pages/ChartView';
import AdminPage from './pages/AdminPage';
import './index.css';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Router />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route>
        <AppLayout />
      </Route>
    </Switch>
  );
}

function AppLayout() {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Switch>
          <ProtectedRoute path="/" component={Dashboard} />
          <ProtectedRoute path="/upload" component={UploadPage} />
          <ProtectedRoute path="/files" component={FilesPage} />
          <ProtectedRoute path="/files/:id" component={FileDetailPage} />
          <ProtectedRoute path="/charts" component={ChartsPage} />
          <ProtectedRoute path="/charts/create" component={ChartCreate} />
          <ProtectedRoute path="/charts/:id" component={ChartView} />
          <AdminRoute path="/admin" component={AdminPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </>
  );
}

function FileDetailPage({ params }) {
  return <div>File Detail: {params.id}</div>;
}

function NotFound() {
  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
      <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
      <a href="/" className="text-blue-600 hover:underline">
        Go back to Dashboard
      </a>
    </div>
  );
}

export default App;