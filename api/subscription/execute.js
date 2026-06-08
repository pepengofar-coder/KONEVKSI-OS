// api/subscription/execute.js

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

  const { userId, subscriptionId, billingCycle } = req.body;

  if (!userId || !subscriptionId) {
    return res.status(400).json({ error: 'Missing required parameters: userId and subscriptionId are required.' });
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
    // 1. Verify that the target user profile exists in Supabase
    const userCheckRes = await fetch(`${supabaseUrl}/rest/v1/profiles?userId=eq.${encodeURIComponent(userId)}&select=*`, {
      headers
    });
    
    if (!userCheckRes.ok) {
      const errorText = await userCheckRes.text();
      console.error(`Failed to verify profile for user ${userId}:`, errorText);
      return res.status(500).json({ error: `Failed to verify user profile: ${errorText}` });
    }

    const userCheckData = await userCheckRes.json();
    if (!userCheckData || userCheckData.length === 0) {
      return res.status(404).json({ error: `User profile not found for userId: ${userId}` });
    }

    // 2. Map subscriptionId to plan_tier and calculate expiry timestamp
    let planTier = 'FREE';
    const subIdClean = String(subscriptionId).toLowerCase().trim();

    if (subIdClean.includes('premium')) {
      planTier = 'PREMIUM';
    } else if (subIdClean.includes('business')) {
      planTier = 'BUSINESS';
    } else if (subIdClean.includes('free')) {
      planTier = 'FREE';
    } else {
      // Fallback exact matching
      if (subscriptionId === 'PREMIUM' || subscriptionId === 'BUSINESS' || subscriptionId === 'FREE') {
        planTier = subscriptionId;
      } else {
        return res.status(400).json({ error: `Invalid subscriptionId: ${subscriptionId}` });
      }
    }

    let expiryDate = null;
    if (planTier !== 'FREE') {
      const isYearly = String(billingCycle).toLowerCase().trim() === 'yearly' || billingCycle === 'Tahunan';
      const now = new Date();
      if (isYearly) {
        now.setFullYear(now.getFullYear() + 1);
      } else {
        now.setMonth(now.getMonth() + 1);
      }
      expiryDate = now.toISOString();
    }

    // 3. Update profiles table
    const dbUpdates = {
      plan_tier: planTier,
      license_status: 'ACTIVE',
      subscription_end: expiryDate
    };

    const updateRes = await fetch(`${supabaseUrl}/rest/v1/profiles?userId=eq.${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      headers: {
        ...headers,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(dbUpdates)
    });

    if (!updateRes.ok) {
      const errorText = await updateRes.text();
      console.error(`Failed to execute subscription package update in Supabase:`, errorText);
      return res.status(updateRes.status).json({ error: `Database update failed: ${errorText}` });
    }

    const updatedData = await updateRes.json();
    const updatedDbUser = updatedData[0];
    if (!updatedDbUser) {
      return res.status(500).json({ error: 'User profile not returned after update' });
    }

    // 4. Map the DB row back to the format expected by the frontend state
    const mappedUser = {
      id: updatedDbUser.userId,
      email: updatedDbUser.email,
      nama: updatedDbUser.name,
      name: updatedDbUser.name,
      role: updatedDbUser.role || 'USER',
      plan: updatedDbUser.plan_tier || 'FREE',
      planStatus: updatedDbUser.license_status || 'ACTIVE',
      planExpiresAt: updatedDbUser.subscription_end ? new Date(updatedDbUser.subscription_end).getTime() : null,
      username: updatedDbUser.username || updatedDbUser.email?.split('@')[0] || '',
      businessRole: updatedDbUser.businessRole || 'Owner',
      categories: updatedDbUser.categories || ['Kaos & Jersey', 'Kemeja & PDL', 'Jaket & Hoodie'],
      businessName: updatedDbUser.businessName || (updatedDbUser.name + ' Convection'),
      businessProfile: updatedDbUser.businessProfile || {
        namaUsaha: updatedDbUser.businessName || (updatedDbUser.name + ' Convection'),
        telepon: '',
        email: updatedDbUser.email,
        alamat: ''
      },
      phone: updatedDbUser.phone || '',
      createdAt: updatedDbUser.createdAt || Date.now(),
      updatedAt: Date.now()
    };

    console.log(`Successfully executed subscription package for user ${userId}. Plan: ${planTier}, Expires: ${expiryDate}`);
    return res.status(200).json(mappedUser);

  } catch (err) {
    console.error('API execute subscription error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
