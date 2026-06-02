import { useState, useEffect } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  MessageSquare,
  Share,
  Camera,
  Volume2,
  CheckCircle,
  Clock,
  Heart,
  Activity,
  Droplet,
  Download,
  FileText,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../common/ui/card';
import { Button } from '../common/ui/button';
import { Avatar, AvatarFallback } from '../common/ui/avatar';
import { Badge } from '../common/ui/badge';
import { Input } from '../common/ui/input';
import { Textarea } from '../common/ui/textarea';
import type { PatientUser } from './PatientPortal';

type ConsultationStep = 'waiting' | 'live' | 'completed';

interface VideoConsultationProps {
  patient: PatientUser;
}

export function VideoConsultation({ patient }: VideoConsultationProps) {
  const [step, setStep] = useState<ConsultationStep>('waiting');
  const [timer, setTimer] = useState(0);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'doctor', text: 'Hello! How are you feeling today?', time: '00:02' }
  ]);
  const [newMessage, setNewMessage] = useState('');

  // Timer for consultation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'live') {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        { sender: 'you', text: newMessage, time: formatTime(timer) }
      ]);
      setNewMessage('');
    }
  };

  const handleEndCall = () => {
    setStep('completed');
  };

  // Waiting Room
  if (step === 'waiting') {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="font-semibold text-gray-900 mb-1">Virtual Waiting Room</h1>
          <p className="text-sm text-gray-600">Your appointment is scheduled</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appointment Details */}
          <Card className="border-pink-200">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <Avatar className="size-20 mx-auto mb-4">
                  <AvatarFallback className="bg-pink-600 text-white text-2xl">
                    PS
                  </AvatarFallback>
                </Avatar>
                <h2 className="font-semibold text-gray-900 mb-1">Dr. Priya Sharma</h2>
                <p className="text-sm text-gray-600">Cardiologist</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                  <span className="text-sm text-gray-600">Date & Time</span>
                  <span className="font-medium text-gray-900">November 15, 2025</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                  <span className="text-sm text-gray-600"></span>
                  <span className="font-medium text-gray-900">10:30 AM</span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 mb-3">Before you start:</h3>
                <div className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-green-600 mt-0.5" />
                  <p className="text-sm text-gray-700">Camera and microphone are working</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-green-600 mt-0.5" />
                  <p className="text-sm text-gray-700">You're in a quiet, well-lit place</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-green-600 mt-0.5" />
                  <p className="text-sm text-gray-700">You have your medical reports ready</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-green-600 mt-0.5" />
                  <p className="text-sm text-gray-700">Stable internet connection</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Camera Preview */}
          <Card className="border-pink-200">
            <CardHeader>
              <CardTitle className="text-pink-900">Camera Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="size-16 text-pink-300" />
                </div>
                <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-full">
                  <p className="text-sm font-medium text-gray-900">Your video preview</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant={videoEnabled ? 'default' : 'destructive'}
                  className="flex-1"
                  onClick={() => setVideoEnabled(!videoEnabled)}
                >
                  {videoEnabled ? (
                    <>
                      <Video className="size-4 mr-2" />
                      Camera On
                    </>
                  ) : (
                    <>
                      <VideoOff className="size-4 mr-2" />
                      Camera Off
                    </>
                  )}
                </Button>
                <Button
                  variant={audioEnabled ? 'default' : 'destructive'}
                  className="flex-1"
                  onClick={() => setAudioEnabled(!audioEnabled)}
                >
                  {audioEnabled ? (
                    <>
                      <Mic className="size-4 mr-2" />
                      Mic On
                    </>
                  ) : (
                    <>
                      <MicOff className="size-4 mr-2" />
                      Mic Off
                    </>
                  )}
                </Button>
              </div>

              <Button
                className="w-full mt-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                size="lg"
                onClick={() => setStep('live')}
              >
                <Video className="size-5 mr-2" />
                Join Consultation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Live Consultation
  if (step === 'live') {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-gray-900">
        {/* Header */}
        <div className="bg-pink-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className="bg-red-600 animate-pulse">
              <div className="size-2 bg-white rounded-full mr-2" />
              Live
            </Badge>
            <span className="font-mono text-lg">{formatTime(timer)}</span>
          </div>
          <h2 className="font-semibold">Dr. Priya Sharma - Cardiologist</h2>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-600">Excellent Connection</Badge>
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 flex gap-4 p-4">
          {/* Main Video Area */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Doctor Video */}
            <div className="flex-1 bg-gradient-to-br from-purple-900 to-pink-900 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <Avatar className="size-32">
                  <AvatarFallback className="bg-pink-600 text-white text-4xl">
                    PS
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-white font-medium">Doctor</p>
              </div>
            </div>

            {/* Your Video (Picture in Picture) */}
            <div className="absolute top-20 right-8 w-64 aspect-video bg-gradient-to-br from-pink-800 to-purple-800 rounded-lg border-2 border-white shadow-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="size-12 text-white/50" />
              </div>
              <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
                <p className="text-white text-sm">You</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 space-y-4">
            {/* Live Vitals */}
            <Card className="border-pink-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-pink-900">Live Vitals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Heart className="size-4 text-red-600" />
                    <span className="text-sm font-medium text-gray-700">Blood Pressure</span>
                  </div>
                  <span className="font-semibold text-gray-900">120/80 mmHg</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Activity className="size-4 text-pink-600" />
                    <span className="text-sm font-medium text-gray-700">Heart Rate</span>
                  </div>
                  <span className="font-semibold text-gray-900">72 bpm</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Volume2 className="size-4 text-orange-600" />
                    <span className="text-sm font-medium text-gray-700">Temperature</span>
                  </div>
                  <span className="font-semibold text-gray-900">98.6°F</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Droplet className="size-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">SpO2</span>
                  </div>
                  <span className="font-semibold text-gray-900">98%</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-pink-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-pink-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => setChatOpen(!chatOpen)}>
                  <MessageSquare className="size-4 mr-2" />
                  Chat
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Share className="size-4 mr-2" />
                  Share File
                </Button>
              </CardContent>
            </Card>

            {/* Chat */}
            {chatOpen && (
              <Card className="border-pink-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-pink-900">Chat</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded-lg text-sm ${msg.sender === 'doctor'
                          ? 'bg-gray-100 text-gray-900'
                          : 'bg-pink-600 text-white ml-auto'
                          }`}
                        style={{ maxWidth: '80%' }}
                      >
                        <p>{msg.text}</p>
                        <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="text-sm"
                    />
                    <Button size="sm" onClick={handleSendMessage} className="bg-pink-600">
                      Send
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 p-4 flex items-center justify-center gap-4">
          <Button
            variant={videoEnabled ? 'default' : 'destructive'}
            size="lg"
            className="rounded-full"
            onClick={() => setVideoEnabled(!videoEnabled)}
          >
            {videoEnabled ? <Video className="size-5" /> : <VideoOff className="size-5" />}
          </Button>
          <Button
            variant={audioEnabled ? 'default' : 'destructive'}
            size="lg"
            className="rounded-full"
            onClick={() => setAudioEnabled(!audioEnabled)}
          >
            {audioEnabled ? <Mic className="size-5" /> : <MicOff className="size-5" />}
          </Button>
          <Button
            variant="destructive"
            size="lg"
            className="rounded-full bg-red-600 hover:bg-red-700"
            onClick={handleEndCall}
          >
            <PhoneOff className="size-5" />
          </Button>
          <Button
            variant="default"
            size="lg"
            className="rounded-full"
            onClick={() => setChatOpen(!chatOpen)}
          >
            <MessageSquare className="size-5" />
          </Button>
          <Button variant="default" size="lg" className="rounded-full">
            <Share className="size-5" />
          </Button>
        </div>
      </div>
    );
  }

  // Consultation Completed
  return (
    <div className="p-6 flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <Card className="max-w-2xl w-full border-pink-200">
        <CardContent className="p-8 text-center">
          <div className="size-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="size-10 text-green-600" />
          </div>
          <h2 className="font-semibold text-gray-900 mb-2">Consultation Completed</h2>
          <p className="text-sm text-gray-600 mb-6">
            Thank you for using I Health Clinic's telemedicine service
          </p>

          <div className="grid grid-cols-3 gap-4 mb-6 p-6 bg-pink-50 rounded-lg">
            <div>
              <div className="flex items-center justify-center gap-2 text-pink-600 mb-2">
                <Clock className="size-5" />
              </div>
              <p className="text-2xl font-bold text-pink-900">{formatTime(timer)}</p>
              <p className="text-xs text-gray-600">Duration</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
                <MessageSquare className="size-5" />
              </div>
              <p className="text-2xl font-bold text-blue-900">{messages.length}</p>
              <p className="text-xs text-gray-600">Messages</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                <CheckCircle className="size-5" />
              </div>
              <p className="text-2xl font-bold text-green-900">✓</p>
              <p className="text-xs text-gray-600">Completed</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              <FileText className="size-4 mr-2" />
              View Prescription
            </Button>
            <Button variant="outline" className="flex-1">
              <Download className="size-4 mr-2" />
              Download Summary
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600">
              <Calendar className="size-4 mr-2" />
              Book Follow-up
            </Button>
          </div>

          <Button
            variant="ghost"
            className="mt-4"
            onClick={() => setStep('waiting')}
          >
            Close
          </Button>

          <p className="text-xs text-gray-500 mt-4">
            You'll receive the consultation summary via email
          </p>
        </CardContent>
      </Card>
    </div>
  );
}