import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature',
}

// Verify webhook signature from Resend (using Svix)
async function verifyWebhookSignature(
  payload: string,
  headers: Headers
): Promise<boolean> {
  const webhookSecret = Deno.env.get('RESEND_WEBHOOK_SECRET')
  if (!webhookSecret) {
    console.warn('RESEND_WEBHOOK_SECRET not configured, skipping signature verification')
    return true // Allow in development, but should be false in production
  }

  const svixId = headers.get('svix-id')
  const svixTimestamp = headers.get('svix-timestamp')
  const svixSignature = headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error('Missing required Svix headers')
    return false
  }

  // Verify timestamp is within 5 minutes
  const timestamp = parseInt(svixTimestamp)
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - timestamp) > 300) {
    console.error('Webhook timestamp too old')
    return false
  }

  // Extract the base64 secret (remove 'whsec_' prefix)
  const secret = webhookSecret.startsWith('whsec_') 
    ? webhookSecret.substring(6)
    : webhookSecret

  try {
    // Create the signed content
    const signedContent = `${svixId}.${svixTimestamp}.${payload}`
    
    // Decode the base64 secret
    const encoder = new TextEncoder()
    const secretBytes = Uint8Array.from(atob(secret), c => c.charCodeAt(0))
    
    // Generate HMAC signature
    const key = await crypto.subtle.importKey(
      'raw',
      secretBytes,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(signedContent)
    )
    
    const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    
    // Extract signatures from header (can be multiple, space-delimited)
    const signatures = svixSignature.split(' ')
    
    // Check if any signature matches
    for (const sig of signatures) {
      // Remove version prefix (e.g., 'v1,')
      const sigParts = sig.split(',')
      if (sigParts.length === 2) {
        const sigOnly = sigParts[1]
        if (sigOnly === expectedSignature) {
          return true
        }
      }
    }
    
    console.error('Webhook signature verification failed')
    return false
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    return false
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get raw body for signature verification
    const rawBody = await req.text()
    
    // Verify webhook signature
    const isValid = await verifyWebhookSignature(rawBody, req.headers)
    if (!isValid) {
      throw new Error('Invalid webhook signature')
    }

    // Parse the webhook payload
    const payload = JSON.parse(rawBody)
    console.log('Received webhook event:', payload.type)

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Extract email ID from the webhook data
    const emailId = payload.data?.email_id
    if (!emailId) {
      console.log('No email_id in webhook payload')
      return new Response(
        JSON.stringify({ success: true, message: 'No email_id to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Find the invitation by resend_email_id
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from('profile_invitations')
      .select('id, employee_id, email_opened_count, email_clicked_count, email_clicks')
      .eq('resend_email_id', emailId)
      .single()

    if (invitationError || !invitation) {
      console.log('No invitation found for email_id:', emailId)
      return new Response(
        JSON.stringify({ success: true, message: 'No invitation found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Handle different event types
    switch (payload.type) {
      case 'email.opened': {
        // Update opened tracking
        const { error: updateError } = await supabaseAdmin
          .from('profile_invitations')
          .update({
            email_opened_at: invitation.email_opened_count === 0 ? payload.created_at : undefined,
            email_opened_count: (invitation.email_opened_count || 0) + 1,
            viewed_at: invitation.email_opened_count === 0 ? payload.created_at : undefined,
            email_tracking_data: {
              ...payload.data,
              last_opened_at: payload.created_at
            }
          })
          .eq('id', invitation.id)

        if (updateError) throw updateError

        console.log(`Updated email.opened for invitation ${invitation.id}`)
        break
      }

      case 'email.clicked': {
        // Extract click data
        const clickData = payload.data?.click || {}
        const clickEvent = {
          link: clickData.link,
          timestamp: clickData.timestamp || payload.created_at,
          ipAddress: clickData.ipAddress,
          userAgent: clickData.userAgent
        }

        // Update clicked tracking
        const existingClicks = invitation.email_clicks || []
        const { error: updateError } = await supabaseAdmin
          .from('profile_invitations')
          .update({
            email_clicked_at: invitation.email_clicked_count === 0 ? clickData.timestamp : undefined,
            email_clicked_count: (invitation.email_clicked_count || 0) + 1,
            email_clicks: [...existingClicks, clickEvent],
            viewed_at: invitation.email_clicked_count === 0 && !invitation.email_opened_count 
              ? clickData.timestamp 
              : undefined,
            email_tracking_data: {
              ...payload.data,
              last_clicked_at: clickData.timestamp
            }
          })
          .eq('id', invitation.id)

        if (updateError) throw updateError

        console.log(`Updated email.clicked for invitation ${invitation.id}`)
        break
      }

      case 'email.delivered': {
        // Just log delivery confirmation
        console.log(`Email delivered for invitation ${invitation.id}`)
        break
      }

      case 'email.bounced': {
        // Mark invitation as failed
        const { error: updateError } = await supabaseAdmin
          .from('profile_invitations')
          .update({
            email_tracking_data: {
              ...payload.data,
              bounced_at: payload.created_at,
              bounce_reason: payload.data?.bounce_type
            }
          })
          .eq('id', invitation.id)

        if (updateError) throw updateError

        console.log(`Email bounced for invitation ${invitation.id}`)
        break
      }

      case 'email.complained': {
        // Mark as spam complaint
        const { error: updateError } = await supabaseAdmin
          .from('profile_invitations')
          .update({
            email_tracking_data: {
              ...payload.data,
              complained_at: payload.created_at
            }
          })
          .eq('id', invitation.id)

        if (updateError) throw updateError

        console.log(`Spam complaint for invitation ${invitation.id}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${payload.type}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in handle-resend-webhook:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})