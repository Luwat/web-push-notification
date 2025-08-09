/* global clients */
/* global firebase */
/* global importScripts */

importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);
fetch("/firebase-config.json")
  .then((response) => {
    return response.json();
  })
  .then((config) => {
    firebase.initializeApp(config.firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      console.log("Received background message ", payload);
      self.registration.showNotification(payload.notification.title, {
        body: payload.notification.body,
        icon: payload.notification.icon,
      });
    });
  })
  .catch((error) => {
    console.error("Error initializing Firebase in service worker:", error);
  });

self.addEventListener("push", (event) => {
  let data = {};

  if (event.data) {
    data = event.data.json();
  }

  console.log("Push payload received:", data);

  const title = data.notification?.title || "Default title";
  const body = data.notification?.body || "Default body";
  const icon = data.notification?.icon || "/firebase-logo.png";

  const options = {
    body,
    icon,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked", event.data.json());
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      if (clientList.length > 0) {
        console.log(clientList);
        return clientList[0].focus();
      }
      return clients.openWindow("/");
    })
  );
});

self.addEventListener("pushsubscriptionchange", (event) => {
  console.log("Push subscription changed.", event.data.json());
  // You can handle resubscription here if needed
});
