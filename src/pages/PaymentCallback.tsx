import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      const txRef = searchParams.get("tx_ref") || searchParams.get("transaction_id");
      const paymentStatus = searchParams.get("status");

      if (!txRef) {
        setStatus("failed");
        setMessage("No transaction reference found.");
        return;
      }

      if (paymentStatus === "cancelled") {
        setStatus("failed");
        setMessage("Payment was cancelled.");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("flutterwave", {
          body: {
            action: "verify",
            transactionRef: txRef,
          },
        });

        if (error) throw error;

        if (data.success && data.status === "successful") {
          setStatus("success");
          setMessage("Your payment was successful! Please complete your profile to proceed.");
          // Store application ID for KYC redirect
          if (data.applicationId) {
            sessionStorage.setItem("kyc_application_id", data.applicationId);
          }
        } else {
          setStatus("failed");
          setMessage(data.message || "Payment verification failed. Please contact support.");
        }
      } catch (error: any) {
        console.error("Verification error:", error);
        setStatus("failed");
        setMessage("Failed to verify payment. Please contact support with your transaction reference.");
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-3xl p-8 shadow-lg border border-border text-center">
        {status === "loading" && (
          <>
            <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-secondary animate-spin" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Verifying Payment...
            </h1>
            <p className="text-muted-foreground">
              Please wait while we confirm your payment.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Payment Successful!
            </h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4 mb-6">
              <p className="text-sm text-foreground">
                <strong>Next Step:</strong> Complete your profile with documents and references to finalize your application.
              </p>
            </div>
            <Button 
              variant="hero" 
              onClick={() => {
                const appId = sessionStorage.getItem("kyc_application_id");
                if (appId) {
                  navigate(`/kyc?application_id=${appId}`);
                } else {
                  navigate("/");
                }
              }} 
              className="w-full"
            >
              Complete Profile
            </Button>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Payment Failed
            </h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <div className="space-y-3">
              <Button variant="hero" onClick={() => navigate("/#apply")} className="w-full">
                Try Again
              </Button>
              <Button variant="outline" onClick={() => navigate("/")} className="w-full">
                Return Home
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;
