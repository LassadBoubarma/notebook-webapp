import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleResendConfirmation = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    if (error) {
      setErrorMsg('Erreur lors de l\'envoi de l\'email de confirmation: ' + error.message);
    } else {
      setErrorMsg(t('confirmation.sent'));
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Gestion spécifique pour l'erreur de confirmation email
      if (error.message.includes('Email not confirmed')) {
        setErrorMsg(t('email.not.confirmed'));
      } else {
        setErrorMsg(error.message);
      }
    } else {
      navigate('/dashboard'); // Redirect after successful login
    }

    setLoading(false);
  };

  return (
    <div className="auth-container particles">
      <form onSubmit={handleLogin} className="auth-form-login auth-form-enter">
        <h2 className="auth-title-login">{t('login')}</h2>

                {errorMsg && (
          <div className="auth-error-message">
            <p className="mb-2">{errorMsg}</p>
            {errorMsg.includes('Email not confirmed') && (
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={loading}
                className="auth-resend-button"
              >
                {t('resend.confirmation')}
              </button>
            )}
          </div>
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
          {loading ? t('logging.in') : t('login')}
        </button>

        <p className="auth-footer">
          {t('dont.have.account')}{' '}
          <span
            onClick={() => navigate('/signup')}
            className="auth-link"
          >
            {t('signup')}
          </span>
        </p>
      </form>
    </div>
  );
}
