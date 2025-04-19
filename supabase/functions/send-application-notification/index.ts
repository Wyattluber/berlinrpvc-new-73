
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const NOTIFICATION_EMAIL = "lueckwyattjason10.2006@gmail.com";
const FORMSUBMIT_URL = `https://formsubmit.co/${NOTIFICATION_EMAIL}`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { 
        status: 405, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        }
      }
    );
  }

  try {
    const { application_type, applicant_name, applicant_id } = await req.json();
    
    // Determine the dashboard URL based on application type
    let dashboardUrl = "https://berlinrpvc.de/admin/dashboard/applications";
    const emailTitle = "Neue Bewerbung bei BerlinRP-VC";
    
    // Send the notification email using FormSubmit.co
    const response = await fetch(FORMSUBMIT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        subject: emailTitle,
        message: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${emailTitle}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .email-container {
              max-width: 600px;
              margin: 20px auto;
              background: #ffffff;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #1a1f36, #5a33a2);
              color: #ffffff;
              text-align: center;
              padding: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 22px;
            }
            .content {
              padding: 30px;
              text-align: center;
              color: #333;
            }
            .content p {
              font-size: 16px;
              margin-bottom: 20px;
              line-height: 1.5;
            }
            .button {
              display: inline-block;
              background: #ffcc00;
              color: #1a1f36;
              padding: 14px 28px;
              text-decoration: none;
              font-size: 16px;
              border-radius: 6px;
              font-weight: bold;
              margin-top: 10px;
            }
            .footer {
              text-align: center;
              font-size: 14px;
              padding: 20px;
              color: #666;
              background: #f4f4f4;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>Neue Bewerbung eingegangen</h1>
            </div>
            <div class="content">
              <p>Hallo DarkAngel 👋</p>
              <p>Es wurde soeben eine neue Bewerbung auf BerlinRP-VC eingereicht.</p>
              <p>Bewerber: ${applicant_name || "Unbekannt"}</p>
              <p>Bewerbungs-ID: ${applicant_id || "Unbekannt"}</p>
              <p>Klicke auf den Button unten, um sie dir direkt anzusehen:</p>
              <p>
                <a href="${dashboardUrl}" class="button">Zur Bewerbung</a>
              </p>
            </div>
            <div class="footer">
              <p>Diese Nachricht wurde automatisch generiert. Bei Fragen melde dich gern bei deinem System-Team.</p>
            </div>
          </div>
        </body>
        </html>
        `,
        name: applicant_name || "BerlinRP-VC System",
        email: NOTIFICATION_EMAIL,
        _captcha: "false"
      })
    });

    const result = await response.json();
    console.log("Email notification result:", result);
    
    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        }
      }
    );
  } catch (error) {
    console.error("Error sending notification:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        }
      }
    );
  }
});
