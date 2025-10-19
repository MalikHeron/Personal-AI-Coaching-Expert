import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import SignUp from '@/pages/Signup';
import Workout from '@/pages/Workout';
import Home from './Home';
import { UserProvider } from '@/contexts/UserContext';

/**
 * Main application router component.
 *
 * Handles route definitions for both public and private pages using React Router.
 * - Clears session storage and redirects to home if `clearSession=true` is present in the URL.
 * - Provides a `PublicLayout` for public routes, including navigation bar, theme toggle, and login/signup buttons.
 * - Wraps private routes with `UserProvider` for user context.
 *
 * @returns {JSX.Element} The router configuration for the application.
*/
const Router = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('clearSession') === 'true') {
      sessionStorage.clear();
      window.location.replace('/');
    }
  }, []);

  const Layout = ({ children, overlay = false }: { children: React.ReactNode, overlay?: boolean }) => {
    return (
      <div className='flex flex-col h-screen'>
        {overlay ? (
          <div className="-mt-16 pt-16 w-full">
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    );
  };

  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Layout overlay={true}><Landing /></Layout>} />
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/signup" element={<Layout><SignUp /></Layout>} />
          <Route path="/demo" element={<Layout><Workout workouts={[]} /></Layout>} />

          {/* Private routes */}
          <Route path="/home/*" element={<Layout><Home /></Layout>} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
};

export default Router;