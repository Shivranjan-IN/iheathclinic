import React from 'react';
import { Navigation } from "../common/Navigation";
import { Footer } from "../common/Footer";
import { Button } from "../common/ui/button";
import { Card } from "../common/ui/card";
import { Badge } from "../common/ui/badge";
import { PageView } from "../common/types";
import {
  Brain,
  Mic,
  Volume2,
  FileText,
  Activity,
  Sparkles,
  MessageSquare,
  Heart,
  Stethoscope,
  Users,
  TrendingUp,
  Award
} from "lucide-react";

interface HealthcareProps {
  onNavigate: (view: PageView) => void;
}

export function Healthcare({ onNavigate }: HealthcareProps) {
  const features = [
    {
      icon: Brain,
      title: "AI Symptom Checker",
      description: "Describe your symptoms and get instant AI-powered analysis with specialist recommendations",
      gradient: "from-pink-500 to-purple-600",
      features: [
        "Natural language input (English/Hindi)",
        "95% diagnostic accuracy",
        "Instant specialist suggestions",
        "Symptom severity assessment"
      ],
      demo: true
    },
    {
      icon: Mic,
      title: "Voice-to-Text Input",
      description: "Speak your symptoms naturally in English or Hindi - AI transcribes and analyzes",
      gradient: "from-green-500 to-teal-600",
      features: [
        "Bilingual voice recognition",
        "Medical terminology correction",
        "Real-time transcription",
        "Hands-free operation"
      ],
      demo: true
    },
    {
      icon: FileText,
      title: "Medical Report Explainer",
      description: "Upload any medical report and get simple explanations in your language",
      gradient: "from-blue-500 to-cyan-600",
      features: [
        "Supports PDF, images, scans",
        "20+ report types supported",
        "Bilingual explanations",
        "Normal range indicators"
      ],
      demo: true
    },
    {
      icon: Activity,
      title: "X-Ray & Scan Analysis",
      description: "AI-powered analysis of X-rays, CT scans, and MRIs with detailed explanations",
      gradient: "from-purple-500 to-pink-600",
      features: [
        "Instant scan analysis",
        "Abnormality detection",
        "Interactive Q&A chatbot",
        "Doctor-verified models"
      ],
      demo: true
    },
    {
      icon: Volume2,
      title: "Text-to-Speech Reports",
      description: "Listen to your health reports and prescriptions in audio format",
      gradient: "from-orange-500 to-red-600",
      features: [
        "Natural voice quality",
        "Multiple languages",
        "Adjustable speed",
        "Accessibility friendly"
      ],
      demo: true
    },
    {
      icon: MessageSquare,
      title: "AI Health Assistant",
      description: "24/7 AI chatbot to answer your medical questions based on your health records",
      gradient: "from-yellow-500 to-orange-600",
      features: [
        "Context-aware responses",
        "Personalized to your history",
        "Instant answers",
        "Escalate to doctor if needed"
      ],
      demo: true
    }
  ];

  const stats = [
    { icon: Users, value: "50,000+", label: "Active Patients" },
    { icon: Stethoscope, value: "1,200+", label: "Verified Doctors" },
    { icon: TrendingUp, value: "95%", label: "AI Accuracy" },
    { icon: Award, value: "4.9/5", label: "Patient Rating" }
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Sign Up & Complete Profile",
      description: "Create your account and add your medical history securely",
      icon: Users
    },
    {
      step: 2,
      title: "Use AI Tools",
      description: "Access symptom checker, report explainer, and voice input",
      icon: Brain
    },
    {
      step: 3,
      title: "Get Instant Analysis",
      description: "AI analyzes your input and provides comprehensive insights",
      icon: Activity
    },
    {
      step: 4,
      title: "Connect with Doctors",
      description: "Book appointments with recommended specialists",
      icon: Stethoscope
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation onNavigate={onNavigate} onGetStarted={() => onNavigate("login")} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-pink-900/20 via-purple-900/20 to-blue-900/20 py-24 overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-6 px-6 py-2 text-base bg-gradient-to-r from-pink-600 to-purple-600 text-white border-0">
              <Heart className="w-4 h-4 mr-2" />
              AI-Powered Healthcare Platform
            </Badge>
            <h1 className="text-6xl mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent font-bold">
              Your Complete Healthcare Solution
            </h1>
            <p className="text-xl text-foreground/80 max-w-3xl mx-auto mb-8 font-medium">
              Experience next-generation healthcare with AI-powered diagnosis, telemedicine, medicine delivery, lab tests, and comprehensive health management - all in one platform
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" onClick={() => onNavigate("login")} className="bg-gradient-to-r from-pink-600 to-purple-600 text-lg px-8">
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8">
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mt-16">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow bg-card border-border">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-900/30 to-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-3 border border-pink-800/30">
                  <stat.icon className="w-6 h-6 text-pink-600" />
                </div>
                <div className="text-3xl mb-1 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent font-bold">
                  {stat.value}
                </div>
                <p className="text-sm text-foreground/70 font-medium">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features Grid */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-4 text-foreground font-bold">Powerful AI Health Tools</h2>
            <p className="text-xl text-foreground/80 max-w-3xl mx-auto font-medium">
              Advanced artificial intelligence to help you understand your health better
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-2xl transition-all duration-300 border-2 hover:border-pink-500/50 bg-card border-border">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl mb-3 text-foreground font-semibold">{feature.title}</h3>
                <p className="text-foreground/70 mb-4">{feature.description}</p>

                <div className="space-y-2 mb-4">
                  {feature.features.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <Sparkles className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{item}</span>
                    </div>
                  ))}
                </div>

                {feature.demo && (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => onNavigate("login")}
                  >
                    Try Demo
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-pink-900/10 to-purple-900/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-4 text-foreground font-bold">How It Works</h2>
            <p className="text-xl text-foreground/80 font-medium">
              Get started in just 4 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative">
                <Card className="p-6 text-center h-full hover:shadow-lg transition-shadow bg-card border-border">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-900/30 to-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-4 border border-pink-800/30">
                    <item.icon className="w-6 h-6 text-pink-600" />
                  </div>
                  <h3 className="mb-2 text-foreground font-semibold">{item.title}</h3>
                  <p className="text-sm text-foreground/70">{item.description}</p>
                </Card>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/4 -right-4 w-8 h-0.5 bg-gradient-to-r from-pink-600 to-purple-600"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-4 text-foreground font-bold">Complete Healthcare Services</h2>
            <p className="text-xl text-foreground/80 font-medium">
              Everything you need for better health management
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-2xl transition-all bg-card border-border">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Stethoscope className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl mb-3 text-foreground font-semibold">Doctor Consultations</h3>
              <p className="text-foreground/70 mb-6">
                Book in-person or video consultations with verified doctors
              </p>
              <Button className="w-full" onClick={() => onNavigate("login")}>
                Book Consultation
              </Button>
            </Card>

            <Card className="p-8 text-center hover:shadow-2xl transition-all bg-card border-border">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl mb-3 text-foreground font-semibold">Medicine Delivery</h3>
              <p className="text-foreground/70 mb-6">
                Order medicines online with doorstep delivery
              </p>
              <Button className="w-full" onClick={() => onNavigate("medicine")}>
                Order Medicine
              </Button>
            </Card>

            <Card className="p-8 text-center hover:shadow-2xl transition-all bg-card border-border">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Activity className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl mb-3 text-foreground font-semibold">Lab Tests at Home</h3>
              <p className="text-foreground/70 mb-6">
                Book lab tests with home sample collection
              </p>
              <Button className="w-full" onClick={() => onNavigate("login")}>
                Book Lab Test
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-5xl mb-4 text-white font-bold">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-pink-100">
            Join 50,000+ patients experiencing better healthcare with I Health Clinic
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" variant="secondary" onClick={() => onNavigate("login")} className="text-lg px-8">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20 text-lg px-8">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
