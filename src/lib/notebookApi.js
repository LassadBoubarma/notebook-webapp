// src/lib/notebookApi.js
import { supabase } from './supabase'

/* -------------------- UTIL -------------------- */
// Récupère l'ID utilisateur (throw si non connecté)
async function currentUserId() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Not authenticated')
  return user.id
}

/* -------------------- PROFILE -------------------- */
export async function ensureProfile() {
  const uid = await currentUserId()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('id', uid)
    .maybeSingle()

  if (error) throw error
  if (!data) {
    const { error: e2 } = await supabase.from('profiles').insert({ id: uid })
    if (e2) throw e2
    return { id: uid, needsUsername: true }
  }
  return { id: uid, needsUsername: !data?.username }
}

export async function getProfile() {
  const uid = await currentUserId()
  return await supabase.from('profiles').select('*').eq('id', uid).single()
}

export async function setUsername(username) {
  const uid = await currentUserId()
  return await supabase.from('profiles').update({ username }).eq('id', uid)
}

/* -------------------- NOTES -------------------- */
export async function listNotes(lang) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('language_code', lang)
    .order('created_at', { ascending: false })
  return { data: data || [], error }
}

export async function createNote({ title, content, lang, image_urls = [] }) {
  const uid = await currentUserId()
  const { data, error } = await supabase
    .from('notes')
    .insert([{ user_id: uid, title, content, language_code: lang, image_urls }])
    .select('*')
    .single()
  return { data, error }
}

export async function updateNote(id, patch) {
  return await supabase.from('notes').update({ ...patch }).eq('id', id)
}

export async function deleteNote(id) {
  return await supabase.from('notes').delete().eq('id', id)
}

/* -------------------- PLAYLISTS -------------------- */
export async function listPlaylists(lang) {
  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('language_code', lang)
    .order('created_at', { ascending: true })
  return { data: data || [], error }
}

export async function createPlaylist({ name, lang }) {
  const uid = await currentUserId()
  const { data, error } = await supabase
    .from('playlists')
    .insert([{ user_id: uid, name, language_code: lang }])
    .select('*')
    .single()
  return { data, error }
}

export async function deletePlaylist(id) {
  return await supabase.from('playlists').delete().eq('id', id)
}

export async function addNoteToPlaylist(playlist_id, note_id, idx = 0) {
  return await supabase.from('playlist_notes').insert([{ playlist_id, note_id, idx }])
}

export async function removeNoteFromPlaylist(playlist_id, note_id) {
  return await supabase.from('playlist_notes').delete().match({ playlist_id, note_id })
}

export async function getPlaylistNotes(playlist_id) {
  // utilise la fonction SQL pour l’ordre stable
  return await supabase.rpc('get_playlist_notes', { _playlist: playlist_id })
}

/* -------------------- BASIC NOTEBOOK (auto-save) -------------------- */
// 1 document par (user_id, language_code). Créé si absent.
export async function fetchBasic(lang) {
  const uid = await currentUserId()

  let { data, error } = await supabase
    .from('basic_notebooks')
    .select('*')
    .eq('user_id', uid)
    .eq('language_code', lang)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') return { data: null, error }

  if (!data) {
    const res = await supabase
      .from('basic_notebooks')
      .insert([{ user_id: uid, language_code: lang }])
      .select('*')
      .single()
    data = res.data
    error = res.error
  }

  return { data, error }
}

export async function saveBasic(id, { doc, plain }) {
  return await supabase
    .from('basic_notebooks')
    .update({ doc, plain })
    .eq('id', id)
}

/* -------------------- STORAGE -------------------- */
export async function uploadImage(file, pathPrefix = 'misc') {
  const uid = await currentUserId()
  const ext = file.name.split('.').pop()
  const path = `${uid}/${pathPrefix}/${Date.now()}.${ext}`

  const { error } = await supabase.storage.from('notebook').upload(path, file, { upsert: false })
  if (error) throw error

  const { data: urlData, error: e2 } =
    await supabase.storage.from('notebook').createSignedUrl(path, 60 * 60 * 24 * 7)
  if (e2) throw e2

  return { path, signedUrl: urlData.signedUrl }
}

export async function uploadMedia(file, kind = 'audio') {
  // kind: 'audio' | 'video'
  const uid = await currentUserId()
  const ext = file.name.split('.').pop()
  const path = `${uid}/${kind}/${Date.now()}.${ext}`

  const { error } = await supabase.storage.from('notebook').upload(path, file, { upsert: false })
  if (error) throw error

  const { data: urlData } =
    await supabase.storage.from('notebook').createSignedUrl(path, 60 * 60 * 24 * 7)

  return { path, signedUrl: urlData.signedUrl }
}
// NEW: renvoie toutes les liaisons playlist<->note pour la langue
export async function listPlaylistMemberships(lang) {
  // 1) on récupère d’abord les playlists de cette langue
  const { data: pls, error: e1 } = await supabase
    .from('playlists')
    .select('id')
    .eq('language_code', lang)

  if (e1) return { data: [], error: e1 }
  const ids = (pls || []).map(p => p.id)
  if (!ids.length) return { data: [], error: null }

  // 2) puis toutes les liaisons pour ces playlists
  const { data, error } = await supabase
    .from('playlist_notes')
    .select('playlist_id, note_id')
    .in('playlist_id', ids)

  return { data: data || [], error }
}
