
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailQueueItem {
  id: string;
  announcement_id: string;
  attempts: number;
  status: string;
  processed_at: string | null;
  error: string | null;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  is_server_wide: boolean;
  status: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the admin key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Check if the requesting user is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header is required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is an admin
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (adminError || !adminData) {
      return new Response(
        JSON.stringify({ error: 'Admin privileges required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the pending email queue items
    const { data: queueItems, error: queueError } = await supabaseAdmin
      .from('announcement_email_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10);

    if (queueError) {
      throw queueError;
    }

    if (!queueItems || queueItems.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending announcement emails to send', processed: 0 }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let processedCount = 0;
    const results = [];

    for (const item of queueItems as EmailQueueItem[]) {
      try {
        // Get the announcement details
        const { data: announcement, error: announcementError } = await supabaseAdmin
          .from('news')
          .select('*')
          .eq('id', item.announcement_id)
          .single();

        if (announcementError || !announcement) {
          throw new Error(`Announcement not found: ${announcementError?.message || 'Unknown error'}`);
        }

        // Get all users to send emails to
        const { data: authUsers, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

        if (usersError) {
          throw usersError;
        }

        const validUsers = authUsers.users.filter(user => user.email);
        console.log(`Sending announcement to ${validUsers.length} users`);

        // In a real implementation, you would use a proper email service
        // For demonstration, we'll just log and mark as processed
        for (const user of validUsers) {
          console.log(`Sending email to ${user.email} for announcement: ${announcement.title}`);
          // In a real implementation:
          // await sendEmail(user.email, announcement.title, announcement.content);
        }

        // Update the queue item
        const { error: updateError } = await supabaseAdmin
          .from('announcement_email_queue')
          .update({
            status: 'completed',
            processed_at: new Date().toISOString(),
            attempts: item.attempts + 1,
          })
          .eq('id', item.id);

        if (updateError) {
          throw updateError;
        }

        processedCount++;
        results.push({
          id: item.id,
          announcement_id: item.announcement_id,
          status: 'completed',
          recipients: validUsers.length,
        });
      } catch (error) {
        console.error(`Error processing queue item ${item.id}:`, error);

        // Update the queue item to mark the error
        await supabaseAdmin
          .from('announcement_email_queue')
          .update({
            status: 'error',
            error: error.message || 'Unknown error',
            attempts: item.attempts + 1,
          })
          .eq('id', item.id);

        results.push({
          id: item.id,
          announcement_id: item.announcement_id,
          status: 'error',
          error: error.message || 'Unknown error',
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${processedCount} of ${queueItems.length} announcement emails`,
        processed: processedCount,
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in send_announcement_email function:', error);

    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
