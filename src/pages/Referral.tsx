import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Users, Wallet, Copy, Check, ArrowRight, Share2, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Referral = () => {
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReferralCode = () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email to generate a referral code",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    // Simulate API call - In production, this would create a record in Supabase
    setTimeout(() => {
      const code = `ORBIT-${email.split('@')[0].toUpperCase().slice(0, 4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setReferralCode(code);
      setIsGenerating(false);
      toast({
        title: "Referral code generated!",
        description: "Share this code with friends to earn rewards"
      });
    }, 1000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard"
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = `${window.location.origin}/?ref=${referralCode}`;

  const rewards = [
    {
      referrals: 1,
      reward: "UGX 25,000",
      description: "Cash credit on your next payment"
    },
    {
      referrals: 3,
      reward: "UGX 100,000",
      description: "Bonus: Free document assistance"
    },
    {
      referrals: 5,
      reward: "UGX 200,000",
      description: "Bonus: Priority placement status"
    },
    {
      referrals: 10,
      reward: "Free Application",
      description: "Your application fee fully refunded"
    }
  ];

  const steps = [
    {
      icon: Users,
      title: "Get Your Code",
      description: "Enter your email to generate a unique referral code"
    },
    {
      icon: Share2,
      title: "Share with Friends",
      description: "Send your code to friends interested in working abroad"
    },
    {
      icon: Wallet,
      title: "Earn Rewards",
      description: "Get cash rewards when they complete their application"
    }
  ];

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-24 pb-16 bg-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary mb-6">
            <Gift className="w-5 h-5" />
            <span className="font-medium">Referral Program</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Earn While You Share
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Refer friends to Orbit Employ and earn cash rewards. The more people you refer, 
            the more you earn. It's that simple.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-foreground mb-10">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-8 -right-4 w-8 h-8 text-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Generate Code Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            <Card className="border-2 border-secondary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Get Your Referral Code</CardTitle>
                <CardDescription>
                  Enter your email to generate your unique referral code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Your Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {!referralCode ? (
                  <Button 
                    onClick={generateReferralCode} 
                    className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    disabled={isGenerating}
                  >
                    {isGenerating ? "Generating..." : "Generate My Code"}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-xs text-muted-foreground mb-1">Your Referral Code</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xl font-bold text-primary tracking-wider">
                          {referralCode}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={copyToClipboard}
                          className="hover:bg-secondary/10"
                        >
                          {copied ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Share Link</p>
                      <p className="text-sm font-medium text-foreground break-all">{shareLink}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Join Orbit Employ and start your journey to work abroad! Use my referral code: ${referralCode}\n\n${shareLink}`)}`, '_blank')}
                      >
                        Share on WhatsApp
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={copyToClipboard}
                      >
                        {copied ? "Copied!" : "Copy Link"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Rewards Tiers */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-foreground mb-4">
            Reward Tiers
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
            The more friends you refer, the bigger your rewards. Unlock bonus perks as you climb the tiers.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {rewards.map((tier, index) => (
              <Card 
                key={index} 
                className={`text-center ${index === rewards.length - 1 ? 'border-secondary border-2 relative overflow-hidden' : ''}`}
              >
                {index === rewards.length - 1 && (
                  <div className="absolute top-0 right-0 bg-secondary text-secondary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg flex items-center gap-1">
                    <Star className="w-3 h-3" /> Best Value
                  </div>
                )}
                <CardHeader>
                  <div className="text-4xl font-bold text-primary mb-2">{tier.referrals}</div>
                  <CardTitle className="text-sm text-muted-foreground">
                    {tier.referrals === 1 ? 'Referral' : 'Referrals'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold text-secondary mb-2">{tier.reward}</p>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-bold text-center text-foreground mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-card rounded-lg border border-border">
              <h4 className="font-semibold text-foreground mb-2">When do I get paid?</h4>
              <p className="text-sm text-muted-foreground">
                You receive your referral bonus within 48 hours after your referred friend completes their application payment.
              </p>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border">
              <h4 className="font-semibold text-foreground mb-2">Is there a limit to how many people I can refer?</h4>
              <p className="text-sm text-muted-foreground">
                No limit! Refer as many friends as you want. The more referrals, the more you earn.
              </p>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border">
              <h4 className="font-semibold text-foreground mb-2">Do I need to be a client to participate?</h4>
              <p className="text-sm text-muted-foreground">
                Anyone can participate in our referral program. You don't need to be an applicant to earn rewards.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Referral;
