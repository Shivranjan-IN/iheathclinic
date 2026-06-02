import { Navigation } from "../common/Navigation";
import { Footer } from "../common/Footer";
import { Button } from "../common/ui/button";
import { Card } from "../common/ui/card";
import { Badge } from "../common/ui/badge";
import { PageView } from "../common/types";
import React from 'react';
import { Crown, Check, Zap, Shield, Sparkles, Package, Truck, HeadphonesIcon, Gift, Star, Award, Target } from "lucide-react";
import { MedicineSection } from "./MedicineSection";

interface PlusProps {
  onNavigate: (view: PageView) => void;
}

export function Plus({ onNavigate }: PlusProps) {
  const benefits = [
    { icon: Check, title: "Priority Support", desc: "24/7 dedicated support team with < 5 min response time" },
    { icon: Sparkles, title: "Unlimited AI Summaries", desc: "No limits on AI-powered health insights and analysis" },
    { icon: Zap, title: "2-way IoT Device Sync", desc: "Seamless integration with all health devices and wearables" },
    { icon: Shield, title: "Free Beta Features", desc: "Early access to all new features before public release" },
    { icon: Crown, title: "Extra 5% Savings", desc: "On all medicine and lab test orders throughout the year" },
    { icon: Truck, title: "No Delivery Charges", desc: "Free delivery on all orders, no minimum purchase required" },
    { icon: Package, title: "Express Delivery", desc: "Priority processing and same-day delivery in metro cities" },
    { icon: HeadphonesIcon, title: "Dedicated Manager", desc: "Personal health advisor to guide your healthcare journey" },
    { icon: Gift, title: "Exclusive Offers", desc: "Access to member-only deals and seasonal promotions" },
    { icon: Award, title: "Health Rewards", desc: "Earn 2x points on every purchase with our loyalty program" },
    { icon: Target, title: "Personalized Plans", desc: "Custom health and wellness plans tailored to your needs" },
    { icon: Star, title: "VIP Access", desc: "Skip the queue with priority appointment booking" }
  ];

  const comparisons = [
    { feature: "Health Analytics", free: "Basic", plus: "Advanced" },
    { feature: "AI Summaries/Month", free: "5", plus: "Unlimited" },
    { feature: "IoT Device Sync", free: "1 device", plus: "Unlimited" },
    { feature: "Delivery Charges", free: "₹40-100", plus: "FREE" },
    { feature: "Support Response", free: "24 hours", plus: "< 5 minutes" },
    { feature: "Loyalty Points", free: "1x", plus: "2x" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation onNavigate={onNavigate} onGetStarted={() => onNavigate("login")} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-yellow-900/20 via-pink-900/20 to-purple-900/20 py-20 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl mb-6 font-bold text-foreground">I Health Clinic PLUS</h1>
              <p className="text-xl text-foreground/80 mb-8 font-medium">
                Premium membership with exclusive benefits, unlimited access, and VIP healthcare experience
              </p>
              <Badge className="text-lg px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 mb-8">
                Save 5% Extra on Everything + Many More Benefits
              </Badge>

              {/* Quick Value Props */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-foreground/90">Free Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-foreground/90">Priority Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-foreground/90">Unlimited AI</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-foreground/90">2x Points</span>
                </div>
              </div>

              <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-orange-500" onClick={() => onNavigate("login")}>
                <Crown className="w-5 h-5 mr-2" />
                Upgrade to PLUS
              </Button>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-2xl border-border">
              <div className="text-center mb-6">
                <Badge className="bg-yellow-500 mb-4">Most Popular</Badge>
                <h2 className="text-4xl mb-2 text-foreground">₹999<span className="text-lg text-foreground/70">/month</span></h2>
                <p className="text-foreground/80">or ₹9,999/year (Save ₹2,000)</p>
              </div>

              <div className="space-y-3">
                {benefits.slice(0, 6).map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">{benefit.title}</span>
                      <p className="text-sm text-foreground/70">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full mt-6" size="lg" onClick={() => onNavigate("login")}>
                Start 30-Day Free Trial
              </Button>
              <p className="text-sm text-center text-foreground/60 mt-4">
                Cancel anytime • No commitment
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* All Benefits Grid */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4 text-foreground font-bold">Complete Premium Benefits</h2>
            <p className="text-xl text-foreground/80 font-medium">Everything you need for the ultimate healthcare experience</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all bg-card border-border">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-900/30 to-orange-900/30 rounded-lg flex items-center justify-center mb-4 border border-yellow-800/30">
                  <benefit.icon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="mb-2 text-foreground font-semibold">{benefit.title}</h3>
                <p className="text-foreground/70">{benefit.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-gradient-to-br from-pink-900/10 to-purple-900/10 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4 text-foreground font-bold">Free vs PLUS</h2>
            <p className="text-xl text-foreground/80 font-medium">See what you get with I Health Clinic PLUS</p>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20">
                  <tr>
                    <th className="text-left p-4">Feature</th>
                    <th className="text-center p-4">Free</th>
                    <th className="text-center p-4 bg-gradient-to-r from-yellow-900/30 to-orange-900/30">
                      <Crown className="w-5 h-5 inline mr-2" />
                      PLUS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((item, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-4">{item.feature}</td>
                      <td className="p-4 text-center text-foreground/70">{item.free}</td>
                      <td className="p-4 text-center font-semibold text-orange-600">{item.plus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4 text-foreground font-bold">What PLUS Members Say</h2>
            <p className="text-xl text-foreground/80 font-medium">Join thousands of satisfied premium members</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Priya Mehta",
                role: "PLUS Member since 2024",
                content: "The 5% savings alone pays for the membership! Plus the priority support is amazing.",
                rating: 5
              },
              {
                name: "Rajesh Kumar",
                role: "PLUS Member since 2023",
                content: "Free delivery and unlimited AI features make this a no-brainer for regular users.",
                rating: 5
              },
              {
                name: "Anita Sharma",
                role: "PLUS Member since 2024",
                content: "Love the dedicated health advisor. They help me make better healthcare decisions.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="p-6 bg-card border-border">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-foreground/70 mb-4">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-foreground/60">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-20 bg-gradient-to-br from-yellow-900/10 to-orange-900/10 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4 text-foreground font-bold">PLUS Pays for Itself</h2>
            <p className="text-xl text-foreground/80 font-medium">See how much you can save</p>
          </div>

          <Card className="p-8 bg-card border-border">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b">
                <span>Monthly medicine orders (avg ₹2000)</span>
                <span className="text-green-600 font-semibold">Save ₹100/month</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b">
                <span>2 Lab tests per month (avg ₹1500)</span>
                <span className="text-green-600 font-semibold">Save ₹75/month</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b">
                <span>Delivery charges saved</span>
                <span className="text-green-600 font-semibold">Save ₹200/month</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="font-semibold">Total Monthly Savings</span>
                <span className="text-green-600 font-semibold text-xl">₹375+</span>
              </div>
              <div className="flex justify-between items-center pt-4 bg-yellow-900/20 p-4 rounded-lg border border-yellow-800/30">
                <span className="font-semibold">I Health Clinic PLUS Cost</span>
                <span className="font-semibold text-xl">₹999</span>
              </div>
              <div className="flex justify-between items-center bg-green-900/20 p-4 rounded-lg border border-green-800/30">
                <span className="font-semibold text-lg">Annual Savings</span>
                <span className="text-green-600 font-semibold text-2xl">₹3,500+</span>
              </div>
            </div>

            <p className="text-center text-foreground/60 mt-6">
              *Based on average customer usage. Your savings may vary.
            </p>
          </Card>
        </div>
      </section>

      {/* Medicine Section */}
      <MedicineSection onNavigate={onNavigate} />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Crown className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-4xl mb-4">Ready to Upgrade?</h2>
          <p className="text-xl mb-8 opacity-90">
            Start your 30-day free trial of I Health Clinic PLUS today
          </p>
          <Button size="lg" variant="secondary" onClick={() => onNavigate("login")}>
            <Crown className="w-5 h-5 mr-2" />
            Start Free Trial
          </Button>
          <p className="mt-4 opacity-90">
            Cancel anytime • No credit card required for trial
          </p>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
