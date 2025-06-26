import { supabase } from '@/integrations/supabase/client';
import { debugAuthState } from './auth-helpers';

/**
 * Test function to verify auth and storage setup
 * Call this from the browser console to debug
 */
export async function testAuthAndUpload() {
  console.group('🧪 Testing Auth & Upload Configuration');
  
  try {
    // 1. Check current auth state
    console.log('\n1️⃣ Checking auth state...');
    await debugAuthState();
    
    // 2. Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error('❌ No session found:', sessionError);
      return false;
    }
    console.log('✅ Session found:', session.user.email);
    
    // 3. Check user profile
    console.log('\n2️⃣ Checking user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    if (profileError || !profile) {
      console.error('❌ No profile found:', profileError);
      return false;
    }
    console.log('✅ Profile found:', profile);
    
    // 4. Test auth.uid() in database
    console.log('\n3️⃣ Testing database auth.uid()...');
    const { data: authCheck, error: authError } = await supabase
      .rpc('check_auth_uid');
      
    console.log('Database auth check:', authCheck, authError);
    
    // 5. Test storage access
    console.log('\n4️⃣ Testing storage bucket access...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    console.log('Buckets:', buckets?.map(b => b.name), bucketError);
    
    // 6. Test creating a test file
    console.log('\n5️⃣ Testing file upload...');
    const testContent = new Blob(['Test CV content'], { type: 'text/plain' });
    const testFile = new File([testContent], 'test-cv.txt', { type: 'text/plain' });
    const testPath = `${profile.company_id}/test-${Date.now()}.txt`;
    
    console.log('Uploading to path:', testPath);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('employee-cvs')
      .upload(testPath, testFile, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (uploadError) {
      console.error('❌ Upload failed:', uploadError);
      
      // Try debug function
      const { data: debugData } = await supabase
        .rpc('debug_storage_auth', {
          bucket_id: 'employee-cvs',
          file_path: testPath
        });
      console.log('Debug info:', debugData);
    } else {
      console.log('✅ Upload successful:', uploadData);
      
      // Clean up test file
      await supabase.storage.from('employee-cvs').remove([testPath]);
      console.log('🧹 Test file cleaned up');
    }
    
    return !uploadError;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  } finally {
    console.groupEnd();
  }
}

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).testAuthAndUpload = testAuthAndUpload;
}