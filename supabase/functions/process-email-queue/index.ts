import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Verify request is from cron job or internal call
    const authHeader = req.headers.get('Authorization');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!authHeader || !authHeader.includes(serviceRoleKey || '')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey!);

    const now = new Date().toISOString();

    // Fetch pending emails that are scheduled to be sent
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('email_queue')
      .select(`
        *,
        orders (
          order_id,
          customer_email,
          customer_name,
          product_id,
          product_name,
          purchase_date
        )
      `)
      .eq('status', 'pending')
      .lte('scheduled_for', now)
      .order('scheduled_for', { ascending: true })
      .limit(50); // Process up to 50 emails per run

    if (fetchError) {
      console.error('Error fetching pending emails:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch pending emails', details: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending emails to process', processed: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = {
      processed: 0,
      sent: 0,
      cancelled: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each email
    for (const emailJob of pendingEmails) {
      results.processed++;

      // Check if customer has already submitted a review for this product
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('email', emailJob.recipient_email)
        .eq('product_id', emailJob.product_id)
        .maybeSingle();

      if (existingReview) {
        // Customer already reviewed - cancel this email and any future reminders
        await supabase
          .from('email_queue')
          .update({ status: 'cancelled', updated_at: now })
          .eq('order_id', emailJob.order_id)
          .eq('status', 'pending');
        
        results.cancelled++;
        continue;
      }

      // Send email via send-review-email function
      try {
        const emailFunctionUrl = `${supabaseUrl}/functions/v1/send-review-email`;
        
        const emailResponse = await fetch(emailFunctionUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: emailJob.recipient_email,
            toName: emailJob.recipient_name,
            productId: emailJob.product_id,
            productName: emailJob.orders.product_name,
            orderDate: emailJob.orders.purchase_date,
            emailType: emailJob.email_type,
          }),
        });

        if (emailResponse.ok) {
          // Mark as sent
          await supabase
            .from('email_queue')
            .update({ 
              status: 'sent', 
              sent_at: now,
              updated_at: now,
            })
            .eq('id', emailJob.id);
          
          results.sent++;
        } else {
          const errorText = await emailResponse.text();
          console.error(`Failed to send email ${emailJob.id}:`, errorText);
          
          // Mark as failed
          await supabase
            .from('email_queue')
            .update({ 
              status: 'failed',
              error_message: errorText.substring(0, 500),
              updated_at: now,
            })
            .eq('id', emailJob.id);
          
          results.failed++;
          results.errors.push(`Email ${emailJob.id}: ${errorText}`);
        }
      } catch (error) {
        console.error(`Error processing email ${emailJob.id}:`, error);
        
        // Mark as failed
        await supabase
          .from('email_queue')
          .update({ 
            status: 'failed',
            error_message: error.message.substring(0, 500),
            updated_at: now,
          })
          .eq('id', emailJob.id);
        
        results.failed++;
        results.errors.push(`Email ${emailJob.id}: ${error.message}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Email queue processed',
        results,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-email-queue:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});