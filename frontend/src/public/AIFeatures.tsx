import React from 'react';
import { Navigation } from "../common/Navigation";
import { Footer } from "../common/Footer";
import { Button } from "../common/ui/button";
import { Card } from "../common/ui/card";
import { Badge } from "../common/ui/badge";
import { PageView } from "../common/types";
import { Brain, Mic, Volume2, Shield, TrendingUp, FileText, Activity, Sparkles } from "lucide-react";

interface AIFeaturesEnhancedProps {
  onNavigate: (view: PageView) => void;
}

export function AIFeaturesEnhanced({ onNavigate }: AIFeaturesEnhancedProps) {
  const aiFeatures = [
    {
      icon: Brain,
      title: "AI Symptom Checker & Diagnosis",
      description: "Intelligent symptom analysis with specialist recommendations",
      gradient: "from-pink-500 to-purple-600",
      steps: [
        "Describe your symptoms in natural language",
        "AI analyzes symptoms against medical database",
        "Get probable conditions and severity assessment",
        "Receive specialist doctor recommendations"
      ],
      example: "Patient enters 'fever, headache, body ache' → AI suggests viral infection (85% confidence) and recommends General Physician consultation",
      benefits: ["Multi-language support", "Voice input enabled", "95% accuracy rate"]
    },
    {
      icon: FileText,
      title: "Medical Report Explainer",
      description: "Convert complex medical reports into simple language",
      gradient: "from-blue-500 to-cyan-600",
      steps: [
        "Upload your medical report (PDF, image, or scan)",
        "AI extracts and analyzes medical data",
        "Get simple explanations for each parameter",
        "Understand if values are normal or concerning"
      ],
      example: "Upload CBC report → AI explains 'Hemoglobin 14.2 g/dL means your oxygen-carrying capacity is healthy and within normal range (13.5-17.5)'",
      benefits: ["Supports 20+ report types", "Bilingual explanations", "Audio summary available"]
    },
    {
      icon: Activity,
      title: "X-Ray & Scan Analysis",
      description: "AI-powered analysis of medical imaging with detailed insights",
      gradient: "from-purple-500 to-pink-600",
      steps: [
        "Upload X-ray, CT scan, or MRI image",
        "AI detects abnormalities and patterns",
        "Get patient-friendly explanation",
        "Ask follow-up questions via chatbot"
      ],
      example: "Upload chest X-ray → AI identifies 'Clear lung fields bilaterally, normal heart size, no fractures detected' with detailed breakdown",
      benefits: ["Instant analysis", "Interactive Q&A", "Doctor-verified AI models"]
    },
    {
      icon: Mic,
      title: "Voice-to-Text Health Input",
      description: "Speak your symptoms in English or Hindi",
      gradient: "from-green-500 to-teal-600",
      steps: [
        "Click microphone and start speaking",
        "AI transcribes in real-time",
        "Auto-corrects medical terminology",
        "Converts to structured health data"
      ],
      example: "Patient says 'Mujhe sar mein dard aur bukhar hai' → AI transcribes and translates to 'Headache and fever' for doctor review",
      benefits: ["Hindi + English support", "Automatic punctuation", "Medical term recognition"]
    },
    {
      icon: Volume2,
      title: "Text-to-Speech Health Reports",
      description: "Listen to your health reports and prescriptions",
      gradient: "from-orange-500 to-red-600",
      steps: [
        "Select any report or prescription",
        "Click 'Listen' button",
        "AI reads content in your language",
        "Pause, replay, or adjust speed"
      ],
      example: "Prescription: 'Metformin 500mg, twice daily after meals' → AI speaks clearly in patient's preferred language",
      benefits: ["Natural voice quality", "Multiple languages", "Accessibility friendly"]
    },
    {
      icon: TrendingUp,
      title: "Predictive Health Analytics",
      description: "Predict health risks based on your medical history",
      gradient: "from-yellow-500 to-orange-600",
      steps: [
        "AI analyzes your health records",
        "Identifies patterns and risk factors",
        "Calculates disease probability scores",
        "Provides preventive care recommendations"
      ],
      example: "Patient: 45yrs, High BP, Family diabetes history → AI predicts 68% cardiovascular risk in 5 years, suggests lifestyle modifications",
      benefits: ["Evidence-based predictions", "Personalized recommendations", "Early warning system"]
    }
  ];

  const securityFeatures = [
    {
      icon: Shield,
      title: "Data hosted in India",
      description: "AWS / GCP infrastructure with full compliance",
      badge: "HIPAA Compliant"
    },
    {
      icon: Shield,
      title: "End-to-end encryption",
      description: "Military-grade AES-256 encryption for all patient data",
      badge: "ISO 27001"
    },
    {
      icon: Activity,
      title: "NDHM / ABHA support",
      description: "FHIR-ready integration with Ayushman Bharat Digital Mission",
      badge: "ABDM Certified"
    },
    {
      icon: FileText,
      title: "Audit logs & RBAC",
      description: "Complete visibility and role-based access control",
      badge: "SOC 2"
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation onNavigate={onNavigate} onGetStarted={() => onNavigate("login")} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-pink-900/20 via-purple-900/20 to-blue-900/20 py-24 overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Badge className="mb-6 px-6 py-2 text-base bg-gradient-to-r from-pink-600 to-purple-600 text-white border-0">
            <Sparkles className="w-4 h-4 mr-2" />
            Powered by Advanced AI
          </Badge>
          <h1 className="text-6xl mb-6 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI & Advanced Features
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Cutting-edge artificial intelligence to enhance diagnosis, reduce workload, and improve patient outcomes
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" onClick={() => onNavigate("login")} className="bg-gradient-to-r from-pink-600 to-purple-600">
              Try AI Features Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => onNavigate("healthcare")}>
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-4">Our AI-Powered Tools</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience healthcare powered by cutting-edge artificial intelligence
            </p>
          </div>

          <div className="space-y-20">
            {aiFeatures.map((feature, index) => (
              <div key={index} className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl mb-6 shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl mb-4">{feature.title}</h2>
                  <p className="text-xl text-muted-foreground mb-6">{feature.description}</p>

                  {/* Benefits */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {feature.benefits.map((benefit, idx) => (
                      <Badge key={idx} variant="secondary" className="px-3 py-1">
                        {benefit}
                      </Badge>
                    ))}
                  </div>

                  {/* Steps */}
                  <div className="mb-6">
                    <h3 className="mb-3 text-pink-600">How it works:</h3>
                    <ol className="space-y-3">
                      {feature.steps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className={`flex items-center justify-center w-7 h-7 bg-gradient-to-br ${feature.gradient} text-white rounded-full flex-shrink-0 text-sm shadow-md`}>
                            {idx + 1}
                          </span>
                          <span className="pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Example */}
                  <Card className={`p-6 border-l-4 border-pink-600 bg-gradient-to-br from-pink-900/10 to-purple-900/10`}>
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="mb-2 text-pink-600">Real Example:</h4>
                        <p className="text-muted-foreground">{feature.example}</p>
                      </div>
                    </div>
                  </Card>

                  <Button className="mt-6" size="lg" onClick={() => onNavigate("login")}>
                    Try This Feature
                  </Button>
                </div>

                <div className={index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                  <Card className={`p-8 bg-gradient-to-br ${feature.gradient} shadow-2xl`}>
                    <div className="aspect-square bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <feature.icon className="w-32 h-32 text-white" />
                    </div>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="py-20 bg-gradient-to-br from-pink-900/10 to-purple-900/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl mb-4">Security, Compliance & Interoperability</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Enterprise-grade security with full regulatory compliance
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {securityFeatures.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="mb-1">{feature.title}</h3>
                      <Badge variant="secondary" className="ml-2">{feature.badge}</Badge>
                    </div>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Case Study */}
          <Card className="p-8 bg-card border-border shadow-xl">
            <h3 className="text-2xl mb-8 text-center">Case Study: 40% Admin Time Reduction</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-gradient-to-br from-pink-900/10 to-purple-900/10 rounded-2xl">
                <div className="text-5xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">40%</div>
                <p className="text-muted-foreground">Less admin time</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
                <div className="text-5xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">3x</div>
                <p className="text-muted-foreground">Faster consultations</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
                <div className="text-5xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">95%</div>
                <p className="text-muted-foreground">Accuracy rate</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl mb-4">Experience AI-Powered Healthcare</h2>
          <p className="text-xl mb-8 text-pink-100">
            Try our advanced AI features with a free 30-day trial
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" variant="secondary" onClick={() => onNavigate("login")}>
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20" onClick={() => onNavigate("contact")}>
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}

// Export with original name for backward compatibility
export { AIFeaturesEnhanced as AIFeatures };
