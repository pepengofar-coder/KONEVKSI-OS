// src/utils/supabaseClient.js

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ntbjayaxjhjqixpzlmmc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_yVJROT8bL4bJAq4GXCzN1w_V1LiJ64p';

const headers = {
  'apikey': supabaseAnonKey,
  'Authorization': `Bearer ${supabaseAnonKey}`,
  'Content-Type': 'application/json'
};

// Helper to map DB columns to frontend state user format
export function mapDbUserToState(dbUser) {
  if (!dbUser) return null;
  return {
    id: dbUser.userId,
    email: dbUser.email,
    nama: dbUser.name,
    name: dbUser.name,
    role: dbUser.role || 'USER',
    plan: dbUser.plan_tier || 'FREE',
    planStatus: dbUser.license_status || 'ACTIVE',
    planExpiresAt: dbUser.subscription_end ? new Date(dbUser.subscription_end).getTime() : null,
    // Provide default fallback fields to satisfy onboarding / routing checks
    username: dbUser.username || dbUser.email?.split('@')[0] || '',
    businessRole: dbUser.businessRole || 'Owner',
    categories: dbUser.categories || ['Kaos & Jersey', 'Kemeja & PDL', 'Jaket & Hoodie'],
    businessName: dbUser.businessName || (dbUser.name + ' Convection'),
    businessProfile: dbUser.businessProfile || {
      namaUsaha: dbUser.businessName || (dbUser.name + ' Convection'),
      telepon: '',
      email: dbUser.email,
      alamat: ''
    },
    phone: dbUser.phone || '',
    createdAt: dbUser.createdAt || Date.now(),
    updatedAt: dbUser.updatedAt || Date.now()
  };
}

// Helper to map frontend state user to DB columns
export function mapStateUserToDb(stateUser) {
  if (!stateUser) return null;
  return {
    userId: stateUser.id,
    email: stateUser.email?.toLowerCase(),
    name: stateUser.nama || stateUser.name,
    role: stateUser.role || 'USER',
    plan_tier: stateUser.plan || 'FREE',
    license_status: stateUser.planStatus || 'ACTIVE',
    subscription_end: stateUser.planExpiresAt ? new Date(stateUser.planExpiresAt).toISOString() : null
  };
}

export async function fetchProfiles() {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/profiles?select=*`, {
      headers
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return (data || []).map(mapDbUserToState);
  } catch (err) {
    console.error('Failed to fetch profiles:', err);
    return [];
  }
}

export async function fetchProfile(userId) {
  if (!userId) return null;
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/profiles?userId=eq.${encodeURIComponent(userId)}&select=*`, {
      headers
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data[0] ? mapDbUserToState(data[0]) : null;
  } catch (err) {
    console.error(`Failed to fetch profile for ${userId}:`, err);
    return null;
  }
}

export async function fetchProfileByEmail(email) {
  if (!email) return null;
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/profiles?email=eq.${encodeURIComponent(email.toLowerCase())}&select=*`, {
      headers
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data[0] ? mapDbUserToState(data[0]) : null;
  } catch (err) {
    console.error(`Failed to fetch profile for email ${email}:`, err);
    return null;
  }
}

export async function createProfile(profileData) {
  try {
    const dbUser = mapStateUserToDb(profileData);
    const res = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        ...headers,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(dbUser)
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP error ${res.status}: ${errorText}`);
    }
    const data = await res.json();
    return mapDbUserToState(data[0]);
  } catch (err) {
    console.error('Failed to create profile:', err);
    throw err;
  }
}

export async function updateProfile(userId, updates) {
  try {
    // Map only valid updates keys
    const dbUpdates = {};
    if (updates.email !== undefined) dbUpdates.email = updates.email.toLowerCase();
    if (updates.nama !== undefined || updates.name !== undefined) dbUpdates.name = updates.nama || updates.name;
    if (updates.role !== undefined) dbUpdates.role = updates.role;
    if (updates.plan !== undefined) dbUpdates.plan_tier = updates.plan;
    if (updates.planStatus !== undefined) dbUpdates.license_status = updates.planStatus;
    if (updates.planExpiresAt !== undefined) dbUpdates.subscription_end = updates.planExpiresAt ? new Date(updates.planExpiresAt).toISOString() : null;

    const res = await fetch(`${supabaseUrl}/rest/v1/profiles?userId=eq.${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      headers: {
        ...headers,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(dbUpdates)
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP error ${res.status}: ${errorText}`);
    }
    const data = await res.json();
    return mapDbUserToState(data[0]);
  } catch (err) {
    console.error(`Failed to update profile for ${userId}:`, err);
    throw err;
  }
}

export async function checkUserExists(username, email) {
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/profiles?select=email&email=eq.${encodeURIComponent(email.toLowerCase())}`,
      { headers }
    );
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return {
      usernameExists: false, // Bypassed/not tracked in DB
      emailExists: (data || []).length > 0
    };
  } catch (err) {
    console.error('Failed to check user existence:', err);
    return { usernameExists: false, emailExists: false };
  }
}
