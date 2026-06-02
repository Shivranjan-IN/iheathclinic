import { Navigation } from "../common/Navigation";
import { Footer } from "../common/Footer";
import { Button } from "../common/ui/button";
import { Card } from "../common/ui/card";
import { Badge } from "../common/ui/badge";
import React from 'react';
import { PageView } from "../common/types";
import { TrendingUp, Heart, Activity, Brain, LineChart, Zap, CheckCircle, Users, Target } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { MedicineSection } from "./MedicineSection";

interface HealthInsightsProps {
  onNavigate: (view: PageView) => void;
}

export function HealthInsights({ onNavigate }: HealthInsightsProps) {
  const features = [
    { icon: TrendingUp, title: "Patient Dashboards with Trends", desc: "Visual representation of health metrics over time with intelligent trend analysis", color: "from-blue-500 to-cyan-500" },
    { icon: Heart, title: "Lifestyle Advice & Risk Forecasting", desc: "Personalized recommendations based on your health data and predictive risk assessment", color: "from-red-500 to-pink-500" },
    { icon: Brain, title: "Personalized Preventive Plans", desc: "Custom health plans designed to prevent potential health issues before they occur", color: "from-purple-500 to-pink-500" },
    { icon: Activity, title: "Real-time Health Monitoring", desc: "Continuous tracking of vitals with instant alerts for any anomalies", color: "from-green-500 to-teal-500" }
  ];

  const benefits = [
    {
      title: "Predictive Analytics",
      desc: "AI-powered predictions to identify health risks before they become serious",
      icon: Target,
      stats: "90% accuracy"
    },
    {
      title: "Trend Analysis",
      desc: "Track health metrics over time and understand patterns",
      icon: LineChart,
      stats: "Real-time tracking"
    },
    {
      title: "Personalized Insights",
      desc: "Get recommendations tailored to your unique health profile",
      icon: Users,
      stats: "100% customized"
    },
    {
      title: "Smart Alerts",
      desc: "Receive instant notifications for important health changes",
      icon: Zap,
      stats: "24/7 monitoring"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation onNavigate={onNavigate} onGetStarted={() => onNavigate("login")} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pink-900/20 to-purple-900/20 py-20 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-6 bg-pink-600">AI-Powered Health Intelligence</Badge>
              <h1 className="text-5xl mb-6 font-bold text-foreground">Health Insights & Analytics</h1>
              <p className="text-xl text-foreground/80 mb-8 font-medium">
                Transform your health data into actionable insights with AI-powered analytics. Make informed decisions about your wellbeing with personalized recommendations and predictive health scoring.
              </p>
              <div className="flex gap-4">
                <Button size="lg" onClick={() => onNavigate("login")}>
                  Start Free Analysis
                </Button>
                <Button size="lg" variant="outline" onClick={() => onNavigate("features")}>
                  Learn More
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div>
                  <div className="text-3xl text-pink-600 mb-1">95%</div>
                  <p className="text-sm text-foreground/70">Accuracy Rate</p>
                </div>
                <div>
                  <div className="text-3xl text-pink-600 mb-1">50K+</div>
                  <p className="text-sm text-foreground/70">Users Tracked</p>
                </div>
                <div>
                  <div className="text-3xl text-pink-600 mb-1">24/7</div>
                  <p className="text-sm text-foreground/70">Monitoring</p>
                </div>
              </div>
            </div>

            <div>
              <Card className="overflow-hidden shadow-2xl bg-card border-border">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1663354863388-9ced5806543a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwYW5hbHl0aWNzfGVufDF8fHx8MTc2MjMzNDI4Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Health Analytics Dashboard"
                  className="w-full"
                />
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-4 text-foreground font-bold">Comprehensive Health Intelligence</h2>
            <p className="text-xl text-foreground/80 max-w-3xl mx-auto font-medium">
              Our AI-powered platform analyzes your health data to provide actionable insights
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 hover:shadow-xl transition-all bg-card border-border">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl mb-4 text-foreground font-semibold">{feature.title}</h2>
                <p className="text-foreground/70 mb-6">{feature.desc}</p>
                <Button onClick={() => onNavigate("login")}>Try It Now</Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-pink-900/10 to-purple-900/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4 text-foreground font-bold">Advanced Health Tracking</h2>
            <p className="text-xl text-foreground/80 font-medium">Everything you need to stay on top of your health</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-all bg-card border-border">
                <benefit.icon className="w-12 h-12 text-pink-600 mx-auto mb-4" />
                <h3 className="mb-2 text-foreground font-semibold">{benefit.title}</h3>
                <p className="text-sm text-foreground/70 mb-3">{benefit.desc}</p>
                <Badge className="bg-pink-600">{benefit.stats}</Badge>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4 text-foreground font-bold">How It Works</h2>
            <p className="text-xl text-foreground/80 font-medium">Simple steps to better health insights</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center bg-card border-border">
              <div className="w-16 h-16 bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-pink-800/30">
                <span className="text-2xl text-pink-600">1</span>
              </div>
              <h3 className="text-xl mb-3 text-foreground font-semibold">Connect Your Data</h3>
              <p className="text-foreground/70">
                Sync your health devices, upload reports, or manually enter health metrics
              </p>
            </Card>

            <Card className="p-8 text-center bg-card border-border">
              <div className="w-16 h-16 bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-pink-800/30">
                <span className="text-2xl text-pink-600">2</span>
              </div>
              <h3 className="text-xl mb-3 text-foreground font-semibold">AI Analysis</h3>
              <p className="text-foreground/70">
                Our AI analyzes patterns, trends, and predicts potential health risks
              </p>
            </Card>

            <Card className="p-8 text-center bg-card border-border">
              <div className="w-16 h-16 bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-pink-800/30">
                <span className="text-2xl text-pink-600">3</span>
              </div>
              <h3 className="text-xl mb-3 text-foreground font-semibold">Get Insights</h3>
              <p className="text-foreground/70">
                Receive personalized recommendations and actionable health insights
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Tracked Metrics */}
      <section className="py-20 bg-gradient-to-br from-purple-900/10 to-pink-900/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4 text-foreground font-bold">What We Track</h2>
            <p className="text-xl text-foreground/80 font-medium">Comprehensive health monitoring across all vital metrics</p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              "Heart Rate", "Blood Pressure", "Blood Glucose", "Weight & BMI",
              "Sleep Quality", "Activity Levels", "Nutrition", "Mental Health",
              "Medications", "Lab Results", "Symptoms", "Vital Signs"
            ].map((metric, index) => (
              <Card key={index} className="p-4 text-center hover:shadow-md transition-all bg-card border-border">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-foreground font-medium">{metric}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Medicine Section */}
      <MedicineSection onNavigate={onNavigate} />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl mb-6">Get Your Health Score Today</h2>
          <p className="text-xl mb-8 text-pink-100">
            Comprehensive analysis of your health with actionable insights and personalized recommendations
          </p>
          <Button size="lg" variant="secondary" onClick={() => onNavigate("login")}>
            Start Health Assessment
          </Button>
          <p className="mt-4 text-pink-100">Free for first 30 days • No credit card required</p>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
