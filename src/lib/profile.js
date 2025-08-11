import { supabase } from './supabase';

/** Return { user, profile } or throw if not logged in */
export async function getUserAndProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, username, display_name')
    .eq('id', user.id)
    .maybeSingle();

  // If no row, create one so we can store the username later
  if (!profile) {
    await supabase.from('profiles').insert({ id: user.id }).throwOnError();
    return { user, profile: { id: user.id, username: null, display_name: null } };
  }

  if (error) throw error;
  return { user, profile };
}
