import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { pdfParse } from "https://deno.land/x/pdf@0.2.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { filePath, employeeId } = await req.json();
    
    if (!filePath || !employeeId) {
      throw new Error('File path and employee ID are required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('cv-uploads')
      .download(filePath);

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    let extractedText = '';

    // Check file type and extract text accordingly
    const fileExtension = filePath.split('.').pop()?.toLowerCase();

    if (fileExtension === 'pdf') {
      // Extract text from PDF
      const uint8Array = new Uint8Array(await fileData.arrayBuffer());
      const pdfDoc = await pdfParse(uint8Array);
      
      for (const page of pdfDoc.pages) {
        extractedText += page.text + '\n';
      }
    } else if (fileExtension === 'txt') {
      // Plain text file
      extractedText = await fileData.text();
    } else if (fileExtension === 'doc' || fileExtension === 'docx') {
      // For Word documents, we'd need a more complex extraction
      // For now, return a message indicating manual processing needed
      extractedText = await fileData.text(); // This will be garbled for Word docs
      
      // In production, you'd use a service like Apache Tika or 
      // a dedicated document processing API
      console.warn('Word document extraction not fully implemented');
    }

    // Clean up the text
    extractedText = extractedText
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newline
      .trim();

    return new Response(
      JSON.stringify({ 
        success: true, 
        text: extractedText,
        wordCount: extractedText.split(/\s+/).length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('CV text extraction error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});