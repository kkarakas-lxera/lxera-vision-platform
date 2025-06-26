import { supabase } from '@/integrations/supabase/client';

/**
 * Debug storage bucket policies and permissions
 */
export async function debugStoragePolicy() {
  console.group('🔍 Storage Policy Debug');
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No session found');
      return;
    }

    // 1. Check if we can list buckets
    console.log('\n1️⃣ Testing bucket access...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    console.log('Buckets:', buckets, bucketError);

    // 2. Check if we can list files in the bucket
    console.log('\n2️⃣ Testing file listing...');
    const { data: files, error: listError } = await supabase.storage
      .from('employee-cvs')
      .list('', { limit: 5 });
    console.log('Files in bucket:', files, listError);

    // 3. Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!profile) {
      console.error('No profile found');
      return;
    }

    // 4. Test different file paths
    console.log('\n3️⃣ Testing different file path formats...');
    const testPaths = [
      `${profile.company_id}/test.txt`,
      `${profile.company_id}/cvs/test.txt`,
      `test-${Date.now()}.txt`,
      `cvs/${profile.company_id}/test.txt`,
      `public/test.txt`
    ];

    for (const path of testPaths) {
      console.log(`\nTesting path: ${path}`);
      
      // Create a small test file
      const content = new Blob(['test'], { type: 'text/plain' });
      const file = new File([content], 'test.txt', { type: 'text/plain' });
      
      const { data, error } = await supabase.storage
        .from('employee-cvs')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.log(`❌ Failed: ${error.message}`);
        
        // Try to get more details about the error
        if (error.message.includes('policy')) {
          console.log('Policy error details:', {
            path,
            expectedFormat: 'Likely needs specific path format',
            userRole: profile.role,
            companyId: profile.company_id
          });
        }
      } else {
        console.log(`✅ Success! Path works: ${path}`);
        console.log('Upload data:', data);
        
        // Clean up successful test file
        await supabase.storage.from('employee-cvs').remove([path]);
        break; // Found working format
      }
    }

    // 5. Test with raw API call
    console.log('\n4️⃣ Testing with raw API call...');
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const formData = new FormData();
    formData.append('', testFile);

    const rawResponse = await fetch(
      `${supabase.supabaseUrl}/storage/v1/object/employee-cvs/${profile.company_id}/raw-test.txt`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabase.supabaseKey,
          'x-upsert': 'true'
        },
        body: formData
      }
    );

    const rawResult = await rawResponse.text();
    console.log('Raw API response:', {
      status: rawResponse.status,
      statusText: rawResponse.statusText,
      body: rawResult
    });

  } catch (error) {
    console.error('Debug failed:', error);
  } finally {
    console.groupEnd();
  }
}

/**
 * Get exact RLS policy error
 */
export async function getStoragePolicyError() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!profile) return;

    // Try to upload with detailed error capture
    const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const testPath = `${profile.company_id}/policy-test-${Date.now()}.txt`;

    const response = await fetch(
      `${supabase.supabaseUrl}/storage/v1/object/employee-cvs/${testPath}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabase.supabaseKey,
          'Content-Type': 'text/plain',
          'x-upsert': 'true'
        },
        body: testFile
      }
    );

    const result = await response.json();
    
    console.group('📋 Storage Policy Error Details');
    console.log('Response status:', response.status);
    console.log('Error details:', result);
    console.log('Test path:', testPath);
    console.log('User info:', {
      id: session.user.id,
      email: session.user.email,
      role: profile.role,
      company_id: profile.company_id
    });
    console.groupEnd();

    return result;
  } catch (error) {
    console.error('Policy error check failed:', error);
  }
}

// Make functions available globally
if (typeof window !== 'undefined') {
  (window as any).debugStoragePolicy = debugStoragePolicy;
  (window as any).getStoragePolicyError = getStoragePolicyError;
}