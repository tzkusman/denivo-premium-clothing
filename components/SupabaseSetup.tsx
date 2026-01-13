
import React, { useState } from 'react';
import { initializeSupabase } from '../services/supabase';
import { Database, Terminal, CheckCircle2, Copy, ShieldAlert } from 'lucide-react';

interface SupabaseSetupProps {
  onConnected: () => void;
}

const SupabaseSetup: React.FC<SupabaseSetupProps> = ({ onConnected }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [showSql, setShowSql] = useState(false);

  const handleConnect = () => {
    if (!url || !key) {
      setError('Please fill in both fields.');
      return;
    }
    const success = initializeSupabase({ url, anonKey: key });
    if (success) {
      onConnected();
    } else {
      setError('Connection failed. Please check your credentials.');
    }
  };

  const sqlQuery = `-- 1. Wipe old policies to start clean
DROP POLICY IF EXISTS "Public Read Access" ON products;
DROP POLICY IF EXISTS "Admin Full Control" ON products;
DROP POLICY IF EXISTS "Allow public read" ON products;
DROP POLICY IF EXISTS "Admin full access" ON products;
DROP POLICY IF EXISTS "Enable read access for all users" ON products;

-- 2. Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Anyone (logged in or not) can see products
CREATE POLICY "Enable read access for all users"
ON products FOR SELECT
USING (true);

-- 4. Policy: FULL RIGHTS for tzkusman786@gmail.com
-- This uses JWT claims for high performance and zero table permissions required
CREATE POLICY "Admin Full Control"
ON products FOR ALL 
TO authenticated
USING (auth.jwt() ->> 'email' = 'tzkusman786@gmail.com')
WITH CHECK (auth.jwt() ->> 'email' = 'tzkusman786@gmail.com');

-- 5. Final Table Permissions
GRANT ALL ON products TO authenticated;
GRANT ALL ON products TO service_role;`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlQuery);
    alert('Master Admin SQL copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 py-20">
      <div className="max-w-4xl w-full flex flex-col lg:row bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-100">
        <div className="flex-1 p-8 lg:p-12 border-r border-zinc-100">
          <div className="mb-10">
            <h1 className="text-4xl font-display font-bold text-zinc-900 mb-2 tracking-tighter">DENIVO</h1>
            <p className="text-zinc-500 font-medium">Database Orchestration</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2 ml-1">Project URL</label>
              <div className="relative">
                <Database className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-zinc-900/5 outline-none transition-all"
                  placeholder="https://your-project.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2 ml-1">Anon API Key</label>
              <div className="relative">
                <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                <input
                  type="password"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-zinc-900/5 outline-none transition-all"
                  placeholder="Public anon key"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl flex items-center space-x-2">
                <ShieldAlert size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleConnect}
              className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-bold hover:bg-zinc-800 active:scale-[0.98] transition-all flex items-center justify-center space-x-3 shadow-xl shadow-zinc-900/10"
            >
              <CheckCircle2 size={20} />
              <span className="uppercase tracking-[0.1em] text-xs">Establish Connection</span>
            </button>
          </div>
        </div>

        <div className="lg:w-[420px] bg-zinc-900 p-8 lg:p-12 flex flex-col">
          <div className="mb-8">
            <h3 className="text-white text-xl font-display font-bold mb-3 italic">Master Admin Setup</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              This SQL query grants full <span className="text-white font-medium italic">Update & Delete</span> rights to <span className="text-white font-mono">tzkusman786@gmail.com</span> using secure JWT mapping.
            </p>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => setShowSql(!showSql)}
              className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <span className="text-xs font-bold uppercase tracking-widest">{showSql ? 'Hide SQL' : 'Preview SQL'}</span>
              <Terminal size={16} />
            </button>

            <button 
              onClick={copyToClipboard}
              className="w-full flex items-center justify-between p-4 bg-zinc-800 rounded-2xl text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all shadow-inner"
            >
              <span className="text-xs font-bold uppercase tracking-widest">Copy Master Query</span>
              <Copy size={16} />
            </button>
          </div>

          {showSql && (
            <div className="mt-6 flex-1 overflow-hidden flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex-1 bg-black/40 p-4 rounded-2xl text-[10px] text-zinc-500 font-mono overflow-auto border border-zinc-800 scrollbar-hide">
                <pre>{sqlQuery}</pre>
              </div>
            </div>
          )}

          <div className="mt-auto pt-8 border-t border-white/5">
            <div className="flex items-center space-x-2 text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>Admin: tzkusman786@gmail.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseSetup;
