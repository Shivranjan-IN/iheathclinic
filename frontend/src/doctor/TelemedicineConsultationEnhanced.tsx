import { useState, useEffect } from 'react';
import { Heart, Video, VideoOff, Mic, MicOff, Phone, MessageSquare, FileText, Upload, Monitor, MonitorOff, Clock, User, Settings, X, Send, Paperclip, Activity } from 'lucide-react';
import { Button } from '../common/ui/button';
import { Card } from '../common/ui/card';
import { toast } from 'sonner';

interface TelemedicineConsultationEnhancedProps {
  onClose: () => void;
  appointmentId?: number;
}

export function TelemedicineConsultationEnhanced({ onClose, appointmentId }: TelemedicineConsultationEnhancedProps) {
  const [callStatus, setCallStatus] = useState<'waiting' | 'connecting' | 'active' | 'ended'>('waiting');
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'doctor', text: 'Hello! I\'ll be with you in a moment.', time: '10:28 AM' },
    { id: 2, sender: 'patient', text: 'Thank you, Doctor!', time: '10:29 AM' }
  ]);
  const [consultationTime, setConsultationTime] = useState(0);

  useEffect(() => {
    if (callStatus === 'active') {
      const timer = setInterval(() => {
        setConsultationTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [callStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = () => {
    setCallStatus('connecting');
    setTimeout(() => setCallStatus('active'), 2000);
  };

  const endCall = () => {
    setCallStatus('ended');
  };

  const sendMessage = () => {
    if (chatMessage.trim()) {
      setMessages([...messages, {
        id: messages.length + 1,
        sender: 'patient',
        text: chatMessage,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }]);
      setChatMessage('');
    }
  };

  const appointmentDetails = {
    doctor: {
      name: 'Dr. Priya Sharma',
      specialty: 'Cardiologist',
      experience: '15 years'
    },
    patient: {
      name: 'Rahul Verma',
      age: 45,
      id: 'P-12345'
    },
    appointment: {
      date: 'November 15, 2025',
      time: '10:30 AM',
      type: 'Video Consultation',
      reason: 'Regular Checkup'
    }
  };

  const vitalsData = [
    { label: 'Blood Pressure', value: '120/80 mmHg', status: 'normal' },
    { label: 'Heart Rate', value: '72 bpm', status: 'normal' },
    { label: 'Temperature', value: '98.6°F', status: 'normal' },
    { label: 'SpO2', value: '98%', status: 'normal' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Waiting Room */}
      {callStatus === 'waiting' && (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <div className="inline-block bg-gradient-to-r from-pink-600 to-purple-600 p-4 rounded-2xl mb-4">
                  <Video className="w-16 h-16 text-white" />
                </div>
                <h1 className="text-3xl mb-2">Virtual Waiting Room</h1>
                <p className="text-muted-foreground">Your appointment is scheduled</p>
              </div>

              {/* Appointment Details */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 mb-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Doctor</p>
                    <p className="text-lg">{appointmentDetails.doctor.name}</p>
                    <p className="text-sm text-muted-foreground">{appointmentDetails.doctor.specialty}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Date & Time</p>
                    <p>{appointmentDetails.appointment.date}</p>
                    <p className="text-sm text-muted-foreground">{appointmentDetails.appointment.time}</p>
                  </div>
                </div>
              </div>

              {/* Pre-call Checklist */}
              <div className="mb-6">
                <h3 className="mb-3">Before you start:</h3>
                <div className="space-y-2">
                  {[
                    'Camera and microphone are working',
                    'You\'re in a quiet, well-lit place',
                    'You have your medical reports ready',
                    'Stable internet connection'
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-3 bg-muted rounded-xl">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Camera Preview */}
              <div className="mb-6">
                <p className="text-sm mb-2">Camera Preview</p>
                <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                      <User className="w-24 h-24 mx-auto mb-2 opacity-50" />
                      <p className="text-sm opacity-75">Your video preview</p>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
                    <button
                      onClick={() => setVideoEnabled(!videoEnabled)}
                      className={`p-3 rounded-full ${videoEnabled ? 'bg-white/20' : 'bg-red-500'}`}
                    >
                      {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => setAudioEnabled(!audioEnabled)}
                      className={`p-3 rounded-full ${audioEnabled ? 'bg-white/20' : 'bg-red-500'}`}
                    >
                      {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={startCall}
                className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl text-lg hover:shadow-2xl transition-all flex items-center justify-center"
              >
                <Video className="w-6 h-6 mr-2" />
                Join Consultation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connecting State */}
      {callStatus === 'connecting' && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Video className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl text-white mb-2">Connecting...</h2>
            <p className="text-gray-400">Please wait while we connect you with your doctor</p>
          </div>
        </div>
      )}

      {/* Active Call */}
      {callStatus === 'active' && (
        <div className="h-screen flex flex-col bg-gray-900">
          {/* Top Bar */}
          <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-white">Live Consultation</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Clock className="w-4 h-4" />
                <span className="font-mono">{formatTime(consultationTime)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white text-sm">Dr. Priya Sharma</span>
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-all">
                <Settings className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Video Grid */}
          <div className="flex-1 grid grid-cols-3 gap-4 p-4">
            {/* Main Video (Doctor) */}
            <div className="col-span-2 relative bg-gray-950 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-32 h-32 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-16 h-16" />
                  </div>
                  <p className="text-xl">Dr. Priya Sharma</p>
                  <p className="text-sm text-gray-400">Cardiologist</p>
                </div>
              </div>
              <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm">
                Doctor
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Self Video */}
              <div className="relative bg-gray-950 rounded-2xl overflow-hidden aspect-video">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <User className="w-10 h-10" />
                    </div>
                    <p className="text-sm">You</p>
                  </div>
                </div>
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs">
                  You
                </div>
              </div>

              {/* Patient Vitals */}
              <div className="bg-gray-800 rounded-2xl p-4">
                <h3 className="text-white mb-3 flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  Live Vitals
                </h3>
                <div className="space-y-2">
                  {vitalsData.map((vital, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{vital.label}</span>
                      <span className="text-white">{vital.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-800 rounded-2xl p-4">
                <h3 className="text-white mb-3 text-sm">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className="w-full p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm flex items-center justify-center transition-all"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat
                  </button>
                  <button className="w-full p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm flex items-center justify-center transition-all">
                    <Upload className="w-4 h-4 mr-2" />
                    Share File
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="bg-gray-800 px-6 py-4">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setVideoEnabled(!videoEnabled)}
                className={`p-4 rounded-full transition-all ${videoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
                  }`}
              >
                {videoEnabled ? <Video className="w-6 h-6 text-white" /> : <VideoOff className="w-6 h-6 text-white" />}
              </button>

              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`p-4 rounded-full transition-all ${audioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
                  }`}
              >
                {audioEnabled ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6 text-white" />}
              </button>

              <button
                onClick={() => setScreenSharing(!screenSharing)}
                className={`p-4 rounded-full transition-all ${screenSharing ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
              >
                {screenSharing ? <MonitorOff className="w-6 h-6 text-white" /> : <Monitor className="w-6 h-6 text-white" />}
              </button>

              <button
                onClick={() => setShowChat(!showChat)}
                className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-all relative"
              >
                <MessageSquare className="w-6 h-6 text-white" />
                <span className="absolute top-1 right-1 w-3 h-3 bg-pink-500 rounded-full" />
              </button>

              <button
                onClick={endCall}
                className="px-8 py-4 rounded-full bg-red-500 hover:bg-red-600 transition-all flex items-center"
              >
                <Phone className="w-6 h-6 text-white mr-2 transform rotate-135" />
                <span className="text-white">End Call</span>
              </button>
            </div>
          </div>

          {/* Chat Sidebar */}
          {showChat && (
            <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl flex flex-col z-50">
              <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-4 flex items-center justify-between">
                <h3 className="text-white">Chat</h3>
                <button onClick={() => setShowChat(false)}>
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${msg.sender === 'patient'
                        ? 'bg-pink-100'
                        : 'bg-gray-100'
                      } rounded-2xl p-3`}>
                      <p className="text-sm">{msg.text}</p>
                      <p className="text-xs text-gray-500 mt-1">{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t">
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Paperclip className="w-5 h-5 text-gray-600" />
                  </button>
                  <input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <button
                    onClick={sendMessage}
                    className="p-2 bg-pink-600 hover:bg-pink-700 rounded-xl transition-all"
                  >
                    <Send className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Call Ended */}
      {callStatus === 'ended' && (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-pink-50 via-white to-purple-50">
          <div className="max-w-2xl w-full">
            <Card className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Phone className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl mb-4">Consultation Completed</h2>
              <p className="text-muted-foreground mb-6">Thank you for using I Health Clinic's telemedicine service</p>

              <div className="bg-muted rounded-2xl p-6 mb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl text-pink-600">{formatTime(consultationTime)}</p>
                    <p className="text-sm text-muted-foreground">Duration</p>
                  </div>
                  <div>
                    <p className="text-2xl text-pink-600">{messages.length}</p>
                    <p className="text-sm text-muted-foreground">Messages</p>
                  </div>
                  <div>
                    <p className="text-2xl text-pink-600">✓</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <Button className="w-full py-6">
                  View Prescription
                </Button>
                <Button variant="outline" className="w-full py-6">
                  Download Summary
                </Button>
                <Button variant="outline" className="w-full py-6">
                  Book Follow-up
                </Button>
              </div>

              <Button onClick={onClose} variant="ghost" className="w-full">
                Close
              </Button>

              <p className="text-sm text-muted-foreground mt-4">You'll receive the consultation summary via email</p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
