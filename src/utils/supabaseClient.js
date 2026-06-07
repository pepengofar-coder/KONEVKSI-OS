// src/utils/supabaseClient.js

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xckcepsallcbruluoovx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhja2NlcHNhbGxjYnJ1bHVvb3Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1OTc5MjQsImV4cCI6MjA5MTE3MzkyNH0.tx5r53L9PQsaxl23_kdvun3WnxfhzmQtNScv-S_GBdE';

const headers = {
  'apikey': supabaseAnonKey,
  'Authorization': `Bearer ${supabaseAnonKey}`,
  'Content-Type': 'application/json'
};

export async function fetchProfiles() {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/profiles?select=*&order=createdAt.desc`, {
      headers
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch profiles:', err);
    return [];
  }
}

export async function fetchProfile(userId) {
  if (!userId) return null;
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=*`, {
      headers
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data[0] || null;
  } catch (err) {
    console.error(`Failed to fetch profile for ${userId}:`, err);
    return null;
  }
}

export async function createProfile(profileData) {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        ...headers,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(profileData)
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP error ${res.status}: ${errorText}`);
    }
    const data = await res.json();
    return data[0];
  } catch (err) {
    console.error('Failed to create profile:', err);
    throw err;
  }
}

export async function updateProfile(userId, updates) {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        ...headers,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP error ${res.status}: ${errorText}`);
    }
    const data = await res.json();
    return data[0];
  } catch (err) {
    console.error(`Failed to update profile for ${userId}:`, err);
    throw err;
  }
}

export async function checkUserExists(username, email) {
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/profiles?select=username,email&or=(username.ieq.${username},email.ieq.${email})`,
      { headers }
    );
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return {
      usernameExists: data.some(d => d.username?.toLowerCase() === username.toLowerCase()),
      emailExists: data.some(d => d.email?.toLowerCase() === email.toLowerCase())
    };
  } catch (err) {
    console.error('Failed to check user existence:', err);
    return { usernameExists: false, emailExists: false };
  }
}
