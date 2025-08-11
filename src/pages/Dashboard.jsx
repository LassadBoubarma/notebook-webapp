import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../contexts/LanguageContext'
import '../styles/dashboard.css'
import SiteLanguageSwitcher from '../components/SiteLanguageSwitcher'

function Card({ children, className = '' }) {
  return <div className={`dash-card ${className}`}>{children}</div>
}

export default function Dashboard() {
  const nav = useNavigate()
  const { t } = useLanguage()
  const [username, setUsername] = useState('')

  useEffect(() => {
    async function fetchUsername() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        nav('/login')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return
      }

      // If username doesn't exist, redirect to setup
      if (!data?.display_name) {
        nav('/username-setup')
        return
      }

      setUsername(data.display_name)
    }
    fetchUsername()
  }, [nav])

  async function logout() {
    await supabase.auth.signOut()
    nav('/login')
  }

  return (
    <div className="dash">
      {/* Barre du haut */}
      <header className="dash-header">
        <div className="dash-header-left">
          <span className="dash-logo">✦</span>
          <h1 className="dash-title">{t('dashboard.title')}</h1>
        </div>

        <nav className="dash-nav">
          <SiteLanguageSwitcher size="sm" />
          <Link className="btn btn-ghost" to="/notebook">
            📝 {t('dashboard.btn.notebook')}
          </Link>
          <Link className="btn btn-ghost" to="/basic">
            🧸 {t('dashboard.btn.basic')}
          </Link>
        </nav>

        <button className="btn btn-pink" onClick={logout}>
          🚪 {t('dashboard.btn.logout')}
        </button>
      </header>

      <main className="dash-main">
        {/* Bandeau kawaii */}
        <Card className="hero">
          <div className="hero-emoji">🐻‍❄️</div>
          <div className="hero-text">
            <h2 className="hero-title">
              {t('dashboard.welcome')} {username}
            </h2>
          </div>
          <div className="hero-actions">
            <Link to="/notebook" className="btn btn-primary">
              ⭐ {t('dashboard.btn.notebook')}
            </Link>
            <Link to="/basic" className="btn btn-yellow">
              🎨 {t('dashboard.btn.basic')}
            </Link>
          </div>
        </Card>

        {/* Statistiques */}
        <section className="grid-3">
          <Card>
            <div className="stat">
              <div className="stat-emoji">🌟</div>
              <div>
                <div className="stat-label">{t('dashboard.stats.lessons')}</div>
                <div className="stat-value">0</div>
              </div>
            </div>
          </Card>
          <Card>
            <div className="stat">
              <div className="stat-emoji">🔥</div>
              <div>
                <div className="stat-label">{t('dashboard.stats.streak')}</div>
                <div className="stat-value">0</div>
              </div>
            </div>
          </Card>
          <Card>
            <div className="stat">
              <div className="stat-emoji">💛</div>
              <div>
                <div className="stat-label">{t('dashboard.stats.score')}</div>
                <div className="stat-value">0</div>
              </div>
            </div>
          </Card>
        </section>

        {/* Deux colonnes : leçons / raccourcis */}
        <section className="grid-2-1">
          <Card>
            <h3 className="section-title">🎮 {t('dashboard.lessons.title')}</h3>

            <div className="lesson-grid">
              <div className="lesson">
                <div className="lesson-emoji">🗣️</div>
                <div className="lesson-title">{t('lesson.salutations.title')}</div>
                <p className="lesson-sub">{t('lesson.salutations.desc')}</p>
                <button className="btn btn-primary sm">{t('dashboard.lesson.start')}</button>
              </div>

              <div className="lesson lesson-locked">
                <div className="lesson-emoji">👤</div>
                <div className="lesson-title">{t('lesson.pronouns.title')}</div>
                <p className="lesson-sub">{t('lesson.pronouns.desc')}</p>
                <button className="btn btn-outline sm" disabled>
                  {t('dashboard.lesson.locked')}
                </button>
              </div>

              <div className="lesson lesson-locked">
                <div className="lesson-emoji">🔢</div>
                <div className="lesson-title">{t('lesson.numbers.title')}</div>
                <p className="lesson-sub">{t('lesson.numbers.desc')}</p>
                <button className="btn btn-outline sm" disabled>
                  {t('dashboard.lesson.locked')}
                </button>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="section-title">🧁 {t('dashboard.quickActions')}</h3>
            <div className="shortcut-list">
              <Link to="/notebook" className="shortcut">
                📝 {t('dashboard.btn.notebook')}
                <span className="shortcut-sub">{t('dashboard.short.notebook')}</span>
              </Link>
              <Link to="/basic" className="shortcut">
                🎨 {t('dashboard.btn.basic')}
                <span className="shortcut-sub">{t('dashboard.short.basic')}</span>
              </Link>
              <button onClick={logout} className="shortcut danger">
                🚪 {t('dashboard.btn.logout')}
                <span className="shortcut-sub">{t('dashboard.short.logout')}</span>
              </button>
            </div>
          </Card>
        </section>
      </main>
    </div>
  )
}
