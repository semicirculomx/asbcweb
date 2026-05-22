// ─── Storage helpers ──────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === "getItems") {
    chrome.storage.local.get(["items"], (res) => {
      sendResponse({ items: res.items || [] });
    });
    return true;
  }

  if (msg.action === "saveItem") {
    chrome.storage.local.get(["items"], (res) => {
      const items = res.items || [];
      const idx = items.findIndex(i => i.id === msg.item.id);
      if (idx >= 0) {
        items[idx] = msg.item;
      } else {
        items.push(msg.item);
      }
      chrome.storage.local.set({ items }, () => {
        scheduleExpiryAlarms(items);
        sendResponse({ ok: true });
      });
    });
    return true;
  }

  if (msg.action === "deleteItem") {
    chrome.storage.local.get(["items"], (res) => {
      const items = (res.items || []).filter(i => i.id !== msg.id);
      chrome.storage.local.set({ items }, () => {
        scheduleExpiryAlarms(items);
        sendResponse({ ok: true });
      });
    });
    return true;
  }
});

// ─── Schedule alarms on install / startup ─────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  // Check every day at startup
  chrome.alarms.create("dailyExpiryCheck", {
    periodInMinutes: 1440 // 24 horas
  });
  runExpiryCheck();
});

chrome.runtime.onStartup.addListener(() => {
  runExpiryCheck();
});

// ─── Alarm fired ──────────────────────────────────────────────────────────────
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "dailyExpiryCheck") {
    runExpiryCheck();
  }

  // Individual item alarm: "expiry_<id>"
  if (alarm.name.startsWith("expiry_")) {
    const id = alarm.name.replace("expiry_", "");
    chrome.storage.local.get(["items"], (res) => {
      const item = (res.items || []).find(i => i.id === id);
      if (item) fireNotification(item, 1);
    });
  }
});

// ─── Daily check: find items expiring in exactly 1 day ────────────────────────
function runExpiryCheck() {
  chrome.storage.local.get(["items"], (res) => {
    const items = res.items || [];
    const today = stripTime(new Date());

    items.forEach(item => {
      if (!item.expiry) return;
      const expiry = stripTime(new Date(item.expiry));
      const diffDays = Math.round((expiry - today) / 86400000);

      if (diffDays === 1) {
        fireNotification(item, 1);
      } else if (diffDays === 0) {
        fireNotification(item, 0);
      } else if (diffDays < 0) {
        fireNotification(item, diffDays);
      }
    });
  });
}

// ─── Schedule a precise alarm for each item 1 day before expiry ───────────────
function scheduleExpiryAlarms(items) {
  // Clear all existing expiry alarms first
  chrome.alarms.getAll((alarms) => {
    alarms
      .filter(a => a.name.startsWith("expiry_"))
      .forEach(a => chrome.alarms.clear(a.name));

    items.forEach(item => {
      if (!item.expiry) return;

      const expiry  = new Date(item.expiry);
      // Fire alarm 1 day before at 09:00 local time
      const alertAt = new Date(expiry);
      alertAt.setDate(alertAt.getDate() - 1);
      alertAt.setHours(9, 0, 0, 0);

      const now = Date.now();
      if (alertAt.getTime() > now) {
        chrome.alarms.create(`expiry_${item.id}`, {
          when: alertAt.getTime()
        });
      }
    });
  });
}

// ─── Fire a Chrome notification ───────────────────────────────────────────────
function fireNotification(item, diffDays) {
  const TYPE_ICONS = {
    domain : "🌐", hosting: "🖥️", cloud: "☁️",
    saas   : "📦", dns_cdn: "🔀", email: "📧", other: "🔧"
  };

  let title, message;

  if (diffDays === 1) {
    title   = `⚠️ Vence mañana — ${item.name}`;
    message = `Tu ${item.type === "domain" ? "dominio" : "suscripción"} en ${item.platform} vence mañana.`
            + (item.cost ? ` Costo: ${item.cost}.` : "");
  } else if (diffDays === 0) {
    title   = `🔴 Vence HOY — ${item.name}`;
    message = `${item.name} vence HOY en ${item.platform}.`
            + (item.link ? " Renuévalo cuanto antes." : "");
  } else if (diffDays < 0) {
    title   = `⛔ Vencido — ${item.name}`;
    message = `${item.name} venció hace ${Math.abs(diffDays)} día${Math.abs(diffDays) > 1 ? "s" : ""} en ${item.platform}.`;
  }

  const notifId = `domain-tracker-${item.id}-${diffDays}`;

  chrome.notifications.create(notifId, {
    type    : "basic",
    iconUrl : "icons/icon128.png",
    title,
    message,
    priority: 2,
    buttons : item.link
      ? [{ title: "Abrir plataforma" }]
      : []
  });

  // If the item has a link, open it when the user clicks the button
  chrome.notifications.onButtonClicked.addListener((id, btnIdx) => {
    if (id === notifId && btnIdx === 0 && item.link) {
      chrome.tabs.create({ url: item.link });
    }
  });
}

// ─── Util ─────────────────────────────────────────────────────────────────────
function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
