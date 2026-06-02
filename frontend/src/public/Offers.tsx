import { Navigation } from "../common/Navigation";
import { Footer } from "../common/Footer";
import { Button } from "../common/ui/button";
import { Card } from "../common/ui/card";
import { Badge } from "../common/ui/badge";
import { PageView } from "../common/types";
import React from 'react';
import { Tag, Gift, Percent, Users, Clock, Zap, Trophy, Sparkles, Star } from "lucide-react";
import { MedicineSection } from "./MedicineSection";

interface OffersProps {
  onNavigate: (view: PageView) => void;
}

export function Offers({ onNavigate }: OffersProps) {
  const offers = [
    {
      icon: Tag,
      title: "Diwali Special Offer",
      discount: "30% OFF",
      description: "Get 30% off on Professional Plan - Limited time offer!",
      code: "DIWALI30",
      validTill: "December 31, 2025",
      color: "from-orange-500 to-red-500",
      badge: "🔥 Hot Deal"
    },
    {
      icon: Users,
      title: "Referral Bonus Program",
      discount: "₹1000 Credit",
      description: "Refer a doctor and earn ₹1000 credit when they subscribe",
      code: "REFER1000",
      validTill: "Ongoing",
      color: "from-blue-500 to-purple-500",
      badge: "💰 Earn More"
    },
    {
      icon: Percent,
      title: "Partner Lab Discounts",
      discount: "Up to 70% OFF",
      description: "Exclusive discounts on lab tests with partner labs",
      code: "LABTEST70",
      validTill: "Ongoing",
      color: "from-green-500 to-teal-500",
      badge: "🎯 Best Value"
    },
    {
      icon: Gift,
      title: "Pharmacy Savings",
      discount: "Up to 50% OFF",
      description: "Save big on medicines with partner pharmacies",
      code: "MEDS50",
      validTill: "Ongoing",
      color: "from-pink-500 to-purple-500",
      badge: "💊 Save More"
    }
  ];

  const seasonalOffers = [
    { title: "New Year Health Checkup", discount: "40% OFF", valid: "Jan 1-15, 2025" },
    { title: "Women's Day Special", discount: "₹500 OFF", valid: "March 8-10, 2025" },
    { title: "Summer Health Package", discount: "35% OFF", valid: "Apr-Jun 2025" },
    { title: "Monsoon Immunity Boost", discount: "25% OFF", valid: "Jul-Sep 2025" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation onNavigate={onNavigate} onGetStarted={() => onNavigate("login")} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pink-900/20 to-purple-900/20 py-20 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full mb-6">
            <Tag className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl mb-6 font-bold text-foreground">Special Offers & Deals</h1>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto mb-8 font-medium">
            Save more with our exclusive offers and partner discounts. Limited time deals on healthcare services!
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-12">
            <div>
              <div className="text-4xl mb-2">70%</div>
              <p className="text-foreground/70">Max Discount</p>
            </div>
            <div>
              <div className="text-4xl mb-2">₹5000+</div>
              <p className="text-foreground/70">Avg. Savings</p>
            </div>
            <div>
              <div className="text-4xl mb-2">20+</div>
              <p className="text-foreground/70">Active Offers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Offers */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4 text-foreground font-bold">Exclusive Offers</h2>
            <p className="text-xl text-foreground/80 font-medium">Limited time deals you don't want to miss</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {offers.map((offer, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-2xl transition-all bg-card border-border">
                <div className={`bg-gradient-to-r ${offer.color} p-6 text-white relative`}>
                  <Badge className="absolute top-4 right-4 bg-white text-gray-900">{offer.badge}</Badge>
                  <div className="flex items-start justify-between mb-4">
                    <offer.icon className="w-12 h-12" />
                    <Badge className="bg-white/20 backdrop-blur text-white text-lg px-4 py-1">
                      {offer.discount}
                    </Badge>
                  </div>
                  <h2 className="text-2xl mb-2">{offer.title}</h2>
                  <p className="opacity-90">{offer.description}</p>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-foreground/70 mb-1">Promo Code</p>
                      <p className="text-lg font-mono bg-pink-900/20 px-4 py-2 rounded border border-pink-800/30">{offer.code}</p>
                    </div>
                    <Button variant="outline" onClick={() => {
                      navigator.clipboard.writeText(offer.code);
                      alert("Code copied to clipboard!");
                    }}>
                      Copy Code
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground/70">
                    <Clock className="w-4 h-4" />
                    <span>Valid till: {offer.validTill}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Seasonal Offers */}
      <section className="py-20 bg-gradient-to-br from-purple-900/10 to-pink-900/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4 text-foreground font-bold">Seasonal Offers</h2>
            <p className="text-xl text-foreground/80 font-medium">Mark your calendar for these special deals</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {seasonalOffers.map((offer, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-all bg-card border-border">
                <Sparkles className="w-10 h-10 text-pink-600 mx-auto mb-4" />
                <h3 className="mb-2 text-foreground font-semibold">{offer.title}</h3>
                <Badge className="mb-3 bg-pink-600">{offer.discount}</Badge>
                <p className="text-sm text-foreground/70">{offer.valid}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How to Use */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4 text-foreground font-bold">How to Redeem Offers</h2>
            <p className="text-xl text-foreground/80 font-medium">Follow these simple steps</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <Card className="p-6 text-center bg-card border-border">
              <div className="w-12 h-12 bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-pink-800/30">
                <span className="text-xl text-pink-600">1</span>
              </div>
              <h3 className="mb-2 text-foreground font-semibold">Choose Offer</h3>
              <p className="text-sm text-foreground/70">Select the offer that suits you best</p>
            </Card>

            <Card className="p-6 text-center bg-card border-border">
              <div className="w-12 h-12 bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-pink-800/30">
                <span className="text-xl text-pink-600">2</span>
              </div>
              <h3 className="mb-2 text-foreground font-semibold">Copy Code</h3>
              <p className="text-sm text-foreground/70">Click to copy the promo code</p>
            </Card>

            <Card className="p-6 text-center bg-card border-border">
              <div className="w-12 h-12 bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-pink-800/30">
                <span className="text-xl text-pink-600">3</span>
              </div>
              <h3 className="mb-2 text-foreground font-semibold">Apply at Checkout</h3>
              <p className="text-sm text-foreground/70">Paste code during payment</p>
            </Card>

            <Card className="p-6 text-center bg-card border-border">
              <div className="w-12 h-12 bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-pink-800/30">
                <span className="text-xl text-pink-600">4</span>
              </div>
              <h3 className="mb-2 text-foreground font-semibold">Save Money</h3>
              <p className="text-sm text-foreground/70">Enjoy your discount!</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Loyalty Program */}
      <section className="py-20 bg-gradient-to-br from-pink-900/10 to-purple-900/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Trophy className="w-16 h-16 text-yellow-500 mb-6" />
              <h2 className="text-4xl mb-4 text-foreground font-bold">I Health Clinic Loyalty Program</h2>
              <p className="text-xl text-foreground/80 mb-6 font-medium">
                Earn points on every purchase and unlock exclusive rewards
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Earn 1 point for every ₹10 spent",
                  "Get exclusive member-only discounts",
                  "Early access to new features",
                  "Birthday special offers",
                  "Refer friends and earn bonus points"
                ].map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/90">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" onClick={() => onNavigate("login")}>
                Join Loyalty Program
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card className="p-6 text-center bg-card border-border">
                <Zap className="w-10 h-10 text-orange-500 mx-auto mb-3" />
                <div className="text-3xl mb-2">500</div>
                <p className="text-sm text-foreground/70">Points = ₹50 OFF</p>
              </Card>
              <Card className="p-6 text-center bg-card border-border">
                <Gift className="w-10 h-10 text-pink-500 mx-auto mb-3" />
                <div className="text-3xl mb-2">1000</div>
                <p className="text-sm text-foreground/70">Points = ₹120 OFF</p>
              </Card>
              <Card className="p-6 text-center bg-card border-border">
                <Trophy className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
                <div className="text-3xl mb-2">2500</div>
                <p className="text-sm text-foreground/70">Points = ₹350 OFF</p>
              </Card>
              <Card className="p-6 text-center bg-card border-border">
                <Sparkles className="w-10 h-10 text-purple-500 mx-auto mb-3" />
                <div className="text-3xl mb-2">5000</div>
                <p className="text-sm text-foreground/70">Points = ₹800 OFF</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Medicine Section */}
      <MedicineSection onNavigate={onNavigate} />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl mb-6">Want More Exclusive Offers?</h2>
          <p className="text-xl mb-8 text-pink-100">
            Subscribe to I Health Clinic PLUS for additional 5% savings on all orders plus early access to special deals
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => onNavigate("plus")}>
              Get I Health Clinic PLUS
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10" onClick={() => onNavigate("pricing")}>
              View All Plans
            </Button>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
