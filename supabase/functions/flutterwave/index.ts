import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FLUTTERWAVE_SECRET_KEY = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface PaymentRequest {
  action: "initialize" | "verify";
  applicationId?: string;
  amount: number;
  currency: string;
  email: string;
  phone: string;
  fullName: string;
  transactionRef?: string;
  redirectUrl?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body: PaymentRequest = await req.json();
    const { action, applicationId, amount, currency, email, phone, fullName, transactionRef, redirectUrl } = body;

    console.log("Flutterwave action:", action, { applicationId, amount, currency });

    if (action === "initialize") {
      // Generate transaction reference
      const txRef = `ORBIT-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      // Create payment transaction record
      const { data: transaction, error: txError } = await supabase
        .from("payment_transactions")
        .insert({
          application_id: applicationId,
          transaction_ref: txRef,
          amount,
          currency,
          status: "pending",
          payment_type: "application_fee",
          customer_email: email,
          customer_phone: phone,
          metadata: { full_name: fullName },
        })
        .select()
        .single();

      if (txError) {
        console.error("Error creating transaction:", txError);
        throw new Error("Failed to create transaction record");
      }

      // Initialize Flutterwave payment
      const flwResponse = await fetch("https://api.flutterwave.com/v3/payments", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tx_ref: txRef,
          amount,
          currency,
          redirect_url: redirectUrl || `${req.headers.get("origin")}/payment-callback`,
          customer: {
            email,
            phone_number: phone,
            name: fullName,
          },
          customizations: {
            title: "Orbit Employ",
            description: "Application Processing Fee",
            logo: "https://orbitemploy.com/logo.png",
          },
          meta: {
            application_id: applicationId,
          },
        }),
      });

      const flwData = await flwResponse.json();
      console.log("Flutterwave response:", flwData);

      if (flwData.status === "success") {
        return new Response(
          JSON.stringify({
            success: true,
            paymentLink: flwData.data.link,
            transactionRef: txRef,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        throw new Error(flwData.message || "Failed to initialize payment");
      }
    }

    if (action === "verify") {
      if (!transactionRef) {
        throw new Error("Transaction reference is required");
      }

      // Verify payment with Flutterwave
      const verifyResponse = await fetch(
        `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${transactionRef}`,
        {
          headers: {
            "Authorization": `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
          },
        }
      );

      const verifyData = await verifyResponse.json();
      console.log("Flutterwave verify response:", verifyData);

      if (verifyData.status === "success" && verifyData.data.status === "successful") {
        // Update transaction record
        await supabase
          .from("payment_transactions")
          .update({
            status: "successful",
            flutterwave_ref: verifyData.data.flw_ref,
          })
          .eq("transaction_ref", transactionRef);

        // Get application ID from transaction
        const { data: txData } = await supabase
          .from("payment_transactions")
          .select("application_id")
          .eq("transaction_ref", transactionRef)
          .single();

        if (txData?.application_id) {
          // Update application status
          await supabase
            .from("applications")
            .update({
              status: "paid",
              payment_status: "paid",
              payment_reference: transactionRef,
              payment_amount: verifyData.data.amount,
              payment_currency: verifyData.data.currency,
              paid_at: new Date().toISOString(),
            })
            .eq("id", txData.application_id);

          // Trigger ManyChat payment confirmation
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
          } catch (mcError) {
            console.error("ManyChat notification error:", mcError);
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            status: "successful",
            data: verifyData.data,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        // Update transaction as failed
        await supabase
          .from("payment_transactions")
          .update({ status: "failed" })
          .eq("transaction_ref", transactionRef);

        return new Response(
          JSON.stringify({
            success: false,
            status: verifyData.data?.status || "failed",
            message: "Payment verification failed",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    throw new Error("Invalid action");
  } catch (error: any) {
    console.error("Flutterwave error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
