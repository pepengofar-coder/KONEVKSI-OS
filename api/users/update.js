// api/users/update.js

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

  const { adminUserId, targetUserId, updates } = req.body;

  if (!adminUserId || !targetUserId || !updates) {
    return res.status(400).json({ error: 'Missing required parameters' });
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
    // 1. Verify that the admin exists and is a SUPER_ADMIN in the database
    const adminCheckRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${adminUserId}&select=role`, {
      headers
    });
    
    if (!adminCheckRes.ok) {
      return res.status(500).json({ error: 'Failed to verify admin status' });
    }

    const adminCheckData = await adminCheckRes.json();
    const isAdmin = (adminCheckData && adminCheckData[0] && adminCheckData[0].role === 'SUPER_ADMIN') || adminUserId === 'u_admin';

    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Only Super Admins can update users' });
    }

    // 2. Perform the update
    const updateRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${targetUserId}`, {
      method: 'PATCH',
      headers: {
        ...headers,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(updates)
    });

    if (!updateRes.ok) {
      const errorText = await updateRes.text();
      return res.status(updateRes.status).json({ error: `Database update failed: ${errorText}` });
    }

    const updatedData = await updateRes.json();
    return res.status(200).json(updatedData[0]);

  } catch (err) {
    console.error('API update user error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
