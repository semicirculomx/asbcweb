// ── Helpers ──────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const show = id => $(id).classList.remove("hidden");
const hide = id => $(id).classList.add("hidden");

const TYPE_ICONS = {
  domain: "🌐", hosting: "🖥️", cloud: "☁️",
  saas: "📦", dns_cdn: "🔀", email: "📧", other: "🔧"
};
const TYPE_LABELS = {
  domain: "Dominio", hosting: "Hosting", cloud: "Cloud",
  saas: "SaaS", dns_cdn: "DNS/CDN", email: "Email", other: "Otro"
};
const PLATFORM_TYPE_ICONS = {
  registrar: "🌐", hosting: "🖥️", cloud: "☁️", dns_cdn: "🔀", saas: "📦"
};

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function showToast(msg, isError = false) {
  const t = $("toast");
  t.textContent = msg;
  t.className = "toast" + (isError ? " error" : "");
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.add("hidden"), 2500);
}

// ── State ───────────────────────────────────────────────────────────────────────
let scanData  = null;
let editingId = null;

// ── Valores seleccionados ANTES de abrir el form ─────────────────────────────
let pendingCost   = "";   // precio clickeado en los tags
let pendingExpiry = "";   // fecha clickeada en los tags

// ── On load ───────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  $("btn-scan").addEventListener("click", doScan);
  $("btn-dashboard").addEventListener("click", openDashboard);
  $("btn-save").addEventListener("click", saveItem);
  $("btn-back").addEventListener("click", () => {
    hide("form-section");
    show("results-section");
  });
});

// ── Scan ────────────────────────────────────────────────────────────────────────
async function doScan() {
  $('btn-scan').disabled = true;
  $('btn-scan').textContent = 'Escaneando…';

  // Reset pending values each new scan
  pendingCost   = "";
  pendingExpiry = "";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    }).catch(() => {});

    const res = await chrome.tabs.sendMessage(tab.id, { action: 'scan' });
    scanData = res;
    renderResults(res, tab.url);
  } catch (e) {
    showToast('No se pudo escanear esta página.', true);
  } finally {
    $('btn-scan').disabled = false;
    $('btn-scan').innerHTML = '<span class="btn-icon-left">🔍</span> Escanear esta página';
  }
}

function renderResults(data, tabUrl) {
  hide('scan-section');
  show('results-section');

  // Platform badge
  if (data.platform) {
    const badge = $('platform-badge');
    badge.innerHTML = `
      <span>${PLATFORM_TYPE_ICONS[data.platform.type] || '🔧'}</span>
      <span><strong>${data.platform.name}</strong></span>
      <span class="ptype">${data.platform.type}</span>
    `;
    show('platform-badge');
  }

  // Domains
  const domainList = $('domain-list');
  domainList.innerHTML = '';
  const allDomains = [...new Set(data.domains)];

  if (allDomains.length > 0) {
    show('domains-section');
    hide('no-domains');
    allDomains.forEach(domain => {
      const el = document.createElement('div');
      el.className = 'domain-item';
      el.innerHTML = `
        <span style="font-size:18px">🌐</span>
        <div>
          <div class="domain-name">${domain}</div>
          <div class="domain-sub">${data.platform ? data.platform.name : 'Plataforma desconocida'}</div>
        </div>
      `;
      el.addEventListener('click', () => openForm({ domain, data, tabUrl }));
      domainList.appendChild(el);
    });
  } else {
    hide('domains-section');
    show('no-domains');
  }

  // Platform as service option
  if (data.platform) {
    const el = document.createElement('div');
    el.className = 'domain-item';
    el.innerHTML = `
      <span style="font-size:18px">${PLATFORM_TYPE_ICONS[data.platform.type] || '🔧'}</span>
      <div>
        <div class="domain-name">${data.platform.name}</div>
        <div class="domain-sub">Agregar como ${TYPE_LABELS[data.platform.type] || 'servicio'}</div>
      </div>
    `;
    el.addEventListener('click', () => openForm({ platform: data.platform, data, tabUrl }));
    domainList.appendChild(el);
    show('domains-section');
    hide('no-domains');
  }

  // ── Prices: clicking a tag GUARDA en pendingCost (no en el campo todavía)
  if (data.prices?.length) {
    const pl = $('prices-list');
    pl.innerHTML = data.prices.map(p => `<span class="tag price-tag">${p}</span>`).join('');
    pl.querySelectorAll('.tag').forEach(t => {
      t.addEventListener('click', () => {
        // Deselect all, mark this one
        pl.querySelectorAll('.tag').forEach(x => x.classList.remove('selected'));
        t.classList.add('selected');
        pendingCost = t.textContent.trim();
        showToast('Precio seleccionado ✔ (se copiará al abrir el formulario)');
      });
    });
    show('prices-hint');
  }

  // ── Dates: clicking a tag GUARDA en pendingExpiry
  if (data.dates?.length) {
    const dl = $('dates-list');
    dl.innerHTML = data.dates.map(d => `<span class="tag date-tag">${d}</span>`).join('');
    dl.querySelectorAll('.tag').forEach(t => {
      t.addEventListener('click', () => {
        dl.querySelectorAll('.tag').forEach(x => x.classList.remove('selected'));
        t.classList.add('selected');
        // Parse to YYYY-MM-DD for the date input
        const parsed = parseDate(t.textContent.trim());
        pendingExpiry = parsed || "";
        showToast(parsed
          ? 'Fecha seleccionada ✔ (se copiará al abrir el formulario)'
          : 'No se pudo parsear la fecha, ágrela manualmente.');
      });
    });
    show('dates-hint');
  }
}

