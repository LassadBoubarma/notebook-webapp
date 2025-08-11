// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './app/AuthProvider';
import { LanguageProvider } from './contexts/LanguageContext';
import { supabase } from './lib/supabase';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Notebook from './pages/notebook';
import BasicNote from './pages/basicNote';
import UsernameSetup from './pages/UsernameSetup';

/** Gate 1: must be authenticated */
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="center">Loading…</div>;
  return user ? <RequireUsername>{children}</RequireUsername> : <Navigate to="/login" replace />;
}

/** Gate 2: must have a username row in `profiles` */
function RequireUsername({ children }) {
  const { user } = useAuth();
  const [state, setState] = React.useState({ checking: true, needs: false });

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // 1) Read profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;

        // 2) If no row, create one (so /username-setup can save into it)
        if (!profile) {
          await supabase.from('profiles').insert({ id: user.id });
          if (!cancelled) setState({ checking: false, needs: true });
          return;
        }

        // 3) If no username, send user to setup
        if (!profile.username) {
          if (!cancelled) setState({ checking: false, needs: true });
          return;
        }

        // 4) OK, let them in
        if (!cancelled) setState({ checking: false, needs: false });
      } catch {
        // If anything goes wrong, force setup to be safe
        if (!cancelled) setState({ checking: false, needs: true });
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  if (state.checking) return <div className="center">Loading…</div>;
  if (state.needs) return <Navigate to="/username-setup" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/username-setup" element={<UsernameSetup />} />

          {/* Private (auth + username required) */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/notebook" element={<PrivateRoute><Notebook /></PrivateRoute>} />
          <Route path="/basic" element={<PrivateRoute><BasicNote /></PrivateRoute>} />
        </Routes>
      </LanguageProvider>
    </AuthProvider>
  );
}
