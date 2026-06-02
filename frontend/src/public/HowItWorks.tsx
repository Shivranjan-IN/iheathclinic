import { Navigation } from "../common/Navigation";
import { Footer } from "../common/Footer";
import { Button } from "../common/ui/button";
import { Card } from "../common/ui/card";
import React from 'react';
import { PageView } from "../common/types";
import { Building2, Stethoscope, UserPlus, Calendar, Video, FlaskConical, TrendingUp, CheckCircle, ArrowRight, Users, Clock, Shield, Star, Zap, Award } from "lucide-react";
import { MedicineSection } from "./MedicineSection";

interface HowItWorksProps {
  onNavigate: (view: PageView) => void;
}

export function HowItWorks({ onNavigate }: HowItWorksProps) {
  const steps = [
    {
      icon: Building2,
      title: "Clinic Registers",
      description: "Create profile, invite staff",
      details: "Set up your clinic profile with basic information, upload necessary documents, and invite your medical staff to join the platform."
    },
    {
      icon: Stethoscope,
      title: "Doctor Onboards",
      description: "Verify ID, set schedule",
      details: "Doctors complete their verification process, set their availability schedule, and configure consultation preferences."
    },
    {
      icon: UserPlus,
      title: "Patient Signs Up",
      description: "Phone/ABHA registration",
      details: "Patients can register using their phone number or ABHA ID for seamless access to healthcare services."
    },
    {
      icon: Calendar,
      title: "Appointment Booking",
      description: "Online or in-clinic",
      details: "Book appointments easily through the platform for both teleconsultation and in-person visits."
    },
    {
      icon: Video,
      title: "Teleconsultation/Visit",
      description: "Join call, AI notes, e-Rx",
      details: "Conduct video consultations with AI-powered note-taking, generate prescriptions digitally, and maintain comprehensive records."
    },
    {
      icon: FlaskConical,
      title: "Lab/Pharmacy Order",
      description: "Digital tracking",
      details: "Send lab orders and prescriptions to partner pharmacies with real-time tracking and updates."
    },
    {
      icon: TrendingUp,
      title: "Follow-up & Analytics",
      description: "Risk alerts & preventive care",
      details: "Get intelligent health analytics, risk predictions, and automated follow-up reminders for continuous care."
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation onNavigate={onNavigate} onGetStarted={() => onNavigate("login")} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pink-900/20 to-purple-900/20 py-20 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl mb-6 text-foreground font-bold">How I Health Clinic Works</h1>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto font-medium">
            From registration to continuous care - see how I Health Clinic transforms the healthcare journey
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Vertical line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-pink-200" />

            <div className="space-y-12">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  {/* Step number circle */}
                  <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-pink-600 text-white rounded-full items-center justify-center z-10">
                    {index + 1}
                  </div>

                  {/* Content card */}
                  <div className={`md:w-5/12 ${index % 2 === 0 ? 'md:ml-auto md:pl-16' : 'md:pr-16'}`}>
                    <Card className="p-6 hover:shadow-xl transition-shadow">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <step.icon className="w-6 h-6 text-pink-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-1">{step.title}</h3>
                          <p className="text-sm text-pink-600">{step.description}</p>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{step.details}</p>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Video/Demo Section */}
      <section className="py-20 bg-gradient-to-br from-pink-900/10 to-purple-900/10 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl mb-6 text-foreground font-bold">See It In Action</h2>
          <p className="text-xl text-foreground/80 mb-8 font-medium">
            Watch how I Health Clinic simplifies healthcare management
          </p>
          <Card className="overflow-hidden shadow-2xl aspect-video bg-gray-900 flex items-center justify-center">
            <Button size="lg" variant="secondary" onClick={() => alert("Demo video coming soon!")}>
              <Video className="w-5 h-5 mr-2" />
              Watch Demo Video
            </Button>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4">Why Choose I Health Clinic?</h2>
            <p className="text-xl text-muted-foreground">The complete healthcare platform trusted by thousands</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-xl transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="mb-2">Easy Registration</h3>
                  <p className="text-sm text-muted-foreground">
                    Quick and simple onboarding process for clinics, doctors, and patients
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Video className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="mb-2">Seamless Consultations</h3>
                  <p className="text-sm text-muted-foreground">
                    High-quality video calls with integrated AI note-taking
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="mb-2">Smart Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Data-driven insights to improve patient outcomes
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FlaskConical className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="mb-2">Integrated Services</h3>
                  <p className="text-sm text-muted-foreground">
                    Connected lab tests and pharmacy services
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="mb-2">Automated Scheduling</h3>
                  <p className="text-sm text-muted-foreground">
                    Smart appointment management and reminders
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="mb-2">Continuous Care</h3>
                  <p className="text-sm text-muted-foreground">
                    Follow-ups and ongoing patient monitoring
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-pink-900/10 to-purple-900/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4 text-foreground font-bold">Trusted by Healthcare Leaders</h2>
            <p className="text-xl text-muted-foreground">Real impact on healthcare delivery</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Card className="p-8 text-center hover:shadow-xl transition-all">
              <Users className="w-12 h-12 text-pink-600 mx-auto mb-4" />
              <div className="text-4xl mb-2 text-pink-600">1000+</div>
              <p className="text-muted-foreground">Doctors Onboarded</p>
            </Card>

            <Card className="p-8 text-center hover:shadow-xl transition-all">
              <Building2 className="w-12 h-12 text-pink-600 mx-auto mb-4" />
              <div className="text-4xl mb-2 text-pink-600">250+</div>
              <p className="text-muted-foreground">Partner Clinics</p>
            </Card>

            <Card className="p-8 text-center hover:shadow-xl transition-all">
              <Video className="w-12 h-12 text-pink-600 mx-auto mb-4" />
              <div className="text-4xl mb-2 text-pink-600">100K+</div>
              <p className="text-muted-foreground">Consultations Done</p>
            </Card>

            <Card className="p-8 text-center hover:shadow-xl transition-all">
              <Star className="w-12 h-12 text-pink-600 mx-auto mb-4" />
              <div className="text-4xl mb-2 text-pink-600">4.9/5</div>
              <p className="text-muted-foreground">Average Rating</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4">Platform Highlights</h2>
            <p className="text-xl text-muted-foreground">Everything you need in one place</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 hover:shadow-lg transition-all">
              <Zap className="w-10 h-10 text-yellow-600 mb-4" />
              <h3 className="mb-2">Fast Setup</h3>
              <p className="text-sm text-muted-foreground">Go live in under 10 minutes with guided onboarding</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all">
              <Shield className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="mb-2">Secure & Compliant</h3>
              <p className="text-sm text-muted-foreground">HIPAA compliant with bank-level encryption</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all">
              <Clock className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="mb-2">24/7 Availability</h3>
              <p className="text-sm text-muted-foreground">Round-the-clock support and uptime</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all">
              <Award className="w-10 h-10 text-purple-600 mb-4" />
              <h3 className="mb-2">Award Winning</h3>
              <p className="text-sm text-muted-foreground">Recognized for innovation in healthcare</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Medicine Section */}
      <MedicineSection onNavigate={onNavigate} />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl mb-4">Ready to Transform Your Practice?</h2>
          <p className="text-xl mb-8 text-pink-100">
            Join thousands of healthcare providers already using I Health Clinic
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => onNavigate("login")}>
              Get Started Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent text-white border-white hover:bg-white/10"
              onClick={() => onNavigate("contact")}
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
