import React, { useState, useRef, useEffect } from 'react';
import {
    Brain,
    Mic,
    FileText,
    Volume2,
    Sparkles,
    Send,
    Upload,
    Pause,
    AlertCircle,
    Activity,
    Stethoscope,
    FileImage,
    Languages,
    FileUp,
    ShieldCheck,
    MessageSquare,
    ClipboardList,
    ArrowRightCircle,
    CheckCircle2,
    Plus,
    Scan
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../common/ui/card';
import { Button } from '../common/ui/button';
import { Textarea } from '../common/ui/textarea';
import { Badge } from '../common/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../common/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../common/ui/select';
import { toast } from 'sonner';
import { aiIntelligenceService } from '../services/aiIntelligenceService';

// Web Speech API Types
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export function AIHealthTools() {
    // Language and Navigation
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [activeTab, setActiveTab] = useState('symptoms');

    // --- Symptom Checker State ---
    const [symptomInput, setSymptomInput] = useState('');
    const [isAnalyzingSymptoms, setIsAnalyzingSymptoms] = useState(false);
    const [symptomResponse, setSymptomResponse] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<any>(null);

    // --- Document Analyzer State ---
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [isAnalyzingDocument, setIsAnalyzingDocument] = useState(false);
    const [documentResponse, setDocumentResponse] = useState<any>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false; // Stop after one phrase to make it feel like "Speak and Insert"
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setSymptomInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
                setIsRecording(false);
            };

            recognitionRef.current.onend = () => {
                setIsRecording(false);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                toast.error(`Mic error: ${event.error}`);
                setIsRecording(false);
            };
        }
    }, []);

    const toggleRecording = () => {
        if (!recognitionRef.current) {
            toast.error("Speech Recognition is not supported in this browser.");
            return;
        }

        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            recognitionRef.current.lang = selectedLanguage === 'hi' ? 'hi-IN' : 'en-US';
            try {
                recognitionRef.current.start();
                setIsRecording(true);
            } catch (err) {
                console.error(err);
                setIsRecording(false);
            }
        }
    };

    // --- Actions ---
    const handleSymptomSubmit = async () => {
        if (!symptomInput.trim()) return;
        setIsAnalyzingSymptoms(true);
        setSymptomResponse(null);
        try {
            const data = await aiIntelligenceService.checkSymptoms(symptomInput, selectedLanguage);
            setSymptomResponse(data);
            toast.success("Analysis complete");
        } catch (err: any) {
            console.error(err);
            toast.error("Failed to connect to MedBot engine");
        } finally {
            setIsAnalyzingSymptoms(false);
        }
    };

    const handleFileUpload = async (selectedFile: File) => {
        if (selectedFile.size > 20 * 1024 * 1024) {
            toast.error("File size exceeds 20MB limit.");
            return;
        }
        
        // Supported types: PDF, JPG, PNG
        const supportedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!supportedTypes.includes(selectedFile.type)) {
            toast.error("Unsupported file type. Please upload PDF, JPG, or PNG.");
            return;
        }

        setFile(selectedFile);
        
        // Setup preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
    };

    const analyzeDocument = async () => {
        if (!file || !filePreview) return;
        setIsAnalyzingDocument(true);
        setDocumentResponse(null);
        try {
            const data = await aiIntelligenceService.analyzeReport(filePreview, file.name, selectedLanguage);
            if (data.success) {
                setDocumentResponse(data.data);
                toast.success("Report analysis success!");
            } else {
                toast.error("Analysis failed. Try a clearer image.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to reach Report Analyzer");
        } finally {
            setIsAnalyzingDocument(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Header / Banner */}
            <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white py-12 md:py-16">
                <div className="max-w-7xl mx-auto px-6 md:px-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="animate-in fade-in slide-in-from-left-6 duration-700">
                            <div className="flex items-center gap-3 mb-4">
                                <Badge className="bg-blue-600 hover:bg-blue-600 text-white border-0 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                                    <Sparkles className="w-3 h-3 mr-2" />
                                    AI Health Suite
                                </Badge>
                                {selectedLanguage === 'hi' && (
                                    <Badge variant="outline" className="text-blue-400 border-blue-400/30 font-medium">
                                        हिंदी सक्रिय है
                                    </Badge>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                                AI Medical Intelligence
                            </h1>
                            <p className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                                Your intelligent symptom and record analysis engine, powered by advanced medical LLMs.
                            </p>
                        </div>

                        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-6 duration-700">
                            <div className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-xl">
                                    <Languages className="w-5 h-5 text-blue-400" />
                                </div>
                                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                                    <SelectTrigger className="w-[160px] bg-transparent border-0 text-white font-semibold focus:ring-0">
                                        <SelectValue placeholder="Language" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-0 shadow-2xl">
                                        <SelectItem value="en">English (Global)</SelectItem>
                                        <SelectItem value="hi">हिंदी (India)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-10 -mt-10">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar / Controls */}
                        <div className="lg:w-80 space-y-4">
                            <TabsList className="flex lg:flex-col items-stretch h-auto bg-white p-2 rounded-3xl shadow-xl border border-gray-100 w-full">
                                <TabsTrigger 
                                    value="symptoms" 
                                    className="data-[state=active]:bg-[#EFF6FF] data-[state=active]:text-blue-700 px-6 py-4 rounded-2xl justify-start gap-4 transition-all"
                                >
                                    <div className="p-2 bg-white rounded-xl shadow-sm">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold">Symptom Checker</span>
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="document" 
                                    className="data-[state=active]:bg-[#EFF6FF] data-[state=active]:text-blue-700 px-6 py-4 rounded-2xl justify-start gap-4 transition-all"
                                >
                                    <div className="p-2 bg-white rounded-xl shadow-sm">
                                        <Scan className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold">Document Analyzer</span>
                                </TabsTrigger>
                            </TabsList>

                            <Card className="rounded-3xl border-0 shadow-lg bg-blue-600 text-white overflow-hidden p-6 relative">
                                <div className="relative z-10">
                                    <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-bold text-lg mb-1">Data Privacy</h4>
                                    <p className="text-blue-100 text-sm leading-relaxed">
                                        Your health data is encrypted and used only for instant analysis. No records are permanently stored without your consent.
                                    </p>
                                </div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                            </Card>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 space-y-6">
                            {/* --- SYMPTOMS TAB CONTENT --- */}
                            <TabsContent value="symptoms" className="mt-0 space-y-6 focus-visible:ring-0 outline-none">
                                <Card className="rounded-[40px] border-0 shadow-2xl bg-white overflow-hidden p-8 flex flex-col min-h-[600px]">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                                            <MessageSquare className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900">Clinical Symptom Checker</h2>
                                            <p className="text-gray-500 text-sm">Powered by MedBot RAG Intelligence</p>
                                        </div>
                                    </div>

                                    {/* Chat Display Area */}
                                    <div className="flex-1 bg-gray-50/50 rounded-3xl p-8 mb-6 overflow-y-auto max-h-[400px] border border-dashed border-gray-200 custom-scrollbar">
                                        {!symptomResponse && !isAnalyzingSymptoms ? (
                                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
                                                <div className="p-4 bg-white rounded-3xl shadow-sm">
                                                    <Brain className="w-12 h-12 text-blue-500" />
                                                </div>
                                                <p className="text-gray-500 font-medium max-w-xs">
                                                    Share your symptoms below to receive a detailed clinical assessment.
                                                </p>
                                            </div>
                                        ) : isAnalyzingSymptoms ? (
                                            <div className="flex flex-col items-center justify-center h-full space-y-6">
                                                <div className="relative">
                                                    <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                                                    <Brain className="absolute inset-0 m-auto w-8 h-8 text-blue-600 animate-pulse" />
                                                </div>
                                                <div className="text-center">
                                                    <h4 className="font-bold text-gray-900 mb-1">Analyzing Patient Data</h4>
                                                    <p className="text-gray-400 text-sm">Searching medical knowledge base...</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 relative group">
                                                    <div className="absolute -top-3 -left-3 bg-blue-600 text-white p-2 rounded-xl shadow-lg">
                                                        <Sparkles className="w-4 h-4" />
                                                    </div>
                                                    <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">
                                                        {symptomResponse}
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl flex gap-4">
                                                        <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                                                        <p className="text-[11px] text-amber-800 leading-relaxed">
                                                            <strong>Medical Disclaimer:</strong> This assessment is for informational purposes only. It is not a substitute for professional medical advice.
                                                        </p>
                                                    </div>
                                                    <Button 
                                                        variant="outline" 
                                                        className="h-full rounded-2xl border-blue-100 text-blue-600 hover:bg-blue-50 gap-3"
                                                        onClick={() => {
                                                            setSymptomInput('');
                                                            setSymptomResponse(null);
                                                        }}
                                                    >
                                                        Start New Analysis
                                                        <ArrowRightCircle className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Input Area */}
                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <Textarea
                                                placeholder={selectedLanguage === 'hi' ? "अपने लक्षणों का वर्णन करें... (उदा: 'मुझे 3 दिन से बुखार है')" : "Describe your symptoms... (e.g., 'I have had a fever for 3 days and feel weak')"}
                                                value={symptomInput}
                                                onChange={(e) => setSymptomInput(e.target.value)}
                                                className="w-full min-h-[120px] bg-[#F8FAFC] border-2 border-gray-100 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 rounded-[32px] p-6 pr-24 text-gray-800 font-medium resize-none transition-all placeholder:text-gray-400"
                                            />
                                            
                                            <div className="absolute right-4 bottom-4 flex gap-2">
                                                <Button
                                                    onClick={toggleRecording}
                                                    size="icon"
                                                    variant={isRecording ? 'destructive' : 'secondary'}
                                                    className={`h-12 w-12 rounded-2xl shadow-md transition-all ${isRecording ? 'animate-pulse scale-110' : 'hover:bg-blue-600 hover:text-white'}`}
                                                >
                                                    {isRecording ? <Pause className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                                </Button>
                                                <Button
                                                    onClick={handleSymptomSubmit}
                                                    disabled={!symptomInput.trim() || isAnalyzingSymptoms}
                                                    className="h-12 w-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-200"
                                                >
                                                    <Send className="w-5 h-5" />
                                                </Button>
                                            </div>
                                            
                                            {isRecording && (
                                                <div className="absolute -top-10 right-4 bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold animate-bounce flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                                                    LISTENING NOW
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex justify-between items-center px-4">
                                            <div className="flex gap-4">
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                                    <Languages className="w-3 h-3" />
                                                    MULTI-LANGUAGE
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                                    <Mic className="w-3 h-3" />
                                                    VOICE TO TEXT
                                                </div>
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-300">CTRL + ENTER TO SEND</p>
                                        </div>
                                    </div>
                                </Card>
                            </TabsContent>

                            {/* --- DOCUMENT TAB CONTENT --- */}
                            <TabsContent value="document" className="mt-0 space-y-6 focus-visible:ring-0 outline-none">
                                <Card className="rounded-[40px] border-0 shadow-2xl bg-white overflow-hidden p-8">
                                    <div className="flex items-baseline justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                                                <ClipboardList className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black text-gray-900">Medical Report Analyzer</h2>
                                                <p className="text-gray-500 text-sm">Gemini AI-Powered Data Extraction</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-0 flex gap-2">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Active Engine
                                        </Badge>
                                    </div>

                                    {/* Upload UI */}
                                    <div 
                                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            setIsDragging(false);
                                            if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
                                        }}
                                        className={`relative group border-4 border-dashed rounded-[40px] p-12 flex flex-col items-center justify-center transition-all duration-300 ${
                                            isDragging ? 'border-blue-500 bg-blue-50 scale-[0.98]' : 
                                            file ? 'border-green-100 bg-green-50/20' : 
                                            'border-gray-100 bg-gray-50/50 hover:border-blue-100 hover:bg-white'
                                        }`}
                                    >
                                        {filePreview ? (
                                            <div className="w-full max-w-md relative group/preview">
                                                <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-8 border-white bg-white">
                                                    {file?.type.startsWith('image/') ? (
                                                        <img src={filePreview} alt="Report Preview" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50 space-y-4">
                                                            <div className="p-6 bg-white rounded-3xl shadow-lg">
                                                                <FileImage className="w-16 h-16 text-blue-500" />
                                                            </div>
                                                            <div className="text-center font-bold text-blue-900 px-6 line-clamp-1">{file?.name}</div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover/preview:opacity-100 flex flex-col items-center justify-center transition-all rounded-3xl">
                                                    <Button 
                                                        variant="secondary" 
                                                        className="rounded-2xl font-bold bg-white text-gray-900 mb-4"
                                                        onClick={() => {
                                                            setFile(null);
                                                            setFilePreview(null);
                                                            setDocumentResponse(null);
                                                        }}
                                                    >
                                                        Replace File
                                                    </Button>
                                                    <p className="text-white/60 text-[10px] font-bold">MAX SIZE 20MB</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center space-y-6">
                                                <div className="relative">
                                                    <div className="w-24 h-24 bg-white rounded-[32px] shadow-xl flex items-center justify-center mx-auto border border-gray-50 transform group-hover:rotate-12 transition-transform">
                                                        <FileUp className="w-10 h-10 text-blue-600" />
                                                    </div>
                                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 text-white rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
                                                        <Plus className="w-6 h-6" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Drop your medical reports here</h3>
                                                    <p className="text-gray-500 text-sm max-w-[260px] mx-auto font-medium leading-relaxed">
                                                        Support for Blood Reports, Prescription Slips, Scan Summaries and Lab Results (PDF/JPG/PNG)
                                                    </p>
                                                </div>
                                                <div className="relative">
                                                    <input 
                                                        type="file" 
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        accept="image/*,application/pdf"
                                                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                                    />
                                                    <Button className="h-12 px-10 rounded-2xl font-bold bg-[#1E293B] hover:bg-[#0F172A] text-white shadow-xl shadow-gray-200">
                                                        Browse Device Files
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Button */}
                                    {file && (
                                        <div className="mt-10 animate-in fade-in zoom-in-95 duration-500">
                                            <Button
                                                onClick={analyzeDocument}
                                                disabled={isAnalyzingDocument}
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-16 rounded-[24px] shadow-2xl shadow-blue-200 transition-all text-xl"
                                            >
                                                {isAnalyzingDocument ? (
                                                    <><Sparkles className="w-6 h-6 mr-4 animate-spin" /> Deep Knowledge Extraction...</>
                                                ) : (
                                                    <><ClipboardList className="w-6 h-6 mr-4" /> Start Intelligence Analysis</>
                                                )}
                                            </Button>
                                        </div>
                                    )}

                                    {/* ANALYSIS RESULTS CARDS */}
                                     {documentResponse && (
                                        <div className="mt-12 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                            <div className="flex items-center gap-4 mb-2">
                                                <h3 className="text-xl font-black text-gray-900 tracking-tight">Extracted Logic & Findings</h3>
                                                <div className="h-px flex-1 bg-gray-100" />
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Summary & Explanation Card */}
                                                <Card className="rounded-[32px] border border-gray-100 shadow-xl overflow-hidden md:col-span-2">
                                                    <CardHeader className="bg-gray-50/50 pb-4">
                                                        <CardTitle className="text-sm font-black flex items-center gap-3 text-gray-700">
                                                            <div className="h-8 w-8 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                                                <FileText className="w-4 h-4 text-gray-600" />
                                                            </div>
                                                            EXECUTIVE SUMMARY
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-6">
                                                        <div className="space-y-4">
                                                            <div>
                                                                <span className="text-[10px] font-black text-gray-400 uppercase">Analysis Overview</span>
                                                                <p className="text-gray-900 font-bold text-sm bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                                                                    {documentResponse.summary}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] font-black text-gray-400 uppercase">Detailed Clinical Explanation</span>
                                                                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                                                                    {documentResponse.explanation}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                {/* Flags & Next Steps */}
                                                <Card className="rounded-[32px] border border-red-50 shadow-xl overflow-hidden">
                                                    <CardHeader className="bg-red-50/50 pb-4">
                                                        <CardTitle className="text-sm font-black flex items-center gap-3 text-red-700">
                                                            <div className="h-8 w-8 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                                                <AlertCircle className="w-4 h-4 text-red-600" />
                                                            </div>
                                                            ABNORMAL FINDINGS & RISKS
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-6">
                                                        <div className="space-y-4">
                                                            {documentResponse.abnormalValues?.length > 0 ? (
                                                                <div className="flex flex-wrap gap-2">
                                                                    {documentResponse.abnormalValues.map((v: string, i: number) => (
                                                                        <Badge key={i} variant="destructive" className="rounded-lg">{v}</Badge>
                                                                    ))}
                                                                </div>
                                                            ) : <p className="text-gray-400 text-xs italic">No major abnormal values flagged.</p>}
                                                            
                                                            <div className="border-t border-red-50 pt-4 mt-4">
                                                                <span className="text-[10px] font-black text-gray-400 uppercase">Risk Indicators</span>
                                                                <ul className="mt-2 space-y-1">
                                                                    {documentResponse.riskIndicators?.map((r: string, i: number) => (
                                                                        <li key={i} className="text-xs text-red-800 flex items-center gap-2">
                                                                            <div className="w-1 h-1 bg-red-400 rounded-full" />
                                                                            {r}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                <Card className="rounded-[32px] border border-green-50 shadow-xl overflow-hidden bg-gradient-to-br from-white to-green-50/20">
                                                    <CardHeader className="bg-green-50/50 pb-4">
                                                        <CardTitle className="text-sm font-black flex items-center gap-3 text-green-700">
                                                            <div className="h-8 w-8 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                                                <ArrowRightCircle className="w-4 h-4 text-green-600" />
                                                            </div>
                                                            SUGGESTED NEXT STEPS
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-6">
                                                        <div className="space-y-3">
                                                            {documentResponse.suggestedNextSteps?.map((s: string, i: number) => (
                                                                <div key={i} className="flex gap-3 items-start">
                                                                    <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-[10px] font-bold shrink-0 mt-0.5">
                                                                        {i+1}
                                                                    </div>
                                                                    <p className="text-sm text-gray-700 font-medium">{s}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="mt-6 pt-6 border-t border-green-50 flex items-center gap-4">
                                                            <div className="h-10 w-10 bg-green-500 text-white rounded-xl flex items-center justify-center shadow-lg">
                                                                <ShieldCheck className="w-5 h-5" />
                                                            </div>
                                                            <p className="text-[11px] text-gray-500 leading-relaxed">
                                                                Verified Gemini Intelligence Analysis. Consult your doctor for treatment.
                                                            </p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </TabsContent>
                        </div>
                    </div>
                </Tabs>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-in-from-bottom-4 { from { transform: translateY(1rem); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
            `}} />
        </div>
    );
}