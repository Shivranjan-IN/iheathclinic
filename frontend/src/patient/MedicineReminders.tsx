import { useState, useEffect, useRef } from 'react';
import {
    Bell,
    Clock,
    AlertCircle,
    Volume2,
    VolumeX,
    ShieldAlert,
    Pill,
    Check,
    Navigation
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../common/ui/card';
import { Button } from '../common/ui/button';
import { Badge } from '../common/ui/badge';
import { patientService } from '../services/patientService';
import { toast } from 'sonner';
import type { PatientUser } from './PatientPortal';

interface ParsedMedicine {
    id: string;
    medicine_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    doctor: string;
    date: string;
    prescription_id: string;
    times: string[];
}

interface ActiveReminder {
    id: string;
    medicine_name: string;
    dosage: string;
    time: string;
    enabled: boolean;
}

export function MedicineReminders({ patient }: { patient: PatientUser }) {
    const [prescribedMeds, setPrescribedMeds] = useState<ParsedMedicine[]>([]);
    const [reminders, setReminders] = useState<ActiveReminder[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [activeAlarm, setActiveAlarm] = useState<ActiveReminder | null>(null);
    const alarmIntervalRef = useRef<any>(null);

    // Fetch prescriptions once when patient.id changes
    useEffect(() => {
        if (patient.id) {
            fetchPrescriptionsAndSync();
        }
    }, [patient.id]);

    // Service Worker registration & Local page active-tab timer
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => {
                    console.log('Medicine Reminders Service Worker registered with scope: ', reg.scope);
                })
                .catch(err => {
                    console.error('Service Worker registration failed: ', err);
                });
        }

        const localTimer = setInterval(() => {
            const now = new Date();
            const currentHourMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            
            reminders.forEach((rem) => {
                if (rem.enabled && rem.time === currentHourMin && !activeAlarm) {
                    triggerLocalAlarm(rem);
                }
            });
        }, 30000); // Check every 30 seconds

        return () => {
            clearInterval(localTimer);
            if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
        };
    }, [reminders, activeAlarm]);

    // Parse numeric/text frequencies into daily schedule times
    const getTimesForFrequency = (frequency: string): string[] => {
        const times: string[] = [];
        const freq = frequency.toLowerCase();
        
        if (/^[0-1]-[0-1]-[0-1]$/.test(freq) || /^[0-1]-[0-1]-[0-1]-[0-1]$/.test(freq)) {
            const parts = freq.split('-');
            if (parts[0] === '1') times.push('08:00'); // Morning
            if (parts[1] === '1') times.push('14:00'); // Afternoon
            if (parts[2] === '1') {
                if (parts.length === 4) {
                    times.push('18:00'); // Evening
                    if (parts[3] === '1') times.push('21:00'); // Night
                } else {
                    times.push('20:00'); // Night
                }
            }
        } else {
            if (freq.includes('morning') || freq.includes('breakfast')) times.push('08:00');
            if (freq.includes('afternoon') || freq.includes('lunch')) times.push('14:00');
            if (freq.includes('evening') || freq.includes('tea')) times.push('18:00');
            if (freq.includes('night') || freq.includes('dinner') || freq.includes('bedtime')) times.push('20:00');
        }
        
        if (times.length === 0) {
            times.push('08:00'); // Default to 8 AM
        }
        return times;
    };

    const fetchPrescriptionsAndSync = async () => {
        try {
            setLoading(true);
            const data = await patientService.getMyPrescriptions();
            const parsedMedsList: ParsedMedicine[] = [];
            
            data.forEach((rx: any) => {
                const docName = rx.doctor?.full_name || 'Clinic Specialist';
                const rxDate = new Date(rx.created_at).toLocaleDateString();
                
                if (Array.isArray(rx.medicines)) {
                    rx.medicines.forEach((med: any) => {
                        parsedMedsList.push({
                            id: `${rx.prescription_id}-${med.medicine_name || med.name}`,
                            medicine_name: med.medicine_name || med.name || 'Prescribed Medicine',
                            dosage: med.dosage || '1 dose',
                            frequency: med.frequency || '1-0-1',
                            duration: med.duration || 'As directed',
                            doctor: docName,
                            date: rxDate,
                            prescription_id: rx.prescription_id,
                            times: getTimesForFrequency(med.frequency || '1-0-1')
                        });
                    });
                }
            });

            setPrescribedMeds(parsedMedsList);

            // Load saved alarm toggles from localStorage or construct initial alarms
            const storedAlarms = localStorage.getItem(`reminders_${patient.id}`);
            let currentRemindersList: ActiveReminder[] = [];

            if (storedAlarms) {
                currentRemindersList = JSON.parse(storedAlarms);
            } else {
                // Prepopulate active reminders with enabled flags by default
                parsedMedsList.forEach((med) => {
                    med.times.forEach((t) => {
                        currentRemindersList.push({
                            id: `${med.id}-${t}`,
                            medicine_name: med.medicine_name,
                            dosage: med.dosage,
                            time: t,
                            enabled: true
                        });
                    });
                });
            }

            setReminders(currentRemindersList);
            syncWithServiceWorker(currentRemindersList);
        } catch (error) {
            console.error('Error loading reminders:', error);
        } finally {
            setLoading(false);
        }
    };

    // Synchronize current reminders list with Service Worker for closed-tab support
    const syncWithServiceWorker = (activeList: ActiveReminder[]) => {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            const enabledReminders = activeList.filter(r => r.enabled);
            navigator.serviceWorker.controller.postMessage({
                type: 'SET_REMINDERS',
                reminders: enabledReminders
            });
        }
    };

    // Request permissions for OS alerts
    const requestNotificationPermission = async () => {
        if (!('Notification' in window)) {
            toast.error('Web Notifications are not supported by this browser.');
            return;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            toast.success('Notification permissions granted! You will receive OS alerts directly on your device screen.');
            syncWithServiceWorker(reminders);
        } else {
            toast.error('Notifications permission denied. Please enable permission to receive background alerts.');
        }
    };

    // Toggle alarm status for individual time
    const handleToggleAlarm = (id: string) => {
        const updatedList = reminders.map((r) => {
            if (r.id === id) {
                return { ...r, enabled: !r.enabled };
            }
            return r;
        });
        setReminders(updatedList);
        localStorage.setItem(`reminders_${patient.id}`, JSON.stringify(updatedList));
        syncWithServiceWorker(updatedList);
        toast.success('Schedule settings synced successfully!');
    };

    // Play self-contained synthetic alert tone (Web Audio API)
    const playAlarmSound = () => {
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) return;
            const ctx = new AudioContextClass();
            
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            
            gain.gain.setValueAtTime(0.4, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.4);
        } catch (e) {
            console.error('Web Audio failed:', e);
        }
    };

    // Trigger local screen warning and repeat alarm sound
    const triggerLocalAlarm = (reminder: ActiveReminder) => {
        setActiveAlarm(reminder);
        
        // Show HTML5 desktop alert if permission is active
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification("Time to take your Medicine!", {
                body: `${reminder.medicine_name} - Dose: ${reminder.dosage} (${reminder.time})`,
                requireInteraction: true
            });
        }

        if (!isMuted) {
            playAlarmSound();
            alarmIntervalRef.current = setInterval(() => {
                playAlarmSound();
            }, 3000);
        }
    };

    const handleDismissAlarm = () => {
        if (alarmIntervalRef.current) {
            clearInterval(alarmIntervalRef.current);
            alarmIntervalRef.current = null;
        }
        setActiveAlarm(null);
        toast.success("Medication alarm dismissed. Keep healthy!");
    };

    if (loading) {
        return (
            <div className="p-6 flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-pink-100 dark:border-slate-800 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Bell className="size-6 text-pink-600 animate-bounce" />
                        Medicine Reminders & Screen Alerts
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                        We automatically sync your schedule with instructions written by your doctor.
                    </p>
                </div>
                
                <div className="flex gap-2 shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsMuted(!isMuted)}
                        className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-850"
                    >
                        {isMuted ? <VolumeX className="size-4 mr-2 text-red-500" /> : <Volume2 className="size-4 mr-2 text-green-500" />}
                        {isMuted ? 'Mute Sounds' : 'Alert Sound Active'}
                    </Button>
                    
                    <Button
                        onClick={requestNotificationPermission}
                        className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
                    >
                        <Navigation className="size-4 mr-2" />
                        Enable Screen Alerts
                    </Button>
                </div>
            </div>

            {/* Local Active Alarm Modal Banner */}
            {activeAlarm && (
                <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-500 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse shadow-xl">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="size-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center animate-bounce">
                            <ShieldAlert className="size-8 text-red-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-red-950 dark:text-red-300 text-lg">Medication Alert!</h3>
                            <p className="text-red-800 dark:text-red-400 font-medium">
                                Time to take <span className="font-bold underline">{activeAlarm.medicine_name}</span> ({activeAlarm.dosage})
                            </p>
                            <p className="text-xs text-red-600 dark:text-red-500 mt-1">Scheduled for {activeAlarm.time}</p>
                        </div>
                    </div>
                    <Button
                        onClick={handleDismissAlarm}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-6 rounded-xl text-md"
                    >
                        <Check className="size-5 mr-2" /> I Have Taken It
                    </Button>
                </div>
            )}

            {/* Informational Alerts */}
            <div className="p-4 bg-blue-50 dark:bg-slate-900 border border-blue-200 dark:border-slate-800 rounded-xl flex gap-3 text-xs text-blue-800 dark:text-slate-300">
                <AlertCircle className="size-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                    <p className="font-semibold mb-0.5">How Device Alerts Work:</p>
                    <p className="leading-relaxed">
                        1. Tap **Enable Screen Alerts** above to authorize OS level alerts.
                        <br />
                        2. If you keep this tab open in the background, a local audio alarm and visual alert will sound.
                        <br />
                        3. If you close this tab/window, our background Service Worker will trigger a system notification directly to your device's screen.
                    </p>
                </div>
            </div>

            {/* Prescribed Schedule section */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Pill className="size-5 text-pink-600" />
                    Doctor's Prescribed Medication Plan
                </h2>

                {prescribedMeds.length === 0 ? (
                    <Card className="p-12 text-center border-dashed border-2 border-pink-100 dark:border-slate-850 dark:bg-slate-900">
                        <CardContent className="space-y-4">
                            <Pill className="size-16 text-pink-200 mx-auto" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Prescribed Medicines</h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400">
                                There are no active medicines written on your prescriptions from our clinic.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {prescribedMeds.map((med) => (
                            <Card key={med.id} className="border-pink-100 dark:border-slate-800 dark:bg-slate-900 hover:shadow-lg transition-shadow overflow-hidden">
                                <CardHeader className="bg-pink-50/40 dark:bg-slate-900/50 pb-3 border-b border-pink-100/50 dark:border-slate-800">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <Badge variant="outline" className="text-[10px] uppercase border-pink-200 bg-white dark:bg-slate-950 text-pink-600 font-bold mb-1.5">
                                                {med.duration}
                                            </Badge>
                                            <CardTitle className="text-base text-gray-900 dark:text-white">{med.medicine_name}</CardTitle>
                                        </div>
                                        <Badge className="bg-purple-600 text-white text-[10px]">
                                            {med.frequency}
                                        </Badge>
                                    </div>
                                    <CardDescription className="text-xs dark:text-slate-400">
                                        Dosage: {med.dosage} • Prescribed by Dr. {med.doctor} ({med.date})
                                    </CardDescription>
                                </CardHeader>
                                
                                <CardContent className="p-4 space-y-3">
                                    <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider block">
                                        Alarm Times & Config:
                                    </span>
                                    
                                    <div className="space-y-2">
                                        {med.times.map((t) => {
                                            const reminderItem = reminders.find(r => r.medicine_name === med.medicine_name && r.time === t);
                                            const isEnabled = reminderItem ? reminderItem.enabled : false;
                                            const timeLabel = parseInt(t.split(':')[0]) < 12 ? 'Morning' : (parseInt(t.split(':')[0]) < 16 ? 'Afternoon' : (parseInt(t.split(':')[0]) < 19 ? 'Evening' : 'Night'));
                                            
                                            return (
                                                <div key={t} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-slate-950 rounded-lg border border-gray-100 dark:border-slate-850 text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="size-3.5 text-gray-400" />
                                                        <span className="font-semibold text-gray-700 dark:text-slate-300">{t}</span>
                                                        <Badge variant="outline" className="text-[10px] scale-90 border-slate-200 text-slate-500">
                                                            {timeLabel}
                                                        </Badge>
                                                    </div>
                                                    
                                                    {reminderItem && (
                                                        <Button
                                                            size="sm"
                                                            variant={isEnabled ? 'default' : 'outline'}
                                                            onClick={() => handleToggleAlarm(reminderItem.id)}
                                                            className={`h-7 px-3 text-[10px] font-bold ${
                                                                isEnabled 
                                                                    ? 'bg-pink-600 hover:bg-pink-700 text-white' 
                                                                    : 'dark:border-slate-700 dark:text-slate-400'
                                                            }`}
                                                        >
                                                            {isEnabled ? 'Screen Alarm Active' : 'Alarm Off'}
                                                        </Button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
