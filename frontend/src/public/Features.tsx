import { Navigation } from "../common/Navigation";
import { Footer } from "../common/Footer";
import { Button } from "../common/ui/button";
import { Card } from "../common/ui/card";
import { Badge } from "../common/ui/badge";
import React from 'react';
import { PageView } from "../common/types";
import { Video, Brain, TrendingUp, Activity, FlaskConical, CreditCard, Check, Zap, Shield, Clock, Users, Globe, Smartphone, Headphones, Lock, BarChart3, FileText, Calendar, Star } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { MedicineSection } from "./MedicineSection";

interface FeaturesProps {
  onNavigate: (view: PageView) => void;
}

export function Features({ onNavigate }: FeaturesProps) {
  const features = [
    {
      icon: Video,
      title: "Telemedicine",
      description: "Secure video consults with waiting room & chat.",
      whatToDo: "Book or start a video consult",
      howToDoIt: ["Select doctor", "Choose \"Online\" slot", "Click \"Start Video\""],
      image: "https://images.unsplash.com/photo-1758691461916-dc7894eb8f94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N0b3IlMjBjb25zdWx0YXRpb24lMjB0ZWxlbWVkaWNpbmV8ZW58MXx8fHwxNzYyNjY4NjgxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      icon: Brain,
      title: "AI Summarization",
      description: "One-click patient summaries and smart notes.",
      whatToDo: "Upload patient files or open a visit",
      howToDoIt: ["Open visit", "Click \"Generate Summary\"", "Review & edit"],
      image: "https://images.unsplash.com/photo-1758202292826-c40e172eed1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwdGVjaG5vbG9neSUyMEFJfGVufDF8fHx8MTc2MjQzNjkyOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      icon: TrendingUp,
      title: "Predictive Analytics",
      description: "Risk scores, trends and proactive alerts.",
      whatToDo: "Enable analytics for patient or clinic",
      howToDoIt: ["Sync vitals/records", "Run analytics", "Receive risk alerts"],
      image: "https://images.unsplash.com/photo-1695048441269-41b4d75351c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwYW5hbHl0aWNzJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjI2Njg2ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      icon: Activity,
      title: "IoT Integration",
      description: "Live vitals from wearables (HR, BP, glucose).",
      whatToDo: "Connect a device",
      howToDoIt: ["Go to Devices", "Pair device", "Start streaming"],
      image: "https://images.unsplash.com/photo-1663354863388-9ced5806543a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwYW5hbHl0aWNzfGVufDF8fHx8MTc2MjMzNDI4Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      icon: FlaskConical,
      title: "Lab & Pharmacy",
      description: "Send lab orders & prescriptions to partners.",
      whatToDo: "Order lab tests or send prescription",
      howToDoIt: ["Create order from visit", "Choose partner", "Track status"],
      image: "https://images.unsplash.com/photo-1599556147785-480f85376373?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYWJvcmF0b3J5JTIwbWVkaWNhbCUyMHRlc3RzfGVufDF8fHx8MTc2MjY0OTMyMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      icon: CreditCard,
      title: "Payments & Billing",
      description: "GST-ready invoices, Razorpay/Paytm support.",
      whatToDo: "Generate invoice and accept payment",
      howToDoIt: ["Issue invoice from visit", "Share payment link", "Mark paid"],
      image: "https://images.unsplash.com/photo-1646392206581-2527b1cae5cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaGFybWFjeSUyMG1lZGljaW5lJTIwcGlsbHN8ZW58MXx8fHwxNzYyNjEzMzM1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation onNavigate={onNavigate} onGetStarted={() => onNavigate("login")} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pink-900/20 to-purple-900/20 py-20 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-pink-600 text-white px-6 py-2">60+ Advanced Features</Badge>
          <h1 className="text-5xl mb-6 text-foreground font-bold">Powerful Features for Modern Healthcare</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Everything you need to deliver exceptional patient care, streamline operations, and grow your practice
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
            <div className="text-center">
              <div className="text-4xl mb-2 text-pink-600">1000+</div>
              <p className="text-muted-foreground">Active Doctors</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2 text-pink-600">50K+</div>
              <p className="text-muted-foreground">Patients Served</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2 text-pink-600">95%</div>
              <p className="text-muted-foreground">Satisfaction Rate</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2 text-pink-600">24/7</div>
              <p className="text-muted-foreground">Support Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            {features.map((feature, index) => (
              <div key={index} className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-2xl mb-6">
                    <feature.icon className="w-8 h-8 text-pink-600" />
                  </div>
                  <h2 className="text-3xl mb-4">Feature {index + 1}: {feature.title}</h2>
                  <p className="text-xl text-muted-foreground mb-6">{feature.description}</p>

                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-3 text-pink-600">What to do:</h3>
                      <p className="text-lg">{feature.whatToDo}</p>
                    </div>

                    <div>
                      <h3 className="mb-3 text-pink-600">How to do it:</h3>
                      <ol className="space-y-2">
                        {feature.howToDoIt.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="flex items-center justify-center w-6 h-6 bg-pink-600 text-white rounded-full flex-shrink-0 text-sm">
                              {idx + 1}
                            </span>
                            <span className="pt-0.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  <Button size="lg" className="mt-8" onClick={() => onNavigate("login")}>
                    Try This Feature
                  </Button>
                </div>

                <div className={index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                  <Card className="overflow-hidden shadow-2xl">
                    <ImageWithFallback
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-auto"
                    />
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 bg-gradient-to-br from-pink-900/10 to-purple-900/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4 text-foreground font-bold">Why Healthcare Providers Choose I Health Clinic</h2>
            <p className="text-xl text-muted-foreground">Join thousands of satisfied healthcare professionals</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl mb-3">Quick Setup</h3>
              <p className="text-muted-foreground">
                Get started in minutes with our intuitive onboarding process. No technical expertise required.
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl mb-3">Secure & Compliant</h3>
              <p className="text-muted-foreground">
                HIPAA compliant with end-to-end encryption. Your patient data is always protected.
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl mb-3">24/7 Support</h3>
              <p className="text-muted-foreground">
                Round-the-clock customer support to help you whenever you need assistance.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4">Complete Healthcare Management Suite</h2>
            <p className="text-xl text-muted-foreground">All the tools you need in one integrated platform</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, title: "Patient Management", desc: "Complete patient records & history" },
              { icon: Calendar, title: "Smart Scheduling", desc: "Automated appointment booking" },
              { icon: FileText, title: "Digital Prescriptions", desc: "E-prescriptions with drug database" },
              { icon: BarChart3, title: "Revenue Analytics", desc: "Track income & expenses" },
              { icon: Globe, title: "Multi-location", desc: "Manage multiple clinics" },
              { icon: Smartphone, title: "Mobile Apps", desc: "iOS & Android support" },
              { icon: Lock, title: "Data Security", desc: "Bank-grade encryption" },
              { icon: Headphones, title: "Expert Support", desc: "Dedicated account manager" }
            ].map((item, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4">Seamless Integrations</h2>
            <p className="text-xl text-muted-foreground">Connect with your existing tools and services</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8">
              <h3 className="text-xl mb-4">Payment Gateways</h3>
              <ul className="space-y-3">
                {["Razorpay", "Paytm", "PhonePe", "Google Pay", "UPI", "Credit/Debit Cards"].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-8">
              <h3 className="text-xl mb-4">Lab Partners</h3>
              <ul className="space-y-3">
                {["Thyrocare", "Dr. Lal PathLabs", "Metropolis", "SRL Diagnostics", "Apollo Diagnostics", "Vijaya Diagnostics"].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-8">
              <h3 className="text-xl mb-4">Pharmacy Networks</h3>
              <ul className="space-y-3">
                {["Apollo Pharmacy", "MedPlus", "Netmeds", "1mg", "PharmEasy", "Local Pharmacies"].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4">Trusted by Healthcare Professionals</h2>
            <p className="text-xl text-muted-foreground">See what doctors and clinics are saying</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Dr. Priya Sharma",
                role: "Cardiologist, Mumbai",
                content: "I Health Clinic's AI features have transformed how I practice. Patient summaries save me 30 minutes per consultation!",
                rating: 5
              },
              {
                name: "Dr. Rajesh Kumar",
                role: "Multi-Specialty Clinic Owner",
                content: "Managing 15 doctors and 200+ daily patients is now seamless. The analytics help us optimize everything.",
                rating: 5
              },
              {
                name: "Dr. Anita Desai",
                role: "Pediatrician, Delhi",
                content: "The telemedicine feature is a game-changer. I can now reach patients in remote areas easily.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
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
          <h2 className="text-4xl mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-pink-100">
            Experience all these features with our free 30-day trial
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => onNavigate("login")}>
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent text-white border-white hover:bg-white/10"
              onClick={() => onNavigate("pricing")}
            >
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
