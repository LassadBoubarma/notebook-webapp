// BasicNote.jsx (minimal sync change for study language)

import React, { useEffect, useState } from 'react'
import { fetchBasic, saveBasic } from '../lib/notebookApi'
import { useLanguage } from '../contexts/LanguageContext'
import '../styles/basicNote.css'

const STUDY_LANG_KEY = 'study.language'
const mapUiToDb = (c) => (c === 'pt' ? 'pt-BR' : c)

export default function BasicNote() {
  const { currentLanguage, t } = useLanguage()

  // 1) Initialize from localStorage; fallback to a sensible mapping from UI lang
  const [lang, setLang] = useState(() => {
    return localStorage.getItem(STUDY_LANG_KEY) || mapUiToDb(currentLanguage || 'en')
  })

  const [docId, setDocId] = useState(null)
  const [plain, setPlain] = useState('')
  const [saving, setSaving] = useState(false)

  // 2) Persist language whenever it changes
  useEffect(() => {
    localStorage.setItem(STUDY_LANG_KEY, lang)
  }, [lang])

  // 3) Load the correct row from Supabase for this language
  useEffect(() => {
    (async () => {
      const { data } = await fetchBasic(lang) // uses user_id + language_code under RLS
      setDocId(data?.id || null)
      setPlain(data?.plain || '')
    })()
  }, [lang])

  // 4) Debounced auto-save of plain text
  useEffect(() => {
    if (!docId) return
    const tmr = setTimeout(async () => {
      setSaving(true)
      await saveBasic(docId, { doc: { type: 'doc', text: plain }, plain })
      setSaving(false)
    }, 600)
    return () => clearTimeout(tmr)
  }, [docId, plain])

  return (
    <div className="bn">
      <header className="bn-bar">
        <button className="bn-btn" onClick={()=>history.back()}>← {t('notebook.navHome') || 'Home'}</button>
        <h1 className="bn-title">{t('basicNote.title') || 'Notebook'}</h1>

        {/* Optional: allow changing study language from here too */}
        <select
          className="bn-select"
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          title={t('notebook.studyLanguage') || 'Study language'}
        >
          <option value="pt-BR">Português</option>
          <option value="zh-CN">Mandarin</option>
        </select>

        <span className="bn-saving">{saving ? 'saving…' : 'saved'}</span>
      </header>

      <main className="bn-wrap">
        <textarea
          className="bn-textarea"
          placeholder={t('basicNote.placeholder') || 'Write your notes here…'}
          value={plain}
          onChange={(e) => setPlain(e.target.value)}
        />
        <div className="bn-meta">{plain.length} chars</div>
      </main>
    </div>
  )
}
