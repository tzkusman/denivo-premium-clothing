import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    
    // Log the loaded environment variables
    console.log('Loaded VITE_SUPABASE_URL:', env.VITE_SUPABASE_URL ? 'SET' : 'NOT SET');
    console.log('Loaded VITE_SUPABASE_ANON_KEY:', env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
    
    const supabaseUrl = env.VITE_SUPABASE_URL || 'https://aplibkzcysdothjgfqmc.supabase.co';
    const supabaseKey = env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jphwGPd_ZOog9XM5Hka7kA_kk285KuL';
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
        'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
        'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseKey)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
