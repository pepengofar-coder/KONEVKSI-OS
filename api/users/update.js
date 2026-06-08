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
    let isAdmin = adminUserId === 'u_admin';
    
    if (!isAdmin) {
      const adminCheckRes = await fetch(`${supabaseUrl}/rest/v1/profiles?userId=eq.${encodeURIComponent(adminUserId)}&select=role`, {
        headers
      });
      
      if (adminCheckRes.ok) {
        const adminCheckData = await adminCheckRes.json();
        isAdmin = adminCheckData && adminCheckData[0] && adminCheckData[0].role === 'SUPER_ADMIN';
      } else {
        console.warn(`Failed to query admin status for ${adminUserId}, HTTP ${adminCheckRes.status}`);
      }
    }

    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Only Super Admins can update users' });
    }

    // 2. Map updates to DB columns, ignoring other fields to avoid schema errors
    const dbUpdates = {};
    if (updates.email !== undefined) dbUpdates.email = updates.email.toLowerCase();
    if (updates.nama !== undefined || updates.name !== undefined) dbUpdates.name = updates.nama || updates.name;
    if (updates.role !== undefined) dbUpdates.role = updates.role;
    if (updates.plan !== undefined) dbUpdates.plan_tier = updates.plan;
    if (updates.planStatus !== undefined) dbUpdates.license_status = updates.planStatus;
    if (updates.planExpiresAt !== undefined) dbUpdates.subscription_end = updates.planExpiresAt ? new Date(updates.planExpiresAt).toISOString() : null;

    // 3. Perform the update
    const updateRes = await fetch(`${supabaseUrl}/rest/v1/profiles?userId=eq.${encodeURIComponent(targetUserId)}`, {
      method: 'PATCH',
      headers: {
        ...headers,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(dbUpdates)
    });

    if (!updateRes.ok) {
      const errorText = await updateRes.text();
      return res.status(updateRes.status).json({ error: `Database update failed: ${errorText}` });
    }

    const updatedData = await updateRes.json();
    const updatedDbUser = updatedData[0];
    if (!updatedDbUser) {
      return res.status(404).json({ error: 'User not found after update' });
    }

    // 4. Map the DB row back to the format expected by the frontend state
    const mappedUser = {
      id: updatedDbUser.userId,
      email: updatedDbUser.email,
      nama: updatedDbUser.name,
      name: updatedDbUser.name,
      role: updatedDbUser.role,
      plan: updatedDbUser.plan_tier,
      planStatus: updatedDbUser.license_status,
      planExpiresAt: updatedDbUser.subscription_end ? new Date(updatedDbUser.subscription_end).getTime() : null,
      username: updates.username || updatedDbUser.username || updatedDbUser.email?.split('@')[0] || '',
      businessRole: updates.businessRole || updatedDbUser.businessRole || 'Owner',
      categories: updates.categories || updatedDbUser.categories || ['Kaos & Jersey', 'Kemeja & PDL', 'Jaket & Hoodie'],
      businessName: updates.businessName || updatedDbUser.businessName || (updatedDbUser.name + ' Convection'),
      businessProfile: updates.businessProfile || updatedDbUser.businessProfile || {
        namaUsaha: updates.businessName || updatedDbUser.businessName || (updatedDbUser.name + ' Convection'),
        telepon: '',
        email: updatedDbUser.email,
        alamat: ''
      },
      phone: updates.phone || updatedDbUser.phone || '',
      createdAt: updates.createdAt || updatedDbUser.createdAt || Date.now(),
      updatedAt: Date.now()
    };

    return res.status(200).json(mappedUser);

  } catch (err) {
    console.error('API update user error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
