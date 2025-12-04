import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  to: string;
  toName: string;
  productId: string;
  productName: string;
  orderDate: string;
  emailType: 'initial_request' | 'reminder';
  customToken?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Verify request is from our system using service role key
    const authHeader = req.headers.get('Authorization');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!authHeader || !authHeader.includes(serviceRoleKey || '')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY');
    const fromEmail = Deno.env.get('SENDGRID_FROM_EMAIL') || 'reviews@vlemobile.com';
    const appUrl = Deno.env.get('APP_URL') || 'https://reviews.vlemobile.com';

    if (!sendgridApiKey) {
      return new Response(
        JSON.stringify({ error: 'SendGrid API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailData: EmailRequest = await req.json();
    const { to, toName, productId, productName, orderDate, emailType, customToken } = emailData;

    // Generate review URL with token if provided
    const reviewUrl = customToken 
      ? `${appUrl}?productId=${productId}&token=${customToken}`
      : `${appUrl}?productId=${productId}`;

    // Email subject and content based on type
    const isReminder = emailType === 'reminder';
    const subject = isReminder 
      ? `Reminder: Share your experience with ${productName}`
      : `How was your ${productName}?`;

    const greeting = toName.split(' ')[0]; // Use first name

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Logo -->
          <tr>
            <td style="padding: 20px 40px 5px; text-align: center; background-color: #ffffff; border-radius: 8px 8px 0 0;">
              <img src="https://vlecdn.b-cdn.net/vlemobile-logo-260x150.png" alt="VLE Mobile" style="width: 130px; height: auto;">
            </td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px; text-align: center; background: #F97315;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Your Opinion Matters</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px;">
                ${isReminder ? `Hi again, ${greeting}!` : `Hi ${greeting}!`}
              </h2>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                ${isReminder 
                  ? `We noticed you haven't had a chance to review your <strong>${productName}</strong> yet.` 
                  : `Thank you for your recent purchase of <strong>${productName}</strong>!`
                }
              </p>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                ${isReminder
                  ? 'Your feedback is incredibly valuable to us and helps other customers make informed decisions.'
                  : 'We hope you\'re enjoying it! We\'d love to hear about your experience.'
                }
              </p>
              
              <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                It only takes a minute to share your thoughts, and your review helps other customers make better decisions.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 6px; background: #F97315;">
                    <a href="${reviewUrl}" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px;">
                      Write Your Review
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                <strong>Order Date:</strong> ${new Date(orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; text-align: center;">
                Thank you for being a valued customer!
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                VLE Mobile Reviews &copy; 2025 | Powered by VLE
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const textContent = `
Hi ${greeting}!

${isReminder 
  ? `We noticed you haven't had a chance to review your ${productName} yet.`
  : `Thank you for your recent purchase of ${productName}!`
}

${isReminder
  ? 'Your feedback is incredibly valuable to us and helps other customers make informed decisions.'
  : 'We hope you\'re enjoying it! We\'d love to hear about your experience.'
}

It only takes a minute to share your thoughts, and your review helps other customers make better decisions.

Write your review here: ${reviewUrl}

Order Date: ${new Date(orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

Thank you for being a valued customer!
VLE Mobile Reviews © 2025
    `;

    // Send email via SendGrid API
    const sendgridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to, name: toName }],
            subject: subject,
          },
        ],
        from: {
          email: fromEmail,
          name: 'VLE Reviews',
        },
        content: [
          {
            type: 'text/plain',
            value: textContent,
          },
          {
            type: 'text/html',
            value: htmlContent,
          },
        ],
      }),
    });

    if (!sendgridResponse.ok) {
      const error = await sendgridResponse.text();
      console.error('SendGrid error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        emailType,
        recipient: to 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-review-email:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});