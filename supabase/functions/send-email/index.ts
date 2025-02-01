import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from "npm:resend@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html: string;
  text: string;
  templateId?: string;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) {
      throw new Error('Missing Resend API key')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { to, cc, bcc, subject, html, text, templateId, metadata }: EmailRequest = await req.json()

    // Check rate limit
    const { data: { user } } = await supabaseClient.auth.getUser(req.headers.get('Authorization')?.split(' ')[1] ?? '')
    if (!user?.id) {
      throw new Error('Unauthorized')
    }

    const { data: rateLimit } = await supabaseClient
      .rpc('check_email_rate_limit', { p_user_id: user.id })
    
    if (!rateLimit) {
      throw new Error('Rate limit exceeded. Please try again later.')
    }

    const resend = new Resend(RESEND_API_KEY)
    const emailResponse = await resend.emails.send({
      from: 'Workout Planner <workouts@resend.dev>',
      to,
      cc,
      bcc,
      subject,
      html,
      text,
    })

    // Log the email
    const { error: logError } = await supabaseClient
      .from('email_logs')
      .insert({
        user_id: user.id,
        template_id: templateId,
        recipient: to.join(', '),
        cc,
        bcc,
        subject,
        status: 'sent',
        metadata: {
          ...metadata,
          resend_id: emailResponse.id
        }
      })

    if (logError) {
      console.error('Error logging email:', logError)
    }

    return new Response(JSON.stringify(emailResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in send-email function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message === 'Rate limit exceeded. Please try again later.' ? 429 : 500,
      }
    )
  }
})