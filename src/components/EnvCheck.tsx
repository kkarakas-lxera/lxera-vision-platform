import { useEffect } from 'react';

export const EnvCheck = () => {
  useEffect(() => {
    console.log('Environment Check:');
    console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing');
    console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
    console.log('All env vars:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));
  }, []);

  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-yellow-100 border-b border-yellow-400 p-4 z-50">
        <div className="max-w-7xl mx-auto">
          <p className="text-yellow-800 font-medium">
            ⚠️ Missing environment variables. The app may not function correctly.
          </p>
          <p className="text-yellow-700 text-sm mt-1">
            Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.
          </p>
        </div>
      </div>
    );
  }

  return null;
};