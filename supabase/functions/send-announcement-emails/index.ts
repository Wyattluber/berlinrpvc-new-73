
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://aaqhxeiesnphwhazvkck.supabase.co";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Process pending emails in the queue
    const { data: queueItems, error: queueError } = await supabase
      .from("announcement_email_queue")
      .select("*, announcements(*)")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(10);

    if (queueError) {
      throw queueError;
    }

    if (!queueItems || queueItems.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending email notifications found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${queueItems.length} announcement email notifications`);

    // Get all users to send emails to
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      throw usersError;
    }

    const results = [];

    for (const item of queueItems) {
      try {
        const announcement = item.announcements;
        if (!announcement) {
          throw new Error(`Announcement not found for queue item ${item.id}`);
        }

        console.log(`Sending email for announcement: ${announcement.title}`);

        // In a real implementation, you would use an email service like Resend, SendGrid, etc.
        // For now, we'll just simulate sending emails and mark them as processed
        for (const user of users.users) {
          // In production, you'd send an actual email here to user.email
          console.log(`Would send email to ${user.email} about announcement: ${announcement.title}`);
        }

        // Update the queue item status to processed
        const { error: updateError } = await supabase
          .from("announcement_email_queue")
          .update({
            status: "processed",
            processed_at: new Date().toISOString(),
          })
          .eq("id", item.id);

        if (updateError) {
          throw updateError;
        }

        results.push({
          id: item.id,
          announcement_id: item.announcement_id,
          success: true,
        });
      } catch (error) {
        console.error(`Error processing queue item ${item.id}:`, error);
        
        // Update attempts and error info
        const { error: updateError } = await supabase
          .from("announcement_email_queue")
          .update({
            attempts: item.attempts + 1,
            error: error.message,
            status: item.attempts >= 3 ? "failed" : "pending", // Mark as failed after 3 attempts
          })
          .eq("id", item.id);

        if (updateError) {
          console.error("Error updating queue item:", updateError);
        }

        results.push({
          id: item.id,
          announcement_id: item.announcement_id,
          success: false,
          error: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: results.length,
        results 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-announcement-emails function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
