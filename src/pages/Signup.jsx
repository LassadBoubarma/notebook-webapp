// src/pages/Signup.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "../lib/supabase";
import { useLanguage } from '../contexts/LanguageContext';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      alert(t('check.email'));
      navigate('/login');
    }

    setLoading(false);
  };
// after a successful sign up or login
navigate('/username', { replace: true });
// The guard would also redirect, but this makes it instant and explicit.

  return (
    <div className="auth-container particles">
      <form
        onSubmit={handleSignup}
        className="auth-form auth-form-enter"
      >
        <h2 className="auth-title">{t('create.account')}</h2>

        {errorMsg && (
          <div className="auth-error">{errorMsg}</div>
        )}

        <div className="auth-input-group">
          <label className="auth-label">{t('email')}</label>
          <input
            type="email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="auth-input-group">
          <label className="auth-label">{t('password')}</label>
          <input
            type="password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="auth-button"
        >
          {loading ? t('creating') : t('create.account')}
        </button>
      </form>
    </div>
  );
}
