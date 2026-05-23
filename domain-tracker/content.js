(() => {
  // ─── Platform detection (known list) ──────────────────────────────────────
  const PLATFORMS = [
    { match: /godaddy\.com/,              name: 'GoDaddy',          type: 'registrar' },
    { match: /namecheap\.com/,            name: 'Namecheap',        type: 'registrar' },
    { match: /domains\.google\.com/,      name: 'Google Domains',   type: 'registrar' },
    { match: /hover\.com/,                name: 'Hover',            type: 'registrar' },
    { match: /name\.com/,                 name: 'Name.com',         type: 'registrar' },
    { match: /porkbun\.com/,              name: 'Porkbun',          type: 'registrar' },
    { match: /dynadot\.com/,              name: 'Dynadot',          type: 'registrar' },
    { match: /enom\.com/,                 name: 'eNom',             type: 'registrar' },
    { match: /ionos\.com/,                name: 'IONOS',            type: 'registrar' },
    { match: /1and1\./,                   name: '1&1',              type: 'registrar' },
    { match: /register\.com/,             name: 'Register.com',     type: 'registrar' },
    { match: /networksolutions\.com/,     name: 'Network Solutions', type: 'registrar' },
    { match: /bluehost\.com/,             name: 'Bluehost',         type: 'hosting' },
    { match: /hostgator\.com/,            name: 'HostGator',        type: 'hosting' },
    { match: /siteground\.com/,           name: 'SiteGround',       type: 'hosting' },
    { match: /wpengine\.com/,             name: 'WP Engine',        type: 'hosting' },
    { match: /kinsta\.com/,               name: 'Kinsta',           type: 'hosting' },
    { match: /cloudways\.com/,            name: 'Cloudways',        type: 'hosting' },
    { match: /dreamhost\.com/,            name: 'DreamHost',        type: 'hosting' },
    { match: /a2hosting\.com/,            name: 'A2 Hosting',       type: 'hosting' },
    { match: /inmotion/,                  name: 'InMotion',         type: 'hosting' },
    { match: /hostinger\.com/,            name: 'Hostinger',        type: 'hosting' },
    { match: /liquidweb\.com/,            name: 'Liquid Web',       type: 'hosting' },
    { match: /nexcess\.net/,              name: 'Nexcess',          type: 'hosting' },
    { match: /digitalocean\.com/,         name: 'DigitalOcean',     type: 'cloud' },
    { match: /vercel\.com/,               name: 'Vercel',           type: 'cloud' },
    { match: /netlify\.com/,              name: 'Netlify',          type: 'cloud' },
    { match: /heroku\.com/,               name: 'Heroku',           type: 'cloud' },
    { match: /render\.com/,               name: 'Render',           type: 'cloud' },
    { match: /railway\.app/,              name: 'Railway',          type: 'cloud' },
    { match: /fly\.io/,                   name: 'Fly.io',           type: 'cloud' },
    { match: /aws\.amazon\.com/,          name: 'AWS',              type: 'cloud' },
    { match: /azure\.microsoft\.com/,     name: 'Azure',            type: 'cloud' },
    { match: /console\.cloud\.google/,    name: 'Google Cloud',     type: 'cloud' },
    { match: /cloudflare\.com/,           name: 'Cloudflare',       type: 'dns_cdn' },
    { match: /fastly\.com/,               name: 'Fastly',           type: 'dns_cdn' },
    { match: /zoho\.com/,                 name: 'Zoho',             type: 'saas' },
    { match: /gsuite|workspace\.google/,  name: 'Google Workspace', type: 'saas' },
    { match: /microsoft365|office\.com/,  name: 'Microsoft 365',    type: 'saas' },
    { match: /shopify\.com/,              name: 'Shopify',          type: 'saas' },
    { match: /wix\.com/,                  name: 'Wix',              type: 'saas' },
    { match: /squarespace\.com/,          name: 'Squarespace',      type: 'saas' },
    { match: /webflow\.com/,              name: 'Webflow',          type: 'saas' },
    { match: /wordpress\.com/,            name: 'WordPress.com',    type: 'saas' },
    { match: /github\.com/,               name: 'GitHub',           type: 'saas' },
    { match: /gitlab\.com/,               name: 'GitLab',           type: 'saas' },
    { match: /stripe\.com/,               name: 'Stripe',           type: 'saas' },
    { match: /sendgrid\.com/,             name: 'SendGrid',         type: 'saas' },
    { match: /mailchimp\.com/,            name: 'Mailchimp',        type: 'saas' },
    { match: /canva\.com/,                name: 'Canva',            type: 'saas' },
    { match: /figma\.com/,                name: 'Figma',            type: 'saas' },
    { match: /notion\.so/,                name: 'Notion',           type: 'saas' },
    { match: /slack\.com/,                name: 'Slack',            type: 'saas' },
    { match: /trello\.com/,               name: 'Trello',           type: 'saas' },
    { match: /asana\.com/,                name: 'Asana',            type: 'saas' },
    { match: /hubspot\.com/,              name: 'HubSpot',          type: 'saas' },
    { match: /monday\.com/,               name: 'Monday.com',       type: 'saas' },
    { match: /airtable\.com/,             name: 'Airtable',         type: 'saas' },
    { match: /dropbox\.com/,              name: 'Dropbox',          type: 'saas' },
    { match: /box\.com/,                  name: 'Box',              type: 'saas' },
    { match: /zoom\.us/,                  name: 'Zoom',             type: 'saas' },
    { match: /loom\.com/,                 name: 'Loom',             type: 'saas' },
    { match: /typeform\.com/,             name: 'Typeform',         type: 'saas' },
    { match: /hotjar\.com/,               name: 'Hotjar',           type: 'saas' },
    { match: /intercom\.com/,             name: 'Intercom',         type: 'saas' },
    { match: /zendesk\.com/,              name: 'Zendesk',          type: 'saas' },
    { match: /freshdesk\.com/,            name: 'Freshdesk',        type: 'saas' },
    { match: /twilio\.com/,               name: 'Twilio',           type: 'saas' },
    { match: /cloudinary\.com/,           name: 'Cloudinary',       type: 'saas' },
    { match: /algolia\.com/,              name: 'Algolia',          type: 'saas' },
    { match: /supabase\.com/,             name: 'Supabase',         type: 'saas' },
    { match: /firebase\.google\.com/,     name: 'Firebase',         type: 'saas' },
    { match: /planetscale\.com/,          name: 'PlanetScale',      type: 'saas' },
    { match: /mongodb\.com/,              name: 'MongoDB Atlas',    type: 'saas' },
  ];

  const DOMAIN_RE = /\b([a-z0-9](?:[a-z0-9\-]{0,61}[a-z0-9])?\.(?:com|net|org|io|co|app|dev|mx|us|ca|uk|info|biz|online|store|shop|tech|ai|cloud|site|web|pro|xyz|me))\b/gi;

  // ─── Known platform lookup ─────────────────────────────────────────────────
  function detectKnownPlatform(url) {
    for (const p of PLATFORMS) {
      if (p.match.test(url)) return p;
    }
    return null;
  }

  // ─── Fallback: build platform from current hostname + page title ───────────
  function detectFallbackPlatform(url) {
    try {
      const { hostname } = new URL(url);

      // Strip www. and subdomains to get the "brand" part
      // e.g. "app.canva.com" → "canva", "my.hostinger.com" → "hostinger"
      const parts = hostname.replace(/^www\./, '').split('.');

      // Take second-to-last part as brand name (works for .com, .com.mx, etc.)
      // For "app.canva.com" → parts = ["app","canva","com"] → brand = "canva"
      // For "canva.com"     → parts = ["canva","com"]       → brand = "canva"
      const brand = parts.length >= 2 ? parts[parts.length - 2] : parts[0];

      // Capitalize first letter
      const name = brand.charAt(0).toUpperCase() + brand.slice(1);

      // Try to guess type from page title / meta description keywords
      const titleAndMeta = [
        document.title,
        document.querySelector('meta[name="description"]')?.content || '',
        document.querySelector('meta[property="og:description"]')?.content || '',
      ].join(' ').toLowerCase();

      let type = 'saas'; // default
      if (/hosting|host|server|vps|cloud|deploy/i.test(titleAndMeta)) type = 'hosting';
      else if (/domain|dominio|registrar|dns/i.test(titleAndMeta))     type = 'registrar';
      else if (/cloud|infrastructure|compute/i.test(titleAndMeta))     type = 'cloud';
      else if (/email|correo|mail/i.test(titleAndMeta))                type = 'email';
      else if (/cdn|firewall|proxy/i.test(titleAndMeta))               type = 'dns_cdn';

      return {
        name,
        type,
        hostname, // extra info for the popup
        detected: 'auto', // flag so popup knows it was auto-detected
      };
    } catch {
      return null;
    }
  }

  // ─── Main platform detection ───────────────────────────────────────────────
  function detectPlatform(url) {
    return detectKnownPlatform(url) || detectFallbackPlatform(url);
  }

  // ─── Extract domains from page text ───────────────────────────────────────
  function extractDomainsFromPage() {
    const text = document.body?.innerText || '';
    const matches = [...new Set([...text.matchAll(DOMAIN_RE)].map(m => m[1].toLowerCase()))];
    const blacklist = /\.(png|jpg|jpeg|gif|svg|webp|css|js|json|xml|pdf|zip|mp4|mp3|woff|ttf|eot)$/i;
    return matches.filter(d => !blacklist.test(d) && d.length > 4 && d.includes('.'));
  }

  // ─── Date patterns ─────────────────────────────────────────────────────────
  const NUM_DATE     = String.raw`\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4}`;
  const NUM_DATE_ISO = String.raw`\d{4}[\/.\-]\d{1,2}[\/.\-]\d{1,2}`;
  const EN_MONTH     = String.raw`(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)`;
  const ES_MONTH     = String.raw`(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)`;

  const DATE_PATTERN = [
    NUM_DATE,
    NUM_DATE_ISO,
    `${EN_MONTH}\\.?\\s+\\d{1,2},?\\s+\\d{4}`,
    `\\d{1,2}\\s+${EN_MONTH}\\.?\\s+\\d{4}`,
    `(?:\\d{1,2}\\s+de\\s+)?${ES_MONTH}\\s+(?:de\\s+)?\\d{4}`,
    `\\d{1,2}\\s+${ES_MONTH}(?:\\s+de)?\\s+\\d{4}`,
  ].join('|');

  const KEYWORDS = [
    'fecha de vencimiento','fecha de expiraci','fecha de renovaci',
    'fecha de pago','fecha de cobro','fecha de facturaci','fecha de factura',
    'fecha de corte','fecha l.mite','fecha de caducidad','fecha de activaci',
    'fecha de inicio','fecha de registro','fecha de compra','fecha de contrataci','fecha',
    'vence el','vencer.','pr.ximo vencimiento','pr.xima renovaci',
    'pr.ximo cobro','pr.ximo pago','vencimiento','vence',
    'se renueva el','se renueva','se cobra el','se cobra',
    'renovaci','renovar antes de','renovar el','renovar',
    'caduca el','caducidad','caduca',
    'expira el','expiraci','expir.',
    'v.lido hasta','v.lida hasta','vigente hasta','vigencia',
    'activo hasta','activa hasta',
    'termina el','finaliza el','termina','finaliza',
    'fin de vigencia','fin del servicio',
    'cobro autom.tico','cargo autom.tico','cargo el',
    'siguiente factura','siguiente cobro','siguiente pago',
    'ciclo de facturaci','ciclo de pago','periodo de facturaci','periodo de pago',
    'auto.renovaci','autorenovaci','renovaci.n autom.tica','se renueva autom.ticamente',
    'expiration date','expiration','expires on','expires','expiry','expire','expired',
    'renewal date','renews on','renews','renewal','renew',
    'auto-renew','auto renew','auto renewal','next renewal',
    'next billing','next charge','next payment','next invoice',
    'billing date','billing cycle','billing period',
    'payment date','due date','due on','invoice date',
    'valid until','valid through','valid thru','validity',
    'active until','active through',
    'subscription ends','subscription end','subscription renews',
    'plan renews','plan expires','domain expires','domain expiry',
    'registered until','registration expires','registration expiry',
    'ends on','ends at','termination date','cancellation date',
  ];

  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  const KW_PATTERN = KEYWORDS.map(escRe).join('|');

  function extractDatesFromPage() {
    const text = document.body?.innerText || '';
    const dates = [];
    let m;
    const fwdRe = new RegExp(`(?:${KW_PATTERN})[^\\d\\n]{0,40}(${DATE_PATTERN})`, 'gi');
    while ((m = fwdRe.exec(text)) !== null) dates.push(m[1].trim());
    const revRe = new RegExp(`(${DATE_PATTERN})[^\\d\\n]{0,40}(?:${KW_PATTERN})`, 'gi');
    while ((m = revRe.exec(text)) !== null) dates.push(m[1].trim());
    return [...new Set(dates)];
  }

  function extractPricesFromPage() {
    const text = document.body?.innerText || '';
    const priceRe = /(?:\$|USD|MXN|€|£)\s*(\d+(?:[.,]\d{1,2})?)/g;
    const prices = [];
    let m;
    while ((m = priceRe.exec(text)) !== null) prices.push(m[0].trim());
    return [...new Set(prices)].slice(0, 10);
  }

  function scan() {
    const url = window.location.href;
    return {
      platform : detectPlatform(url),
      domains  : extractDomainsFromPage(),
      dates    : extractDatesFromPage(),
      prices   : extractPricesFromPage(),
      pageTitle: document.title,
      pageUrl  : url,
    };
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.action === 'scan') sendResponse(scan());
  });
})();