// ── Parse a loose date string → "YYYY-MM-DD" ----------------------------------------
function parseDate(str) {
  if (!str) return "";

  // Try native Date parse first (works for ISO and many EN formats)
  const native = new Date(str);
  if (!isNaN(native)) return native.toISOString().split('T')[0];

  // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const dmy = str.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    const full = y.length === 2 ? '20' + y : y;
    const dt = new Date(`${full}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`);
    if (!isNaN(dt)) return dt.toISOString().split('T')[0];
  }

  // Spanish: "5 de enero de 2026" or "enero de 2026"
  const ES_MONTHS = {
    enero:1,febrero:2,marzo:3,abril:4,mayo:5,junio:6,
    julio:7,agosto:8,septiembre:9,octubre:10,noviembre:11,diciembre:12
  };
  const esMatch = str.toLowerCase().match(
    /(\d{1,2})?\s*(?:de\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+(?:de\s+)?(\d{4})/
  );
  if (esMatch) {
    const day = esMatch[1] || '1';
    const month = String(ES_MONTHS[esMatch[2]]).padStart(2,'0');
    const year = esMatch[3];
    const dt = new Date(`${year}-${month}-${day.padStart(2,'0')}`);
    if (!isNaN(dt)) return dt.toISOString().split('T')[0];
  }

  return "";
}

// ── Form ────────────────────────────────────────────────────────────────────────
function openForm({ domain, platform, data, tabUrl, item } = {}) {
  hide('results-section');
  hide('scan-section');
  show('form-section');
  editingId = item?.id || null;

  $('form-title').textContent = editingId ? 'Editar registro' : 'Agregar registro';

  if (item) {
    // Editing existing record
    $('f-name').value     = item.name;
    $('f-type').value     = item.type;
    $('f-platform').value = item.platform;
    $('f-cost').value     = item.cost;
    $('f-cycle').value    = item.cycle;
    $('f-expiry').value   = item.expiry;
    $('f-link').value     = item.link;
    $('f-notes').value    = item.notes;
    return;
  }

  // ── Pre-fill from scan data
  if (domain) {
    $('f-name').value = domain;
    $('f-type').value = 'domain';
  } else if (platform) {
    $('f-name').value = platform.name;
    $('f-type').value = platform.type === 'registrar' ? 'domain' : platform.type;
  }

  if (data?.platform) {
    $('f-platform').value = data.platform.name;
    if (!domain) {
      $('f-type').value = data.platform.type === 'registrar' ? 'domain' : data.platform.type;
    }
  }

  $('f-link').value = tabUrl || '';
  $('f-notes').value = '';

  // ── KEY FIX: apply the pending price/date AHORA que el form ya se muestra
  $('f-cost').value   = pendingCost;    // "" if nothing was selected — that's fine
  $('f-expiry').value = pendingExpiry;  // "" if nothing was selected
}

async function saveItem() {
  const name     = $('f-name').value.trim();
  const platform = $('f-platform').value.trim();

  if (!name)     { showToast('El nombre es requerido.', true); return; }
  if (!platform) { showToast('La plataforma es requerida.', true); return; }

  const item = {
    id       : editingId || uid(),
    name,
    type     : $('f-type').value,
    platform,
    cost     : $('f-cost').value.trim(),
    cycle    : $('f-cycle').value,
    expiry   : $('f-expiry').value,
    link     : $('f-link').value.trim(),
    notes    : $('f-notes').value.trim(),
    updatedAt: new Date().toISOString(),
  };
  if (!editingId) item.createdAt = item.updatedAt;

  chrome.runtime.sendMessage({ action: 'saveItem', item }, () => {
    showToast(editingId ? 'Registro actualizado ✓' : 'Registro guardado ✓');
    // Reset pending values after save
    pendingCost   = '';
    pendingExpiry = '';
    setTimeout(() => {
      hide('form-section');
      show('scan-section');
    }, 1200);
  });
}

function openDashboard() {
  chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
}
