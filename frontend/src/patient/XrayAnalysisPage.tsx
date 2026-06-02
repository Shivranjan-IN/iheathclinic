import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  X, 
  Wand2, 
  Loader2, 
  Sparkles, 
  AlertCircle, 
  Play, 
  MessageSquare, 
  Send, 
  ArrowLeft 
} from 'lucide-react';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../common/ui/card';
import { Button } from '../common/ui/button';
import { Input } from '../common/ui/input';
import { Alert, AlertDescription, AlertTitle } from '../common/ui/alert';
import { Badge } from '../common/ui/badge';
import { Skeleton } from '../common/ui/skeleton';
import { Textarea } from '../common/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '../common/ui/tabs';
import { toast } from 'sonner';

import { PatientHeader } from './PatientHeader';
import type { User } from '../common/types';

interface XrayAnalysisPageProps {
  user: User | null;
  onBack: () => void;
}

type Message = {
  role: 'user' | 'model';
  content: string;
};

interface AnalysisOutput {
  xrayType: string;
  finding: string;
  summary: string;
  patientIssue: string;
  prescription: string;
}

export function XrayAnalysisPage({ user, onBack }: XrayAnalysisPageProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioData, setAudioData] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const [language, setLanguage] = useState('en'); // 'en' or 'hi'

  useEffect(() => {
    if (audioData && audioRef.current) {
      audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
    }
  }, [audioData]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast.error("File too large. Please upload an image smaller than 4MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImagePreview(dataUrl);
        setImageData(dataUrl);
        clearAnalysis();
      };
      reader.readAsDataURL(file);
    }
  };
  
  const clearAnalysis = () => {
    setAnalysisResult(null);
    setError(null);
    setAudioData(null);
    setChatHistory([]);
  }

  const handleAnalyzeClick = async () => {
    if (!imageData) {
      toast.error(`Please upload an X-ray image to analyze in ${language === 'hi' ? 'Hindi' : 'English'}.`);
      return;
    }

    setIsLoading(true);
    clearAnalysis();

    try {
      const response = await fetch(`${API_BASE_URL}/ai/analyze-xray`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xrayImage: imageData, language })
      });
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setAnalysisResult(data.data);
        const initialContext: Message = {
          role: 'user',
          content: `Here is the X-ray analysis. Please answer my questions based on this information only. Analysis: ${JSON.stringify(data.data)}`,
        };
        setChatHistory([initialContext]);
      } else {
        setError(data.message || `The AI model could not analyze the image. Please try again with a clearer image.`);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = async () => {
    if (!analysisResult) return;
    setIsAudioLoading(true);
    try {
      const fullText = `
        X-ray Type: ${analysisResult.xrayType}.
        Finding: ${analysisResult.finding}.
        Summary: ${analysisResult.summary}.
        Patient Issue: ${analysisResult.patientIssue}.
        Prescription: ${analysisResult.prescription}.
      `;
      
      const response = await fetch(`${API_BASE_URL}/ai/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullText, language })
      });

      const data = await response.json();

      if (data.success && data.data.audioDataUri) {
        setAudioData(data.data.audioDataUri);
      } else {
        toast.error('Failed to generate audio');
      }
    } catch (err) {
      toast.error('Error generating audio');
    } finally {
      setIsAudioLoading(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const newUserMessage: Message = { role: 'user', content: chatInput };
    setChatHistory(prev => [...prev, newUserMessage]);
    setIsChatLoading(true);
    const currentInput = chatInput;
    setChatInput('');

    try {
      const historyPayload = chatHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: historyPayload,
          prompt: currentInput,
          language
        })
      });

      const data = await response.json();

      if (data.success && data.data.response) {
        const newBotMessage: Message = { role: 'model', content: data.data.response };
        setChatHistory(prev => [...prev, newBotMessage]);
      } else {
        const errorMessage: Message = { role: 'model', content: `Sorry, I couldn't understand that. Could you ask again?` };
        setChatHistory(prev => [...prev, errorMessage]);
      }
    } catch (err) {
      const errorMessage: Message = { role: 'model', content: 'An error occurred during chat.' };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageData(null);
    clearAnalysis();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-50">
      <PatientHeader patient={user as any} onLogout={() => {}} />
      
      <div className="p-4 md:p-6 lg:p-8 flex-1">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <Button variant="outline" size="icon" onClick={onBack} className="rounded-full border-pink-200 text-pink-600 hover:bg-pink-50">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              AI X-ray Analysis
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <Card className="lg:sticky top-6 border-pink-100 shadow-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Upload X-ray Image</CardTitle>
                    <Tabs defaultValue="en" value={language} onValueChange={(value) => { setLanguage(value); clearAnalysis(); }}>
                        <TabsList className="bg-pink-50">
                            <TabsTrigger value="en" className="data-[state=active]:bg-pink-600 data-[state=active]:text-white">English</TabsTrigger>
                            <TabsTrigger value="hi" className="data-[state=active]:bg-pink-600 data-[state=active]:text-white">हिंदी</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
                <CardDescription>
                    {language === 'hi'
                    ? 'X-ray का फोटो खींचें या अपलोड करें। AI स्कैन करके एक आसान मेडिकल सारांश तैयार करेगा।'
                    : 'Take a photo or upload an X-ray image. The AI will scan it and generate a simple medical summary.'
                    }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {imagePreview ? (
                  <div className="relative group rounded-xl overflow-hidden border border-pink-200">
                    <img
                      src={imagePreview}
                      alt="X-ray preview"
                      className="object-contain w-full max-h-[400px] h-auto"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                      onClick={clearImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-pink-200 rounded-xl cursor-pointer hover:bg-pink-50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="p-4 bg-pink-100 rounded-full mb-4">
                      <Upload className="h-8 w-8 text-pink-600" />
                    </div>
                    <p className="mt-2 text-center text-gray-700 font-medium">
                      {language === 'hi' ? 'अपलोड करने के लिए क्लिक करें या खींचें' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">(.jpg, .png, .dcm)</p>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/dicom"
                      onChange={handleFileChange}
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleAnalyzeClick} 
                  disabled={isLoading || !imageData} 
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white h-12 text-lg font-medium shadow-md transition-all active:scale-95"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {language === 'hi' ? 'विश्लेषण हो रहा है...' : 'Analyzing...'}
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-5 w-5" />
                      {language === 'hi' ? 'AI से विश्लेषण करें' : 'Analyze with AI'}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <div className="space-y-6">
                <Card className="border-purple-100 shadow-sm overflow-hidden">
                <CardHeader className="border-b bg-gray-50/50">
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2 text-purple-900">
                            <Sparkles className="h-5 w-5 text-purple-600" />
                            {language === 'hi' ? 'AI विश्लेषण परिणाम' : 'AI Analysis Results'}
                        </CardTitle>
                        {analysisResult && (
                        <Button 
                          onClick={handlePlayAudio} 
                          size="sm" 
                          variant="outline" 
                          disabled={isAudioLoading}
                          className="border-purple-200 text-purple-600 hover:bg-purple-50"
                        >
                            {isAudioLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                            <span className="ml-2 uppercase text-[10px] font-bold tracking-wider">
                              {language === 'hi' ? 'ऑडियो में सुनें' : 'Listen to Audio'}
                            </span>
                        </Button>
                        )}
                    </div>
                    <CardDescription>
                        {language === 'hi' ? 'AI द्वारा उत्पन्न निष्कर्षों का रोगी-अनुकूल सारांश।' : 'Patient-friendly summary of AI-generated findings.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    {isLoading && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-1/4 bg-purple-50" />
                          <Skeleton className="h-8 w-1/2 bg-purple-50" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full bg-purple-50" />
                          <Skeleton className="h-4 w-5/6 bg-purple-50" />
                        </div>
                        <Skeleton className="h-6 w-1/3 bg-purple-50" />
                    </div>
                    )}
                    
                    {error && (
                    <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>{language === 'hi' ? 'विश्लेषण विफल' : 'Analysis Failed'}</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    )}

                    {analysisResult && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <h3 className="font-semibold mb-2 text-sm text-blue-900 flex items-center gap-2">
                              🩻 {language === 'hi' ? 'एक्स-रे प्रकार' : 'X-ray Type'}
                            </h3>
                            <Badge variant="secondary" className="bg-blue-600 text-white hover:bg-blue-700">
                              {analysisResult.xrayType}
                            </Badge>
                          </div>
                          <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
                            <h3 className="font-semibold mb-2 text-sm text-teal-900 flex items-center gap-2">
                              🧩 {language === 'hi' ? 'निष्कर्ष' : 'Finding'}
                            </h3>
                            <Badge variant="outline" className="border-teal-600 text-teal-700">
                              {analysisResult.finding}
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2 text-gray-900 flex items-center gap-2">
                            🧠 {language === 'hi' ? 'सारांश' : 'Summary'}
                          </h3>
                          <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-xl border border-gray-100 shadow-sm italic">
                            "{analysisResult.summary}"
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold mb-2 text-gray-900 flex items-center gap-2">
                            🩺 {language === 'hi' ? 'मरीज की स्थिति का विवरण' : 'Patient Issue Details'}
                          </h3>
                          <div className="text-gray-700 bg-white p-4 rounded-xl border border-gray-100 shadow-sm leading-relaxed">
                            {analysisResult.patientIssue}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2 text-gray-900 flex items-center gap-2">
                            💊 {language === 'hi' ? 'दवा और सुझाव' : 'Prescription'}
                          </h3>
                          <div className="text-purple-900 bg-purple-50/50 p-4 rounded-xl border border-purple-100 leading-relaxed whitespace-pre-line font-medium">
                            {analysisResult.prescription}
                          </div>
                        </div>
                    </div>
                    )}

                    {!isLoading && !analysisResult && !error && (
                    <div className="text-center text-gray-400 py-12">
                            <Wand2 className="h-16 w-16 mx-auto mb-4 opacity-10" />
                            <h3 className="font-medium text-gray-500">{language === 'hi' ? 'विश्लेषण के लिए तैयार' : 'Ready for Analysis'}</h3>
                            <p className="text-sm">{language === 'hi' ? 'आपका AI-जनित सारांश यहाँ दिखाई देगा।' : 'Your AI-generated summary will appear here.'}</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="bg-amber-50/50 p-4 border-t">
                    <Alert variant="default" className="border-amber-200 bg-white shadow-sm">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertTitle className="text-amber-800 font-bold">{language === 'hi' ? 'चिकित्सा अस्वीकरण' : 'Medical Disclaimer'}</AlertTitle>
                        <AlertDescription className="text-amber-700 text-xs">
                         {language === 'hi' 
                           ? 'यह AI विश्लेषण केवल सूचना के उद्देश्यों के लिए है और पेशेवर चिकित्सा सलाह का विकल्प नहीं है। हमेशा एक योग्य डॉक्टर से परामर्श करें।' 
                           : 'This AI analysis is for informational purposes only and is not a substitute for professional medical advice. Always consult a qualified doctor.'}
                        </AlertDescription>
                    </Alert>
                    </CardFooter>
                </Card>

                {analysisResult && (
                     <Card className="border-blue-100 shadow-sm overflow-hidden">
                        <CardHeader className="bg-blue-50/50 border-b">
                             <CardTitle className="flex items-center gap-2 text-blue-900">
                                <MessageSquare className="h-5 w-5 text-blue-600" />
                                {language === 'hi' ? 'क्या आपको कुछ पूछना है?' : 'Have a question?'}
                            </CardTitle>
                            <CardDescription className="text-blue-700">
                              {language === 'hi' ? 'इस रिपोर्ट के बारे में अपने सवाल नीचे पूछें।' : 'Ask your follow-up questions about this report below.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4 h-[300px] overflow-y-auto pr-4 border rounded-xl bg-white p-4 shadow-inner">
                                {chatHistory.length <= 1 && (
                                  <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                                     <Bot className="h-12 w-12 opacity-10" />
                                     <p className="text-sm">Ask me anything about your X-ray report!</p>
                                  </div>
                                )}
                                {chatHistory.slice(1).map((msg, index) => (
                                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                                        <p className="text-sm leading-relaxed">{msg.content}</p>
                                    </div>
                                    </div>
                                ))}
                                 {isChatLoading && (
                                  <div className="flex justify-start">
                                    <div className="p-3 rounded-2xl bg-gray-100 rounded-tl-none">
                                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                    </div>
                                  </div>
                                 )}
                            </div>
                             <form onSubmit={handleChatSubmit} className="mt-4 flex gap-2">
                                <Textarea
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder={language === 'hi' ? 'अपना सवाल यहाँ लिखें...' : 'Type your question here...'}
                                    className="flex-1 min-h-[60px] border-blue-100 focus-visible:ring-blue-600 rounded-xl"
                                    disabled={isChatLoading}
                                />
                                <Button 
                                  type="submit" 
                                  disabled={isChatLoading || !chatInput.trim()}
                                  className="self-end bg-blue-600 hover:bg-blue-700 h-10 w-10 p-0 rounded-full shadow-lg transition-transform active:scale-90"
                                >
                                    {isChatLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
                                </Button>
                            </form>
                        </CardContent>
                     </Card>
                )}
                {audioData && <audio ref={audioRef} src={audioData} className="hidden" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bot({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}
