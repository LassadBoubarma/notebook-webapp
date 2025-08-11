import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/notebook.css'
import { useLanguage } from '../contexts/LanguageContext'
import {
  listNotes, createNote, deleteNote, updateNote,
  listPlaylists, createPlaylist, addNoteToPlaylist, removeNoteFromPlaylist,
  getPlaylistNotes, uploadImage, uploadMedia, deletePlaylist,
  listPlaylistMemberships,
} from '../lib/notebookApi'

const STUDY_LANG_KEY = 'study.language'

/* ---------- Note body (text / @audio(url) / @video(url)) ---------- */
function NoteBody({ content }) {
  const blocks = useMemo(() => {
    return (content || '').split(/\n+/).map((line, i) => {
      const a = line.match(/^@audio\((.+)\)$/i)
      const v = line.match(/^@video\((.+)\)$/i)
      if (a) return { t: 'audio', url: a[1], key: i }
      if (v) return { t: 'video', url: v[1], key: i }
      return { t: 'text', txt: line, key: i }
    })
  }, [content])

  return (
    <div className="space-y-2">
      {blocks.map(b =>
        b.t === 'text' ? (
          <p key={b.key} className="text-yellow-50/90 text-[12px] leading-5 whitespace-pre-wrap">{b.txt}</p>
        ) : b.t === 'audio' ? (
          <audio key={b.key} controls className="w-full rounded-xl">
            <source src={b.url} />
          </audio>
        ) : (
          <video key={b.key} controls className="w-full rounded-xl max-h-64">
            <source src={b.url} />
          </video>
        )
      )}
    </div>
  )
}

