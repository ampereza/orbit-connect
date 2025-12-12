import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MANYCHAT_API_KEY = Deno.env.get("MANYCHAT_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface ManyChatRequest {
  action: "send_welcome" | "send_payment_success" | "send_status_update" | "subscribe";
  applicationId?: string;
  phone?: string;
  email?: string;
  fullName?: string;
  message?: string;
  status?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { action, applicationId, phone, email, fullName, message, status }: ManyChatRequest = await req.json();

    console.log("ManyChat action:", action, { applicationId, phone, email });

    let responseData: any = { success: true };

    // ManyChat API base URL
    const manychatBaseUrl = "https://api.manychat.com/fb";

    switch (action) {
      case "subscribe": {
        // Subscribe a new user to ManyChat
        // Note: ManyChat requires phone in specific format
        const formattedPhone = phone?.replace(/\s/g, "").replace(/^\+/, "");
        
        const subscribeResponse = await fetch(`${manychatBaseUrl}/subscriber/createSubscriber`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${MANYCHAT_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: formattedPhone,
            first_name: fullName?.split(" ")[0] || "",
            last_name: fullName?.split(" ").slice(1).join(" ") || "",
            email: email,
            has_opt_in_sms: true,
            has_opt_in_email: true,
            consent_phrase: "User applied via Orbit Employ portal",
          }),
        });

        const subscribeData = await subscribeResponse.json();
        console.log("ManyChat subscribe response:", subscribeData);

        if (subscribeData.data?.id && applicationId) {
          // Update application with ManyChat subscriber ID
          await supabase
            .from("applications")
            .update({ manychat_subscriber_id: subscribeData.data.id })
            .eq("id", applicationId);
        }

        responseData = { success: true, subscriberId: subscribeData.data?.id };
        break;
      }

      case "send_welcome": {
        // Get subscriber ID from application
        let subscriberId: string | null = null;
        
        if (applicationId) {
          const { data: app } = await supabase
            .from("applications")
            .select("manychat_subscriber_id, full_name")
            .eq("id", applicationId)
            .single();
          
          subscriberId = app?.manychat_subscriber_id;
        }

        if (subscriberId) {
          // Send welcome message flow
          await fetch(`${manychatBaseUrl}/sending/sendFlow`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${MANYCHAT_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              subscriber_id: subscriberId,
              flow_ns: "welcome_flow", // You'll need to set up this flow in ManyChat
            }),
          });
        }

        // Log the message
        await supabase.from("manychat_logs").insert({
          application_id: applicationId,
          subscriber_id: subscriberId,
          message_type: "welcome",
          message_content: "Welcome message sent",
          direction: "outbound",
          status: "sent",
        });

        break;
      }

      case "send_payment_success": {
        let subscriberId: string | null = null;
        
        if (applicationId) {
          const { data: app } = await supabase
            .from("applications")
            .select("manychat_subscriber_id, full_name")
            .eq("id", applicationId)
            .single();
          
          subscriberId = app?.manychat_subscriber_id;
        }

        if (subscriberId) {
          await fetch(`${manychatBaseUrl}/sending/sendContent`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${MANYCHAT_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              subscriber_id: subscriberId,
              data: {
                version: "v2",
                content: {
                  type: "text",
                  text: `✅ Payment Confirmed!\n\nThank you for your application fee payment. Your application is now being processed.\n\nYou will be notified when our next recruitment cycle begins in January 2025.\n\n- Orbit Employ Team`,
                },
              },
            }),
          });
        }

        await supabase.from("manychat_logs").insert({
          application_id: applicationId,
          subscriber_id: subscriberId,
          message_type: "payment_success",
          message_content: "Payment confirmation sent",
          direction: "outbound",
          status: "sent",
        });

        break;
      }

      case "send_status_update": {
        let subscriberId: string | null = null;
        
        if (applicationId) {
          const { data: app } = await supabase
            .from("applications")
            .select("manychat_subscriber_id, full_name")
            .eq("id", applicationId)
            .single();
          
          subscriberId = app?.manychat_subscriber_id;
        }

        const statusMessages: Record<string, string> = {
          verified: "🎉 Great news! Your application has been verified. You're now in our candidate pool.",
          matched: "🌟 Exciting update! You've been matched with a potential employer. We'll contact you shortly with details.",
          deployed: "✈️ Congratulations! Your deployment is confirmed. Check your email for travel details.",
          rejected: "We regret to inform you that your application was not successful at this time.",
        };

        const messageText = message || statusMessages[status || ""] || `Application status updated to: ${status}`;

        if (subscriberId) {
          await fetch(`${manychatBaseUrl}/sending/sendContent`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${MANYCHAT_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              subscriber_id: subscriberId,
              data: {
                version: "v2",
                content: {
                  type: "text",
                  text: messageText,
                },
              },
            }),
          });
        }

        await supabase.from("manychat_logs").insert({
          application_id: applicationId,
          subscriber_id: subscriberId,
          message_type: "status_update",
          message_content: messageText,
          direction: "outbound",
          status: "sent",
        });

        break;
      }
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("ManyChat error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
