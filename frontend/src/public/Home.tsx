import { Button } from "../common/ui/button";
import { Card } from "../common/ui/card";
import { Badge } from "../common/ui/badge";
import { useState, useEffect } from "react";
import {
  Video,
  Brain,
  TrendingUp,
  Activity,
  Star,
  Sparkles,
  ArrowRight,
  Zap
} from "lucide-react";
import { Navigation } from "../common/Navigation";
import { Footer } from "../common/Footer";
import { PageView } from "../common/types";

interface HomeProps {
  onGetStarted: () => void;
  onNavigate: (view: PageView) => void;
}

export function Home({ onGetStarted, onNavigate }: HomeProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const features = [
    {
      icon: Video,
      title: "Telemedicine",
      description: "Secure video consultations with doctors from anywhere, anytime"
    },
    {
      icon: Brain,
      title: "AI Health Summaries",
      description: "AI-powered reports that explain medical data in simple language"
    },
    {
      icon: TrendingUp,
      title: "Health Analytics",
      description: "Track your health trends with intelligent insights and predictions"
    },
    {
      icon: Activity,
      title: "IoT Integration",
      description: "Connect wearables and health devices for real-time monitoring"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <Navigation onNavigate={onNavigate} />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-pink-900/20 via-purple-900/20 to-blue-900/20 py-12 sm:py-16 lg:py-20 border-b border-border overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`space-y-6 sm:space-y-8 text-center lg:text-left ${isLoaded ? 'animate-fade-in' : 'opacity-0'} w-full lg:w-auto`}>
              <div className="space-y-4">
                <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0 px-3 sm:px-4 py-2 text-xs sm:text-sm shadow-lg">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  AI-Powered Healthcare Platform
                </Badge>
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight">
                  Your health, our priority. <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Digitally.</span>
                </h1>
                <p className="text-base sm:text-lg lg:text-xl font-medium leading-relaxed text-foreground/80 max-w-3xl">
                  Connect patients, doctors, and clinics on one unified platform. Get AI-powered health insights, telemedicine, and seamless care management.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start w-full sm:w-auto">
                <Button onClick={onGetStarted} className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Book Consult
                </Button>
                <Button variant="outline" onClick={() => onNavigate("features")} className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4">
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Explore Features
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 mt-6 sm:mt-8 p-4 sm:p-6 bg-card/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-border">
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/70">
                    1000+ doctors trust us
                  </p>
                </div>
                <div className="hidden sm:block h-8 w-px bg-border"></div>
                <div className="text-center sm:text-left">
                  <p className="text-sm text-foreground/70">
                    Available in
                  </p>
                  <p className="font-semibold text-base">English & Hindi</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-card border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <h2 className="text-3xl sm:text-4xl mb-4 text-foreground font-bold">Core Features</h2>
              <p className="text-base sm:text-xl text-foreground/80 max-w-2xl mx-auto font-medium">
                Everything you need to deliver exceptional healthcare experiences
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-6 lg:gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="p-4 sm:p-6 hover:shadow-xl transition-shadow bg-card border-border">
                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-900/30 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-pink-800/30">
                      <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
                    </div>
                    <h3 className="text-lg sm:text-xl mb-2 text-foreground font-semibold text-center">{feature.title}</h3>
                    <p className="text-sm sm:text-base text-foreground/70">{feature.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-pink-600 to-purple-600 text-white">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl mb-4">Ready to Transform Healthcare?</h2>
            <p className="text-xl mb-8 text-pink-100">
              Join thousands of healthcare providers already using I Health Clinic
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="secondary" onClick={onGetStarted}>
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" onClick={() => onNavigate("contact")} className="bg-transparent text-white border-white hover:bg-white/10">
                Schedule Demo
              </Button>
            </div>
            <p className="mt-6 text-pink-100">No credit card required • Free 30-day trial</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
