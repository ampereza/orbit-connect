import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as crypto from "https://deno.land/std@0.177.0/crypto/mod.ts";

const FLUTTERWAVE_SECRET_KEY = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  try {
    // Verify webhook signature
    const signature = req.headers.get("verif-hash");
    const secretHash = Deno.env.get("FLUTTERWAVE_WEBHOOK_SECRET") || FLUTTERWAVE_SECRET_KEY;
    
    if (signature !== secretHash) {
      console.error("Invalid webhook signature");
      return new Response("Unauthorized", { status: 401 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const payload = await req.json();

    console.log("Flutterwave webhook received:", payload);

    if (payload.event === "charge.completed") {
      const data = payload.data;
      const txRef = data.tx_ref;

      if (data.status === "successful") {
        // Update transaction record
        await supabase
          .from("payment_transactions")
          .update({
            status: "successful",
            flutterwave_ref: data.flw_ref,
          })
          .eq("transaction_ref", txRef);

        // Get application ID
        const { data: txData } = await supabase
          .from("payment_transactions")
          .select("application_id")
          .eq("transaction_ref", txRef)
          .single();

        if (txData?.application_id) {
          // Update application
          await supabase
            .from("applications")
            .update({
              status: "paid",
              payment_status: "paid",
              payment_reference: txRef,
              payment_amount: data.amount,
              payment_currency: data.currency,
              paid_at: new Date().toISOString(),
            })
            .eq("id", txData.application_id);

          // Send ManyChat notification
          try {
            await fetch(`${SUPABASE_URL}/functions/v1/manychat`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              },
              body: JSON.stringify({
                action: "send_payment_success",
                applicationId: txData.application_id,
              }),
            });
          } catch (error) {
            console.error("ManyChat error:", error);
          }
        }
      } else {
        // Update as failed
        await supabase
          .from("payment_transactions")
          .update({ status: "failed" })
          .eq("transaction_ref", txRef);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
