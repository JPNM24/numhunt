// Supabase-backed global leaderboard with localStorage fallback

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xirhmfyaywcclhkaugxn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpcmhtZnlheXdjY2xoa2F1Z3huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMDQ1MDUsImV4cCI6MjA4Nzc4MDUwNX0.u408v2shoxPAnHXgHBND4hTJP6GB5N030GlIaxSSBX0';
const LOCAL_KEY = 'numhunt_leaderboard';

let supabase = null;
let useLocal = false;

try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (e) {
    console.warn('Supabase init failed, using localStorage fallback', e);
    useLocal = true;
}

// --- localStorage helpers ---
function getLocal() {
    try {
        return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveLocal(data) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
}

// --- Public API ---

export async function getLeaderboard(limit = 20) {
    if (!useLocal && supabase) {
        try {
            const { data, error } = await supabase
                .from('leaderboard')
                .select('*')
                .order('score', { ascending: false })
                .limit(limit);

            if (!error && data) {
                // Supabase is healthy — clear any stale localStorage so
                // all devices show the same global leaderboard
                localStorage.removeItem(LOCAL_KEY);
                return data;
            }
            console.warn('Supabase fetch error:', error);
        } catch (e) {
            console.warn('Supabase fetch failed, falling back to localStorage', e);
        }
    }

    // Fallback
    return getLocal()
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}

export async function addScore(username, score, difficulty) {
    // Only send columns that exist — let DB handle id and created_at
    const entry = {
        username,
        score,
        difficulty,
    };

    if (!useLocal && supabase) {
        try {
            const { data, error } = await supabase
                .from('leaderboard')
                .insert([entry])
                .select();

            if (!error) {
                console.log('Score saved to Supabase:', data);
                return true;
            }
            console.warn('Supabase insert failed:', error.message, error.details, error.hint);
        } catch (e) {
            console.warn('Supabase insert error:', e);
        }
    }

    // Fallback to localStorage
    const local = getLocal();
    local.push({ ...entry, created_at: new Date().toISOString() });
    local.sort((a, b) => b.score - a.score);
    saveLocal(local.slice(0, 100));
    return true;
}

export async function getRank(score) {
    if (!useLocal && supabase) {
        try {
            const { count, error } = await supabase
                .from('leaderboard')
                .select('*', { count: 'exact', head: true })
                .gt('score', score);

            if (!error && count !== null) return count + 1;
        } catch (e) {
            console.warn('Supabase rank check failed', e);
        }
    }

    // Fallback
    const local = getLocal();
    return local.filter((e) => e.score > score).length + 1;
}

