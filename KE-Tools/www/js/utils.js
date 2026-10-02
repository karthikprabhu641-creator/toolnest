/* ============================================
   KE Tools — utils.js
   Generic helpers shared across every tool.
   ============================================ */
window.KE = window.KE || {};

KE.Utils = (function(){

  function escapeHtml(str){
    return String(str)
      .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;").replace(/'/g,"&#039;");
  }

  function formatBytes(bytes, decimals = 2){
    if(bytes === 0) return "0 Bytes";
    if(bytes === undefined || bytes === null || isNaN(bytes)) return "—";
    const k = 1024;
    const sizes = ["Bytes","KB","MB","GB","TB"];
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i];
  }

  function debounce(fn, wait = 200){
    let t;
    return function(...args){
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function pad(n, len = 2){
    return String(n).padStart(len, "0");
  }

  function uid(){
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function copyToClipboard(text){
    return new Promise((resolve, reject) => {
      if(navigator.clipboard && window.isSecureContext){
        navigator.clipboard.writeText(text).then(resolve).catch(() => fallback());
      } else {
        fallback();
      }
      function fallback(){
        try{
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.focus(); ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          resolve();
        }catch(e){ reject(e); }
      }
    });
  }

  function downloadText(filename, text, mime = "text/plain"){
    const blob = new Blob([text], { type: mime });
    downloadBlob(filename, blob);
  }

  function downloadBlob(filename, blob){
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function readFileAsText(file){
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => reject(r.error);
      r.readAsText(file);
    });
  }

  function readFileAsDataURL(file){
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => reject(r.error);
      r.readAsDataURL(file);
    });
  }

  function readFileAsArrayBuffer(file){
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => reject(r.error);
      r.readAsArrayBuffer(file);
    });
  }

  function loadImage(src){
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not load image."));
      img.src = src;
    });
  }

  function el(tag, attrs = {}, children = []){
    const node = document.createElement(tag);
    for(const k in attrs){
      if(k === "class") node.className = attrs[k];
      else if(k === "html") node.innerHTML = attrs[k];
      else if(k.startsWith("on") && typeof attrs[k] === "function") node.addEventListener(k.slice(2), attrs[k]);
      else node.setAttribute(k, attrs[k]);
    }
    (Array.isArray(children) ? children : [children]).forEach(c => {
      if(c === null || c === undefined) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  function toast(message, type = "info", timeout = 3200){
    let stack = document.getElementById("toast-stack");
    if(!stack){
      stack = document.createElement("div");
      stack.id = "toast-stack";
      stack.className = "toast-stack";
      document.body.appendChild(stack);
    }
    const icon = type === "success" ? "✓" : type === "error" ? "✕" : "ℹ";
    const t = document.createElement("div");
    t.className = "toast " + type;
    t.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
    stack.appendChild(t);
    setTimeout(() => { t.remove(); }, timeout);
  }

  function clamp(n, min, max){ return Math.min(max, Math.max(min, n)); }

  function isValidNumber(v){
    return v !== "" && v !== null && v !== undefined && !isNaN(Number(v));
  }

  // Parses a page-range string like "1,3,5-7" into a 0-indexed, de-duplicated,
  // sorted array of page indices. `pageCount` is used to validate bounds.
  function parsePageRange(str, pageCount){
    if(!str || !str.trim()) throw new Error("Enter a page range, e.g. 1,3,5-7");
    const indices = new Set();
    const parts = str.split(",").map(p => p.trim()).filter(Boolean);
    for(const part of parts){
      const rangeMatch = /^(\d+)\s*-\s*(\d+)$/.exec(part);
      if(rangeMatch){
        let [a,b] = [Number(rangeMatch[1]), Number(rangeMatch[2])];
        if(a > b) [a,b] = [b,a];
        for(let i=a;i<=b;i++) indices.add(i);
      } else if(/^\d+$/.test(part)){
        indices.add(Number(part));
      } else {
        throw new Error(`"${part}" isn't a valid page number or range.`);
      }
    }
    const sorted = [...indices].sort((a,b) => a-b);
    for(const n of sorted){
      if(n < 1 || n > pageCount) throw new Error(`Page ${n} is out of range (this PDF has ${pageCount} pages).`);
    }
    return sorted.map(n => n - 1);
  }

  // Renders every page of a PDF (given as ArrayBuffer) to small canvases using
  // PDF.js. Returns an array of { pageNum, canvas }. Requires pdfjsLib (CDN).
  async function renderPdfThumbnails(arrayBuffer, targetWidth = 130){
    if(typeof pdfjsLib === "undefined") throw new Error("PDF rendering library failed to load. Check your internet connection.");
    if(!pdfjsLib.GlobalWorkerOptions.workerSrc){
      pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
    const thumbs = [];
    for(let i = 1; i <= pdf.numPages; i++){
      const page = await pdf.getPage(i);
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = targetWidth / baseViewport.width;
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width; canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
      thumbs.push({ pageNum: i, canvas });
    }
    return thumbs;
  }

  return {
    escapeHtml, formatBytes, debounce, pad, uid, copyToClipboard,
    downloadText, downloadBlob, readFileAsText, readFileAsDataURL,
    readFileAsArrayBuffer, loadImage, el, toast, clamp, isValidNumber,
    parsePageRange, renderPdfThumbnails
  };
})();
