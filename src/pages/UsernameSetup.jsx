import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

const UsernameSetup = () => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions] = useState([
    'PixelWarrior', 'CyberNinja', 'NeonRider', 'DigitalDragon', 'QuantumKnight',
    'RetroGamer', 'ByteMaster', 'GlitchHunter', 'CodeBreaker', 'VirtualViper',
    'MatrixRunner', 'DataDuelist', 'CyberPunk', 'NeonLegend', 'PixelPhoenix',
    'DigitalDemon', 'QuantumQueen', 'RetroRebel', 'ByteBrawler', 'GlitchGoddess'
  ]);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Vérifier si l'utilisateur a déjà un pseudo
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Erreur lors de la vérification du profil:', profileError);
      }

      if (profile?.username) {
        navigate('/dashboard', { replace: true });
        return;
      }
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError(t('username.required'));
      return;
    }

    if (username.length < 3) {
      setError(t('username.tooShort'));
      return;
    }

    if (username.length > 20) {
      setError(t('username.tooLong'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      console.log('Utilisateur connecté:', user.id);

      // Vérifier si le pseudo est déjà pris
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .neq('id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Erreur lors de la vérification du pseudo:', checkError);
      }

      if (existingUser) {
        setError(t('username.taken'));
        setIsLoading(false);
        return;
      }

      console.log('Pseudo disponible, création du profil...');

      // Créer ou mettre à jour le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: username.toLowerCase(),
          display_name: username,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Erreur lors de la création du profil:', profileError);
        throw profileError;
      }

      console.log('Profil créé avec succès');

      // Mettre à jour les métadonnées utilisateur
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          display_name: username,
          username: username.toLowerCase()
        }
      });

      if (updateError) {
        console.error('Erreur lors de la mise à jour des métadonnées:', updateError);
      } else {
        console.log('Métadonnées mises à jour');
      }

      console.log('Pseudo créé avec succès:', username);
      
      // Rediriger vers le dashboard
      navigate('/dashboard', { replace: true });
      
    } catch (error) {
      console.error('Erreur lors de la création du pseudo:', error);
      
      if (error.message.includes('duplicate key')) {
        setError(t('username.taken'));
      } else if (error.message.includes('permission denied')) {
        setError('Erreur de permissions. Veuillez réessayer.');
      } else if (error.message.includes('network')) {
        setError('Erreur de connexion. Vérifiez votre internet.');
      } else {
        setError(`Erreur: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectSuggestion = (suggestion) => {
    setUsername(suggestion);
    setError('');
  };

  const generateRandomUsername = () => {
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    setUsername(randomSuggestion);
    setError('');
  };

  return (
    <div className="auth-container particles">
      <div className="auth-form">
        <h1 className="auth-title pixel-glow">
          {t('username.title')}
        </h1>
        
        <p className="text-green-300 text-center mb-8 font-mono">
          {t('username.subtitle')}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <label className="auth-label">
              {t('username.label')}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="auth-input"
              placeholder={t('username.placeholder')}
              maxLength={20}
              disabled={isLoading}
            />
            {error && (
              <div className="auth-error-message">
                {error}
              </div>
            )}
          </div>

          <div className="mb-6">
            <button
              type="button"
              onClick={generateRandomUsername}
              className="w-full text-black p-3 rounded-none transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 text-sm mb-4"
              style={{
                background: 'linear-gradient(135deg, #11998e 0%, #2d1b69 100%)',
                border: '4px solid #11998e',
                boxShadow: '0 0 0 2px rgba(17, 153, 142, 0.3), 0 4px 8px rgba(0, 0, 0, 0.3)',
                fontFamily: '"Press Start 2P", "Courier New", monospace'
              }}
            >
              {t('username.generate')}
            </button>

            <div className="mb-4">
              <h3 className="text-green-400 text-sm font-bold mb-3 font-mono">
                {t('username.suggestions')}:
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {suggestions.slice(0, 8).map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectSuggestion(suggestion)}
                    className="text-xs p-2 rounded-none transition-all duration-300 font-bold border-2 border-green-400/50 hover:border-green-400 hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(17, 153, 142, 0.1) 100%)',
                      color: '#00ff88',
                      fontFamily: '"Courier New", monospace',
                      textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8)'
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="auth-button"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="loading-spinner loading-spinner-sm mr-2"></div>
                {t('username.creating')}
              </span>
            ) : (
              t('username.continue')
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="text-green-300 text-xs font-mono">
            {t('username.rules')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UsernameSetup; 