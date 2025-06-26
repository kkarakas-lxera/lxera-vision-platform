import { supabase } from '@/integrations/supabase/client';

/**
 * Test the exact storage policy requirements
 */
export async function testStorageFix() {
  console.group('🧪 Testing Storage Policy Fix');
  
  try {
    // 1. Get session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No session');
      return;
    }
    
    // 2. Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    if (!profile) {
      console.error('No profile');
      return;
    }
    
    console.log('User profile:', {
      id: profile.id,
      role: profile.role,
      company_id: profile.company_id
    });
    
    // 3. Test if get_user_auth_data function exists
    console.log('\n📋 Testing get_user_auth_data function...');
    try {
      const { data: authData, error: authError } = await supabase
        .rpc('get_user_auth_data', { user_id: session.user.id });
        
      console.log('get_user_auth_data result:', authData, authError);
      
      if (authError && authError.message.includes('does not exist')) {
        console.error('❌ Function get_user_auth_data does not exist!');
        console.log('This is why uploads are failing. The storage policy depends on this function.');
        return;
      }
    } catch (e) {
      console.error('Function test error:', e);
    }
    
    // 4. Test exact path format
    console.log('\n🚀 Testing storage upload with correct path format...');
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const timestamp = Date.now();
    
    // Path MUST start with company_id/
    const testPath = `${profile.company_id}/test-${timestamp}.txt`;
    console.log('Test path:', testPath);
    console.log('Path starts with company_id:', testPath.startsWith(profile.company_id));
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('employee-cvs')
      .upload(testPath, testFile, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (uploadError) {
      console.error('❌ Upload failed:', uploadError);
      
      // Check if it's the function issue
      if (uploadError.message.includes('get_user_auth_data')) {
        console.log('💡 The error confirms the missing function issue!');
        console.log('Solution: Run the migration to create get_user_auth_data function');
      }
    } else {
      console.log('✅ Upload successful!', uploadData);
      
      // Clean up
      await supabase.storage.from('employee-cvs').remove([testPath]);
      console.log('🧹 Test file cleaned up');
    }
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    console.groupEnd();
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).testStorageFix = testStorageFix;
}