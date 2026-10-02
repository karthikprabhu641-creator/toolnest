/* ============================================
   KE Tools — QR Generator
   Uses the qrcodejs library (loaded via CDN — see README).
   ============================================ */
KE.registerTool("qr", function (container) {
  const TYPES = [
    { id: "url", label: "URL" }, { id: "text", label: "Text" }, { id: "wifi", label: "Wi-Fi" },
    { id: "email", label: "Email" }, { id: "phone", label: "Phone" }, { id: "sms", label: "SMS" },
    { id: "vcard", label: "vCard" }, { id: "location", label: "Location" },
  ];

  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Generated locally in your browser</div>
    <div class="form-row">
      <div class="form-group"><label>Type</label>
        <select id="qr-type">${TYPES.map(t => `<option value="${t.id}">${t.label}</option>`).join("")}</select>
      </div>
      <div class="form-group"><label>Size (px)</label><input type="number" id="qr-size" min="100" max="600" value="260" /></div>
      <div class="form-group"><label>Error correction</label>
        <select id="qr-ecc"><option value="L">Low (L)</option><option value="M" selected>Medium (M)</option><option value="Q">Quartile (Q)</option><option value="H">High (H)</option></select>
      </div>
    </div>
    <div id="qr-fields"></div>
    <div class="btn-row"><button class="btn btn-accent" id="qr-gen">Generate QR code</button></div>
    <div class="qr-canvas-wrap hidden" id="qr-canvas-wrap"></div>
    <div class="btn-row hidden" id="qr-actions">
      <button class="btn btn-sm" id="qr-download-png">Download PNG</button>
    </div>
  `;

  const fieldsBox = container.querySelector("#qr-fields");
  const typeSelect = container.querySelector("#qr-type");
  const wrap = container.querySelector("#qr-canvas-wrap");
  const actions = container.querySelector("#qr-actions");

  const FIELD_TEMPLATES = {
    url: () => `<div class="form-group"><label>URL</label><input type="text" id="f-url" placeholder="https://example.com" /></div>`,
    text: () => `<div class="form-group"><label>Text</label><textarea id="f-text" placeholder="Enter text..." style="min-height:90px;"></textarea></div>`,
    wifi: () => `<div class="form-row">
        <div class="form-group"><label>Network name (SSID)</label><input type="text" id="f-ssid" /></div>
        <div class="form-group"><label>Password</label><input type="text" id="f-pass" /></div>
        <div class="form-group"><label>Security</label><select id="f-sec"><option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">None</option></select></div>
      </div>`,
    email: () => `<div class="form-row">
        <div class="form-group"><label>Email address</label><input type="email" id="f-email" /></div>
        <div class="form-group"><label>Subject</label><input type="text" id="f-subject" /></div>
      </div><div class="form-group"><label>Body</label><textarea id="f-body" style="min-height:70px;"></textarea></div>`,
    phone: () => `<div class="form-group"><label>Phone number</label><input type="text" id="f-phone" placeholder="+1234567890" /></div>`,
    sms: () => `<div class="form-row">
        <div class="form-group"><label>Phone number</label><input type="text" id="f-sms-phone" /></div>
        <div class="form-group"><label>Message</label><input type="text" id="f-sms-msg" /></div>
      </div>`,
    vcard: () => `<div class="form-row">
        <div class="form-group"><label>Full name</label><input type="text" id="f-name" /></div>
        <div class="form-group"><label>Phone</label><input type="text" id="f-vphone" /></div>
      </div><div class="form-group"><label>Email</label><input type="email" id="f-vemail" /></div>`,
    location: () => `<div class="form-row">
        <div class="form-group"><label>Latitude</label><input type="number" step="any" id="f-lat" placeholder="e.g. 12.9716" /></div>
        <div class="form-group"><label>Longitude</label><input type="number" step="any" id="f-lng" placeholder="e.g. 77.5946" /></div>
      </div>`,
  };

  function renderFields() {
    fieldsBox.innerHTML = FIELD_TEMPLATES[typeSelect.value]();
  }
  typeSelect.addEventListener("change", renderFields);
  renderFields();

  function buildPayload() {
    const t = typeSelect.value;
    const v = id => (container.querySelector(id)?.value || "").trim();
    switch (t) {
      case "url": {
        let u = v("#f-url");
        if (!u) throw new Error("Enter a URL.");
        if (!/^https?:\/\//i.test(u)) u = "https://" + u;
        return u;
      }
      case "text": {
        const txt = v("#f-text");
        if (!txt) throw new Error("Enter some text.");
        return txt;
      }
      case "wifi": {
        const ssid = v("#f-ssid"); if (!ssid) throw new Error("Enter a network name.");
        const pass = v("#f-pass"); const sec = container.querySelector("#f-sec").value;
        return `WIFI:T:${sec};S:${ssid};P:${sec === "nopass" ? "" : pass};H:false;;`;
      }
      case "email": {
        const email = v("#f-email"); if (!email) throw new Error("Enter an email address.");
        const subject = encodeURIComponent(v("#f-subject"));
        const body = encodeURIComponent(v("#f-body"));
        return `mailto:${email}?subject=${subject}&body=${body}`;
      }
      case "phone": {
        const phone = v("#f-phone"); if (!phone) throw new Error("Enter a phone number.");
        return `tel:${phone}`;
      }
      case "sms": {
        const phone = v("#f-sms-phone"); if (!phone) throw new Error("Enter a phone number.");
        const msg = v("#f-sms-msg");
        return `SMSTO:${phone}:${msg}`;
      }
      case "vcard": {
        const name = v("#f-name"); if (!name) throw new Error("Enter a name.");
        const phone = v("#f-vphone"); const email = v("#f-vemail");
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
      }
      case "location": {
        const lat = v("#f-lat"), lng = v("#f-lng");
        if (!KE.Utils.isValidNumber(lat) || !KE.Utils.isValidNumber(lng)) throw new Error("Enter valid latitude and longitude.");
        return `geo:${lat},${lng}`;
      }
    }
  }

  container.querySelector("#qr-gen").addEventListener("click", () => {
    if (typeof QRCode === "undefined") {
      KE.Utils.toast("QR library failed to load. Check your internet connection.", "error");
      return;
    }
    let payload;
    try { payload = buildPayload(); }
    catch (e) { KE.Utils.toast(e.message, "error"); return; }

    const size = KE.Utils.clamp(Number(container.querySelector("#qr-size").value) || 260, 100, 600);
    const ecc = container.querySelector("#qr-ecc").value;
    wrap.innerHTML = "";
    wrap.classList.remove("hidden");
    new QRCode(wrap, {
      text: payload, width: size, height: size,
      colorDark: "#000000", colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel[ecc]
    });
    actions.classList.remove("hidden");
  });

  container.querySelector("#qr-download-png").addEventListener("click", () => {
    const canvas = wrap.querySelector("canvas");
    const img = wrap.querySelector("img");
    if (canvas) {
      canvas.toBlob(blob => KE.Utils.downloadBlob("qr-code.png", blob));
    } else if (img && img.src) {
      KE.Utils.downloadBlob("qr-code.png", dataURLtoBlob(img.src));
    } else {
      KE.Utils.toast("Generate a QR code first.", "error");
    }
  });

  function dataURLtoBlob(dataUrl) {
    const [meta, base64] = dataUrl.split(",");
    const mime = meta.match(/:(.*?);/)[1];
    const bin = atob(base64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }
});
