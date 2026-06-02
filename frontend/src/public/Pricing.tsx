import { Navigation } from "../common/Navigation";
import { Footer } from "../common/Footer";
import { Button } from "../common/ui/button";
import { Card } from "../common/ui/card";
import { Badge } from "../common/ui/badge";
import { PageView } from "../common/types";
import React from 'react';
import { Check, X } from "lucide-react";
import { useState } from "react";
import { MedicineSection } from "./MedicineSection";

interface PricingProps {
  onNavigate: (view: PageView) => void;
}

export function Pricing({ onNavigate }: PricingProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      name: "Starter",
      price: "Free",
      period: "",
      description: "Perfect for individual practitioners",
      features: [
        { text: "1 doctor", included: true },
        { text: "Up to 10 patients", included: true },
        { text: "Telemedicine", included: true },
        { text: "E-Prescriptions", included: true },
        { text: "AI Summarization", included: false },
        { text: "IoT Integration", included: false },
        { text: "Analytics Dashboard", included: false },
        { text: "24/7 Support", included: false }
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Professional",
      price: billingPeriod === "monthly" ? "₹4,999" : "₹47,990",
      period: billingPeriod === "monthly" ? "/ doctor / month" : "/ doctor / year",
      description: "For growing practices and clinics",
      features: [
        { text: "Unlimited patients", included: true },
        { text: "AI Summarization", included: true },
        { text: "IoT Integration", included: true },
        { text: "Analytics Dashboard", included: true },
        { text: "Lab & Pharmacy Integration", included: true },
        { text: "24/7 Support", included: true },
        { text: "Custom Branding", included: true },
        { text: "API Access", included: false }
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large hospitals and chains",
      features: [
        { text: "All Professional features", included: true },
        { text: "On-premise deployment", included: true },
        { text: "Dedicated Account Manager", included: true },
        { text: "Custom integrations", included: true },
        { text: "HIPAA & NDHM compliance", included: true },
        { text: "Advanced analytics & reporting", included: true },
        { text: "Unlimited API access", included: true },
        { text: "White-label solution", included: true }
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation onNavigate={onNavigate} onGetStarted={() => onNavigate("login")} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pink-900/20 to-purple-900/20 py-20 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-pink-600 text-white px-6 py-2">Flexible Pricing Plans</Badge>
          <h1 className="text-5xl mb-6 text-foreground font-bold">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Choose the plan that fits your practice. No hidden fees, cancel anytime. Save 20% with annual billing.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-white rounded-full p-1 shadow-md">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-2 rounded-full transition-colors ${billingPeriod === "monthly" ? "bg-pink-600 text-white" : "text-gray-600"
                }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-6 py-2 rounded-full transition-colors ${billingPeriod === "yearly" ? "bg-pink-600 text-white" : "text-gray-600"
                }`}
            >
              Yearly
              <Badge className="ml-2 bg-green-500">Save 20%</Badge>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-12">
            <div>
              <div className="text-3xl mb-2">30 Days</div>
              <p className="text-sm text-muted-foreground">Free Trial</p>
            </div>
            <div>
              <div className="text-3xl mb-2">1000+</div>
              <p className="text-sm text-muted-foreground">Happy Clinics</p>
            </div>
            <div>
              <div className="text-3xl mb-2">24/7</div>
              <p className="text-sm text-muted-foreground">Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative p-8 ${plan.popular ? 'border-pink-600 border-2 shadow-2xl' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-pink-600 text-white px-4 py-1">Most Popular</Badge>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="mb-2">
                    <span className="text-4xl">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground ml-1">{plan.period}</span>}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? "" : "text-muted-foreground"}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                  onClick={() => plan.name === "Enterprise" ? onNavigate("contact") : onNavigate("login")}
                >
                  {plan.cta}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-pink-900/10 to-purple-900/10 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl mb-12 text-center text-foreground font-bold">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "Can I change plans later?",
                a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately."
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, debit cards, UPI, and net banking through Razorpay and Paytm."
              },
              {
                q: "Is there a contract or can I cancel anytime?",
                a: "No contracts required. Cancel anytime with no penalties. You'll have access until the end of your billing period."
              },
              {
                q: "Do you offer discounts for multiple doctors?",
                a: "Yes! Contact our sales team for volume discounts on Professional and Enterprise plans."
              }
            ].map((faq, index) => (
              <Card key={index} className="p-6">
                <h3 className="mb-2">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Medicine Section */}
      <MedicineSection onNavigate={onNavigate} />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl mb-4">Start Your Free Trial Today</h2>
          <p className="text-xl mb-8 text-pink-100">
            No credit card required • 30-day free trial • Cancel anytime
          </p>
          <Button size="lg" variant="secondary" onClick={() => onNavigate("login")}>
            Get Started Free
          </Button>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
