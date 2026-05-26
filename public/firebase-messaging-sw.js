importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyC_Niy6WGDptax5GtXUGVB3IptOv7VW2O0",
  authDomain: "tracker-7f675.firebaseapp.com",
  projectId: "tracker-7f675",
  storageBucket: "tracker-7f675.appspot.com",
  messagingSenderId: "300099586592",
  appId: "1:300099586592:web:0c029949ead878d1620a45",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icons/icon-192x192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// PWA offline criteria handler
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
