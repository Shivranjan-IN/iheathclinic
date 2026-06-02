// Service Worker for Medicine Reminders background tracking
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Cache reminders in memory for background execution
let activeReminders = [];
let tickerInterval = null;

// Start ticker function
function startReminderTicker() {
  if (tickerInterval) clearInterval(tickerInterval);

  tickerInterval = setInterval(() => {
    const now = new Date();
    // Use Local Time HH:MM format
    const currentHourMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    activeReminders.forEach((reminder) => {
      if (reminder.time === currentHourMin) {
        // Trigger OS notification directly on screen
        self.registration.showNotification("Time to take your Medicine!", {
          body: `${reminder.medicine_name} - Dose: ${reminder.dosage} (${reminder.time})`,
          icon: '/favicon.ico',
          vibrate: [200, 100, 200],
          tag: `med-reminder-${reminder.medicine_name}-${reminder.time}`,
          requireInteraction: true
        });
      }
    });
  }, 60000); // Check once every minute
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_REMINDERS') {
    activeReminders = event.data.reminders || [];
    startReminderTicker();
  }
});
