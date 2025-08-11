import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getUserAndProfile } from '../lib/profile'; // or inline the query here

export default function RequireUsername() {
  const [state, setState] = React.useState({ loading: true, needs: false, authed: false });

  React.useEffect(() => {
    (async () => {
      try {
        const { user, profile } = await getUserAndProfile();
        if (!user) return setState({ loading: false, needs: false, authed: false });
        const needs = !profile?.username; // force setup if no username
        setState({ loading: false, needs, authed: true });
      } catch {
        setState({ loading: false, needs: false, authed: false });
      }
    })();
  }, []);

  if (state.loading) {
    return (
      <div className="min-h-screen grid place-items-center text-yellow-200">
        Loading…
      </div>
    );
  }

  if (!state.authed) return <Navigate to="/login" replace />;
  if (state.needs)   return <Navigate to="/username" replace />;

  return <Outlet />;
}
