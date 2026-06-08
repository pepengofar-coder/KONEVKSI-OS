// api/users/backfill.js

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { adminUserId } = req.body;

  if (!adminUserId) {
    return res.status(400).json({ error: 'Missing required parameter: adminUserId' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ntbjayaxjhjqixpzlmmc.supabase.co';
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_yVJROT8bL4bJAq4GXCzN1w_V1LiJ64p';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

  const headers = {
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${supabaseServiceKey}`,
    'Content-Type': 'application/json'
  };

  try {
    // 1. Verify admin
    let isAdmin = adminUserId === 'u_admin';
    if (!isAdmin) {
      const adminCheckRes = await fetch(`${supabaseUrl}/rest/v1/profiles?userId=eq.${encodeURIComponent(adminUserId)}&select=role`, {
        headers
      });
      if (adminCheckRes.ok) {
        const adminCheckData = await adminCheckRes.json();
        isAdmin = (adminCheckData && adminCheckData[0] && adminCheckData[0].role === 'SUPER_ADMIN');
      }
    }

    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Only Super Admins can execute backfill' });
    }

    // 2. Perform bulk update on profiles table
    // Plan tier = PREMIUM, status = ACTIVE, subscription_end = 2026-12-31T23:59:59.000Z
    const dbUpdates = {
      plan_tier: 'PREMIUM',
      license_status: 'ACTIVE',
      subscription_end: '2026-12-31T23:59:59.000Z'
    };

    // Run both calls to catch cases where role is null/empty, as well as role != SUPER_ADMIN
    // 2a. Update role is null profiles
    const updateNullRes = await fetch(`${supabaseUrl}/rest/v1/profiles?role=is.null`, {
      method: 'PATCH',
      headers: {
        ...headers,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(dbUpdates)
    });

    if (!updateNullRes.ok) {
      const errorText = await updateNullRes.text();
      console.warn('Database backfill PATCH for null roles failed:', errorText);
    }

    // 2b. Update non-SUPER_ADMIN profiles
    const updateRes = await fetch(`${supabaseUrl}/rest/v1/profiles?role=not.eq.SUPER_ADMIN`, {
      method: 'PATCH',
      headers: {
        ...headers,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(dbUpdates)
    });

    if (!updateRes.ok) {
      const errorText = await updateRes.text();
      console.error('Database backfill PATCH for non-admin failed:', errorText);
      return res.status(updateRes.status).json({ error: `Database backfill failed: ${errorText}` });
    }

    const updatedProfiles = await updateRes.json();

    return res.status(200).json({
      success: true,
      message: `Successfully backfilled all profiles to PREMIUM plan active until 2026-12-31.`,
      updatedCount: updatedProfiles.length,
      data: updatedProfiles
    });

  } catch (err) {
    console.error('API backfill users error:', err);
    return res.status(500).json({ error: 'Internal Server Error: ' + err.message });
  }
}
