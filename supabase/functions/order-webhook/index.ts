import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Webhook-Secret",
};

interface OrderData {
  orderId: string;
  customerEmail: string;
  customerName: string;
  productId: string;
  productName: string;
  purchaseDate: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Verify webhook secret
    const webhookSecret = Deno.env.get('WEBHOOK_SECRET');
    const providedSecret = req.headers.get('X-Webhook-Secret');
    
    if (webhookSecret && webhookSecret !== providedSecret) {
      return new Response(
        JSON.stringify({ error: 'Invalid webhook secret' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const orderData: OrderData = await req.json();
    const { orderId, customerEmail, customerName, productId, productName, purchaseDate } = orderData;

    // Validate required fields
    if (!orderId || !customerEmail || !customerName || !productId || !productName || !purchaseDate) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if order already exists
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('order_id', orderId)
      .maybeSingle();

    if (existingOrder) {
      return new Response(
        JSON.stringify({ message: 'Order already exists', orderId }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert order into database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        customer_email: customerEmail,
        customer_name: customerName,
        product_id: productId,
        product_name: productName,
        purchase_date: purchaseDate,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error inserting order:', orderError);
      return new Response(
        JSON.stringify({ error: 'Failed to create order', details: orderError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate email schedule dates
    const purchaseDateObj = new Date(purchaseDate);
    const initialRequestDate = new Date(purchaseDateObj);
    initialRequestDate.setDate(initialRequestDate.getDate() + 7); // 7 days after purchase
    
    const reminderDate = new Date(purchaseDateObj);
    reminderDate.setDate(reminderDate.getDate() + 15); // 15 days after purchase

    // Schedule initial review request email
    const { error: initialEmailError } = await supabase
      .from('email_queue')
      .insert({
        order_id: order.id,
        email_type: 'initial_request',
        recipient_email: customerEmail,
        recipient_name: customerName,
        product_id: productId,
        scheduled_for: initialRequestDate.toISOString(),
        status: 'pending',
      });

    if (initialEmailError) {
      console.error('Error scheduling initial email:', initialEmailError);
    }

    // Schedule reminder email
    const { error: reminderEmailError } = await supabase
      .from('email_queue')
      .insert({
        order_id: order.id,
        email_type: 'reminder',
        recipient_email: customerEmail,
        recipient_name: customerName,
        product_id: productId,
        scheduled_for: reminderDate.toISOString(),
        status: 'pending',
      });

    if (reminderEmailError) {
      console.error('Error scheduling reminder email:', reminderEmailError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Order received and emails scheduled',
        orderId,
        emailsScheduled: {
          initialRequest: initialRequestDate.toISOString(),
          reminder: reminderDate.toISOString(),
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in order-webhook:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});