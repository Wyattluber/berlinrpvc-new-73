
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key (admin privileges)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      {
        auth: { persistSession: false }
      }
    );

    // Get pending emails from the queue
    const { data: pendingEmails, error: queueError } = await supabaseAdmin
      .from('announcement_email_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(50);

    if (queueError) {
      throw queueError;
    }

    console.log(`Found ${pendingEmails?.length || 0} pending emails`);
    
    if (!pendingEmails || pendingEmails.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No pending emails found' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Get the announcements for these emails
    const announcementIds = pendingEmails.map(email => email.announcement_id);
    const { data: announcements, error: announcementsError } = await supabaseAdmin
      .from('announcements')
      .select('*')
      .in('id', announcementIds);

    if (announcementsError) {
      throw announcementsError;
    }

    if (!announcements || announcements.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Announcements not found' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    // Get all users to send emails to
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      throw usersError;
    }

    let emailsSent = 0;
    let emailErrors = 0;

    // Process each announcement
    for (const email of pendingEmails) {
      try {
        const announcement = announcements.find(a => a.id === email.announcement_id);
        
        if (!announcement) {
          console.error(`Announcement ${email.announcement_id} not found`);
          continue;
        }

        // Update the processing status
        await supabaseAdmin
          .from('announcement_email_queue')
          .update({ 
            status: 'processing',
            attempts: email.attempts + 1 
          })
          .eq('id', email.id);

        // Send email to each user
        for (const user of users.users) {
          if (!user.email) continue;

          try {
            // Compose email content
            const emailPayload: EmailPayload = {
              to: user.email,
              subject: `Neue Ankündigung: ${announcement.title}`,
              html: `
                <h1>${announcement.title}</h1>
                <p style="white-space: pre-wrap;">${announcement.content}</p>
                <p style="margin-top: 20px;">
                  <a href="${Deno.env.get('FRONTEND_URL') || 'https://your-app-url.com'}/profile?tab=announcements&id=${announcement.id}" 
                     style="background-color: #3b82f6; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
                    Ankündigung ansehen
                  </a>
                </p>
              `,
            };

            // This is a placeholder - in a production system, you would use an email service
            console.log(`Would send email to: ${user.email}`);
            console.log(`Subject: ${emailPayload.subject}`);
            
            // In a real implementation, you'd send the email here
            // await sendEmail(emailPayload);
            
            emailsSent++;
          } catch (error) {
            console.error(`Error sending email to ${user.email}:`, error);
            emailErrors++;
          }
        }

        // Mark email as processed
        await supabaseAdmin
          .from('announcement_email_queue')
          .update({ 
            status: 'completed',
            processed_at: new Date().toISOString()
          })
          .eq('id', email.id);

      } catch (error) {
        console.error(`Error processing email ${email.id}:`, error);
        
        // Update with error
        await supabaseAdmin
          .from('announcement_email_queue')
          .update({ 
            status: 'error',
            error: error.message,
            attempts: email.attempts + 1
          })
          .eq('id', email.id);
          
        emailErrors++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${pendingEmails.length} announcements. Sent ${emailsSent} emails. Encountered ${emailErrors} errors.`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in send-announcement-emails function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || 'An error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
