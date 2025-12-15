import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Shield } from "lucide-react";

type PaymentStatus = "loading" | "success" | "failed";

const InsuranceCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<PaymentStatus>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      const txRef = searchParams.get("tx_ref");
      const paymentStatus = searchParams.get("status");

      if (!txRef) {
        setStatus("failed");
        setMessage("No transaction reference found");
        return;
      }

      if (paymentStatus === "cancelled") {
        setStatus("failed");
        setMessage("Payment was cancelled");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("flutterwave", {
          body: {
            action: "verify_insurance",
            transactionRef: txRef
          }
        });

        if (error) throw error;

        if (data?.success && data?.status === "successful") {
          setStatus("success");
          setMessage("Your insurance subscription is now active!");
        } else {
          setStatus("failed");
          setMessage(data?.message || "Payment verification failed");
        }
      } catch (error: any) {
        console.error("Verification error:", error);
        setStatus("failed");
        setMessage(error.message || "Failed to verify payment");
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-3xl p-8 shadow-lg border border-border text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 text-primary mx-auto mb-6 animate-spin" />
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Verifying Payment...
            </h1>
            <p className="text-muted-foreground">Please wait while we confirm your subscription.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Insurance Activated!
            </h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-primary mb-2">
                <Shield className="w-5 h-5" />
                <span className="font-semibold">Coverage Active</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your insurance is valid for 12 months. You will receive a confirmation email with your policy details.
              </p>
            </div>
            
            <Button variant="hero" onClick={() => navigate("/")} className="w-full">
              Return Home
            </Button>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Subscription Failed
            </h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <div className="space-y-3">
              <Button variant="hero" onClick={() => navigate("/insurance")} className="w-full">
                Try Again
              </Button>
              <Button variant="ghost" onClick={() => navigate("/")} className="w-full">
                Return Home
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InsuranceCallback;
