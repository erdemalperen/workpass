'use client';

import { useEffect, useState } from 'react';
import { supabaseAdminAuth } from '@/lib/services/supabaseAdminAuth';
import { createClient } from '@/lib/supabase/client';

export default function TestPage() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    console.log(msg);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  useEffect(() => {
    async function testAuth() {
      addLog('🔍 Starting auth test...');

      try {
        const supabase = createClient();

        // Test 1: Get session
        addLog('1️⃣ Getting session...');
        const { data: { session } } = await supabase.auth.getSession();
        addLog(`Session: ${session ? '✅ EXISTS' : '❌ NULL'}`);
        if (session) {
          addLog(`User ID: ${session.user.id}`);
          addLog(`Email: ${session.user.email}`);
        }

        // Test 2: Check if authenticated
        addLog('2️⃣ Checking isAuthenticated...');
        const isAuth = await supabaseAdminAuth.isAuthenticated();
        addLog(`isAuthenticated: ${isAuth ? '✅ TRUE' : '❌ FALSE'}`);

        // Test 3: Get admin profile directly
        addLog('3️⃣ Fetching admin profile directly...');
        if (session) {
          const { data: profile, error } = await supabase
            .from('admin_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) {
            addLog(`❌ Error fetching profile: ${error.message}`);
            addLog(`Error details: ${JSON.stringify(error)}`);
          } else if (profile) {
            addLog(`✅ Profile found: ${profile.name} (${profile.role})`);
            addLog(`Permissions: ${JSON.stringify(profile.permissions)}`);
          } else {
            addLog(`❌ Profile is null`);
          }
        }

        // Test 4: Use getCurrentAdmin
        addLog('4️⃣ Using getCurrentAdmin()...');
        const admin = await supabaseAdminAuth.getCurrentAdmin();
        if (admin) {
          addLog(`✅ getCurrentAdmin SUCCESS: ${admin.name} (${admin.role})`);
        } else {
          addLog(`❌ getCurrentAdmin returned NULL`);
        }

        addLog('✅ Test complete!');
      } catch (error) {
        addLog(`💥 ERROR: ${error}`);
        console.error('Test error:', error);
      }
    }

    testAuth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔍 Auth Debug Test</h1>

        <div className="bg-slate-800 rounded-lg p-6 font-mono text-sm">
          {logs.length === 0 ? (
            <p className="text-slate-400">Running tests...</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>

        <div className="mt-6">
          <a href="/admin/login" className="text-blue-400 hover:underline mr-4">
            ← Back to Login
          </a>
          <a href="/admin/dashboard" className="text-blue-400 hover:underline">
            → Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