/* ---------- Quiz overlay ---------- */
function QuizOverlay({ items, onClose }) {
  const [i, setI] = useState(0)
  const [show, setShow] = useState(false)

  if (!items?.length) {
    return (
      <div className="nb-overlay">
        <div className="nb-modal">
          <div className="flex items-start justify-between mb-3">
            <h3 className="nb-title-sm">Quiz</h3>
            <button className="nb-btn nb-btn-ghost nb-btn-xs" onClick={onClose}>Close</button>
          </div>
          <p className="text-yellow-200/80 text-sm">No items in this playlist.</p>
        </div>
      </div>
    )
  }

  const curr = items[i]
  const next = () => { setShow(false); setI((i + 1) % items.length) }
  const prev = () => { setShow(false); setI((i - 1 + items.length) % items.length) }

  return (
    <div className="nb-overlay">
      <div className="nb-modal">
        <div className="flex items-start justify-between mb-3">
          <h3 className="nb-title-sm">Quiz</h3>
          <button className="nb-btn nb-btn-ghost nb-btn-xs" onClick={onClose}>Close</button>
        </div>

        <div className="space-y-3">
          <div className="nb-note-title">{curr.title}</div>

          {!show ? (
            <button className="nb-btn nb-btn-primary nb-btn-xs" onClick={() => setShow(true)}>
              Show answer
            </button>
          ) : (
            <div className="nb-card">
              <NoteBody content={curr.content} />
            </div>
          )}

          <div className="flex items-center gap-2">
            <button className="nb-btn nb-btn-xs" onClick={prev}>◀ Prev</button>
            <button className="nb-btn nb-btn-xs" onClick={next}>Next ▶</button>
            <span className="text-yellow-200/70 text-[11px] ml-2">
              {i + 1} / {items.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Playlist picker (toggle + ✓) ---------- */
function NotePlaylistPicker({ noteId, playlists, memberships, onToggle, labelAdd }) {
  const [open, setOpen] = useState(false)
  const member = memberships.get(noteId) || new Set()
  const first = member.size ? playlists.find(p => member.has(p.id)) : null
  const label = first ? first.name : labelAdd

  return (
    <div className="relative inline-block">
      <button className="nb-btn nb-btn-xs" onClick={() => setOpen(o => !o)}>
        {label} ▾
      </button>

      {open && (
        <div className="nb-menu" onMouseLeave={() => setOpen(false)}>
          {playlists.map(pl => {
            const on = member.has(pl.id)
            return (
              <button
                key={pl.id}
                className="nb-menu-item"
                onClick={async () => { await onToggle(pl.id, noteId, on) }}
              >
                {on ? '✓ ' : ''}{pl.name}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ===================== MAIN ===================== */
export default function Notebook() {
  const { t } = useLanguage()

  // Study language (persisted)
  const [studyLang, setStudyLang] = useState(() => localStorage.getItem(STUDY_LANG_KEY) || 'pt-BR')

  // Data
  const [notes, setNotes] = useState([])
  const [displayNotes, setDisplayNotes] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [links, setLinks] = useState(new Map()) // noteId -> Set(playlistId)

  // Create
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  // Playlists
  const [newPl, setNewPl] = useState('')
  const [selectedPl, setSelectedPl] = useState('')

  // Quiz
  const [quizItems, setQuizItems] = useState(null)

  // Edit
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    localStorage.setItem(STUDY_LANG_KEY, studyLang)
  }, [studyLang])

  useEffect(() => { refresh('') }, [studyLang])

  async function refresh(basePl = selectedPl) {
    const [n, p] = await Promise.all([listNotes(studyLang), listPlaylists(studyLang)])
    const allNotes = n.data || []
    const pls = p.data || []
    setNotes(allNotes)
    setPlaylists(pls)

    // memberships
    const { data: lrows } = await listPlaylistMemberships(studyLang)
    const map = new Map()
    ;(lrows || []).forEach(r => {
      const s = map.get(r.note_id) || new Set()
      s.add(r.playlist_id)
      map.set(r.note_id, s)
    })
    setLinks(map)

    if (basePl && !pls.some(pl => pl.id === basePl)) {
      basePl = ''
      setSelectedPl('')
    }
    await applyFilter(basePl, allNotes)
  }

  async function applyFilter(plId, all = notes) {
    if (!plId) { setDisplayNotes(all); return }
    const { data } = await getPlaylistNotes(plId)
    const ids = new Set((data || []).map(n => n.id))
    setDisplayNotes((all || []).filter(n => ids.has(n.id)))
  }

  function onChangePlaylistFilter(e) {
    const plId = e.target.value
    setSelectedPl(plId)
    applyFilter(plId)
  }

  async function addNote() {
    if (!title.trim() || !content.trim()) return
    const { data: note } = await createNote({ title, content, lang: studyLang })
    setTitle(''); setContent('')
    if (selectedPl && note?.id) await addNoteToPlaylist(selectedPl, note.id)
    await refresh(selectedPl || '')
  }

  // uploads (create)
  async function attachAudio(file) {
    const { signedUrl } = await uploadMedia(file, 'audio')
    setContent(prev => `${prev}\n@audio(${signedUrl})`)
  }
  async function attachVideo(file) {
    const { signedUrl } = await uploadMedia(file, 'video')
    setContent(prev => `${prev}\n@video(${signedUrl})`)
  }
  async function attachImage(file) {
    const { signedUrl } = await uploadImage(file, 'notes')
    setContent(prev => `${prev}\n![img](${signedUrl})`)
  }

  // edit
  function beginEdit(note) {
    setEditingId(note.id)
    setEditTitle(note.title)
    setEditContent(note.content)
  }
  function cancelEdit() {
    setEditingId(null)
    setEditTitle('')
    setEditContent('')
  }
  async function saveEdit() {
    if (!editingId) return
    await updateNote(editingId, { title: editTitle, content: editContent })
    cancelEdit()
    await refresh(selectedPl || '')
  }

  // uploads (edit)
  async function attachAudioEdit(file) {
    const { signedUrl } = await uploadMedia(file, 'audio')
    setEditContent(prev => `${prev}\n@audio(${signedUrl})`)
  }
  async function attachVideoEdit(file) {
    const { signedUrl } = await uploadMedia(file, 'video')
    setEditContent(prev => `${prev}\n@video(${signedUrl})`)
  }
  async function attachImageEdit(file) {
    const { signedUrl } = await uploadImage(file, 'notes')
    setEditContent(prev => `${prev}\n![img](${signedUrl})`)
  }

  // membership toggle
  async function toggleMembership(plId, noteId, currentlyOn) {
    if (currentlyOn) await removeNoteFromPlaylist(plId, noteId)
    else await addNoteToPlaylist(plId, noteId)

    setLinks(prev => {
      const next = new Map(prev)
      const s = new Set(next.get(noteId) || [])
      if (currentlyOn) s.delete(plId)
      else s.add(plId)
      next.set(noteId, s)
      return next
    })
  }

  // playlists CRUD
  async function mkPlaylist() {
    if (!newPl.trim()) return
    const { data } = await createPlaylist({ name: newPl, lang: studyLang })
    setNewPl(''); setSelectedPl(data.id)
    await refresh(data.id)
  }
  async function killPlaylist(id) { await deletePlaylist(id); await refresh('') }

  // quiz
  async function startQuiz(playlist_id) {
    try {
      let items = []
      const { data, error } = await getPlaylistNotes(playlist_id)

      if (!error && Array.isArray(data) && data.length) {
        if (data[0]?.title && data[0]?.content) {
          items = data.map(r => ({ title: r.title, content: r.content }))
        } else {
          const idSet = new Set(data.map(x => x.id))
          items = notes.filter(n => idSet.has(n.id)).map(n => ({ title: n.title, content: n.content }))
        }
      } else {
        items = displayNotes.map(n => ({ title: n.title, content: n.content }))
      }

      setQuizItems(items)
    } catch (e) {
      console.error('quiz error', e)
      setQuizItems(displayNotes.map(n => ({ title: n.title, content: n.content })))
    }
  }

  return (
    <div className="nb">
      {/* HEADER */}
      <header className="nb-bar flex flex-wrap items-center gap-2 md:gap-3">
        {/* Left */}
        <div className="flex items-center gap-2 order-1 w-auto">
          <Link className="nb-btn nb-btn-ghost nb-btn-xs" to="/dashboard">
            {t('notebook.navHome')}
          </Link>
          <Link className="nb-btn nb-btn-ghost nb-btn-xs" to="/basic">
            {t('notebook.navBasic')}
          </Link>
        </div>

        {/* Center */}
        <div className="flex items-center gap-2 order-2 w-full justify-center sm:order-2">
          <div className="nb-logo">✦</div>
          <h1 className="nb-title">{t('notebook.title')}</h1>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 order-3 w-full sm:w-auto sm:ml-auto justify-end">
          <label className="sr-only">{t('notebook.studyLanguage')}</label>
          <select
            className="nb-select w-full sm:w-auto"
            value={studyLang}
            onChange={e => { setSelectedPl(''); setStudyLang(e.target.value) }}
            title={t('notebook.studyLanguage')}
          >
            <option value="pt-BR">Português</option>
            <option value="zh-CN">Mandarin</option>
          </select>

          <label className="sr-only">{t('notebook.filterPlaylist')}</label>
          <select
            className="nb-select w-full sm:w-auto"
            value={selectedPl}
            onChange={onChangePlaylistFilter}
            title={t('notebook.filterPlaylist')}
          >
            <option value="">{t('notebook.allNotes')}</option>
            {playlists.map(pl => (
              <option key={pl.id} value={pl.id}>{pl.name}</option>
            ))}
          </select>
        </div>
      </header>

      {/* GRID (Mobile: editor+playlists on top; Desktop: notes left, editor right) */}
      <div className="nb-wrap grid gap-4 pb-8 lg:grid-cols-[1.1fr_0.9fr] max-w-full">

        {/* ===== EDITOR + PLAYLISTS (order-1 on mobile) ===== */}
        <div className="grid gap-4 order-1 lg:order-2">
          {/* Editor */}
          <section className="nb-card space-y-3">
            <h2 className="nb-title-sm">{t('notebook.addNote')}</h2>

            <input
              className="nb-input"
              placeholder={t('notebook.noteTitle')}
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <textarea
              className="nb-textarea"
              placeholder={t('notebook.noteContent')}
              value={content}
              onChange={e => setContent(e.target.value)}
            />

            <div className="flex flex-wrap items-center gap-2">
              <label className="nb-btn nb-btn-file nb-btn-xs">
                + {t('notebook.voice')}
                <input type="file" accept="audio/*"
                  onChange={e => e.target.files[0] && attachAudio(e.target.files[0])} />
              </label>
              <label className="nb-btn nb-btn-file nb-btn-xs">
                + {t('notebook.video')}
                <input type="file" accept="video/*"
                  onChange={e => e.target.files[0] && attachVideo(e.target.files[0])} />
              </label>
              <label className="nb-btn nb-btn-file nb-btn-xs">
                + {t('notebook.image')}
                <input type="file" accept="image/*"
                  onChange={e => e.target.files[0] && attachImage(e.target.files[0])} />
              </label>

              <div className="grow" />
              <button className="nb-btn nb-btn-primary" onClick={addNote}>
                {t('notebook.add')}
              </button>
            </div>
          </section>

          {/* Playlists */}
          <section className="nb-card">
            <div className="nb-section-head">
              <h2 className="nb-title-sm">{t('notebook.playlists')}</h2>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <input
                className="nb-input nb-input-sm"
                placeholder={t('notebook.newPlaylist')}
                value={newPl}
                onChange={e => setNewPl(e.target.value)}
              />
              <button className="nb-btn" onClick={mkPlaylist}>{t('notebook.create')}</button>
            </div>

            <ul className="space-y-3">
              {playlists.map(pl => (
                <li key={pl.id} className="nb-item">
                  <div className="nb-note-title">{pl.name}</div>
                  <div className="flex items-center gap-2">
                    <button className="nb-btn nb-btn-xs" onClick={() => startQuiz(pl.id)}>
                      {t('notebook.quiz')}
                    </button>
                    <button
                      className={`nb-btn nb-btn-xs ${selectedPl === pl.id ? 'ring-2 ring-yellow-400/70' : ''}`}
                      onClick={() => { setSelectedPl(pl.id); applyFilter(pl.id) }}
                      title={t('notebook.default')}
                    >
                      {t('notebook.default')}
                    </button>
                    <button className="nb-btn nb-btn-danger nb-btn-xs" onClick={() => killPlaylist(pl.id)}>
                      {t('notebook.delete')}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* ===== NOTES (order-2 on mobile) ===== */}
        <section className="nb-card order-2 lg:order-1">
          <div className="nb-section-head">
            <h2 className="nb-title-sm">
              {selectedPl ? t('notebook.myNotes') : `${t('notebook.myNotes')} — ${studyLang}`}
            </h2>
          </div>

          <ul className="space-y-3">
            {displayNotes.map(n => (
              <li key={n.id} className="nb-item">
                {editingId === n.id ? (
                  <div className="w-full">
                    <input
                      className="nb-input nb-input-sm mb-2"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      placeholder={t('notebook.noteTitle')}
                    />

                    <textarea
                      className="nb-textarea min-h-[160px]"
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      placeholder={t('notebook.noteContent')}
                    />

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <label className="nb-btn nb-btn-file nb-btn-xs">
                        🎙️ {t('notebook.voice')}
                        <input type="file" accept="audio/*"
                          onChange={e => e.target.files[0] && attachAudioEdit(e.target.files[0])} />
                      </label>
                      <label className="nb-btn nb-btn-file nb-btn-xs">
                        🎞️ {t('notebook.video')}
                        <input type="file" accept="video/*"
                          onChange={e => e.target.files[0] && attachVideoEdit(e.target.files[0])} />
                      </label>
                      <label className="nb-btn nb-btn-file nb-btn-xs">
                        🖼️ {t('notebook.image')}
                        <input type="file" accept="image/*"
                          onChange={e => e.target.files[0] && attachImageEdit(e.target.files[0])} />
                      </label>
                      <span className="text-[11px] text-yellow-200/70 ml-1">
                        {t('hint.attachInEdit') || 'Uploaded media is inserted in the text. Click Save to keep it.'}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <button className="nb-btn nb-btn-primary nb-btn-xs" onClick={saveEdit}>
                        {t('save')}
                      </button>
                      <button className="nb-btn nb-btn-ghost nb-btn-xs" onClick={cancelEdit}>
                        {t('cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="min-w-0 w-full">
                      <div className="nb-note-title">{n.title}</div>
                      <NoteBody content={n.content} />
                    </div>

                    <div className="flex items-center gap-2 pl-2 shrink-0">
                      <button
                        className="nb-btn nb-btn-xs"
                        title={t('edit')}
                        onClick={() => beginEdit(n)}
                      >
                        ✎ {t('edit')}
                      </button>

                      <NotePlaylistPicker
                        noteId={n.id}
                        playlists={playlists}
                        memberships={links}
                        onToggle={toggleMembership}
                        labelAdd={t('notebook.addTo')}
                      />

                      <button
                        className="nb-btn nb-btn-danger nb-btn-xs"
                        onClick={() => deleteNote(n.id).then(() => refresh(selectedPl))}
                      >
                        {t('notebook.delete')}
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}

            {!displayNotes.length && (
              <li className="text-yellow-200/80 text-sm">
                {t('notebook.noNotes')}{selectedPl ? ' (playlist)' : ''}.
              </li>
            )}
          </ul>
        </section>
      </div>

      {quizItems && <QuizOverlay items={quizItems} onClose={() => setQuizItems(null)} />}
    </div>
  )
}
