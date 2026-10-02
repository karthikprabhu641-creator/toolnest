/* KE Tools icon system: lightweight inline SVG, fully offline. */
window.KE = window.KE || {};
KE.Icons = (function(){
  const paths = {
    home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-5h5v5"/>',
    search:'<circle cx="10.8" cy="10.8" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    moon:'<path d="M20 15.2A8.5 8.5 0 0 1 8.8 4 8.5 8.5 0 1 0 20 15.2Z"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    monitor:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
    lock:'<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    book:'<path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17H7.5A2.5 2.5 0 0 0 5 21.5z"/><path d="M5 4.5v17M9 6h7"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    calculator:'<rect x="5" y="2.8" width="14" height="18.4" rx="2"/><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01M16 19h.01"/>',
    note:'<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v5h5M9 12h6M9 16h6"/>',
    target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
    key:'<path d="M14.5 6.5a4.5 4.5 0 1 0-1.3 3.2L21 18v-3h-3v-3h-3l-1.8-1.8"/>',
    id:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8" cy="11" r="2"/><path d="M12 10h6M12 14h4"/>',
    link:'<path d="M10 13.8 8.5 15.3a3.5 3.5 0 1 1-5-5L7 6.8a3.5 3.5 0 0 1 5 0"/><path d="m14 10.2 1.5-1.5a3.5 3.5 0 1 1 5 5L17 17.2a3.5 3.5 0 0 1-5 0"/><path d="m8 12 8-4"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    palette:'<path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h2a7 7 0 0 0-2-10Z"/><circle cx="7.5" cy="10" r=".8"/><circle cx="9" cy="6.5" r=".8"/><circle cx="14" cy="6.5" r=".8"/>',
    image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m5 17 4.5-4.5 3 3 2.5-2.5 4 4"/>',
    crop:'<path d="M7 3v11a3 3 0 0 0 3 3h11M17 21V10a3 3 0 0 0-3-3H3"/>',
    rotate:'<path d="M20 7v5h-5"/><path d="M20 12a8 8 0 1 0-2.3 5.7"/>',
    paperclip:'<path d="m20 11-8.5 8.5a5 5 0 0 1-7-7L13 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 6"/>',
    trash:'<path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/>',
    upload:'<path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 13v6h14v-6"/>',
    download:'<path d="M12 4v12M7 11l5 5 5-5"/><path d="M5 20h14"/>',
    scissors:'<circle cx="6" cy="7" r="2"/><circle cx="6" cy="17" r="2"/><path d="m8 8 12 10M8 16 20 6"/>',
    printer:'<path d="M6 9V3h12v6M6 17H4a2 2 0 0 1-2-2v-3a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v3a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v7H6z"/>',
    shuffle:'<path d="M3 7h4c4 0 5 10 10 10h4M17 4l4 3-4 3M3 17h4c1.6 0 2.7-1 3.5-2.3M17 14l4 3-4 3"/>',
    timer:'<circle cx="12" cy="13" r="8"/><path d="M12 13V9M9 2h6M12 5V2"/>',
    tomato:'<circle cx="12" cy="13" r="7"/><path d="M12 6c0-2 2-3 4-3-1.5 2-2.5 3-4 3ZM12 6c0-2-2-3-4-3 1.5 2 2.5 3 4 3Z"/>',
    cake:'<path d="M4 11h16v9H4zM3 11h18M6 7v4M12 7v4M18 7v4"/><path d="M6 7a2 2 0 1 0 4 0M12 7a2 2 0 1 0 4 0"/>',
    hourglass:'<path d="M6 3h12M6 21h12M8 3c0 5 4 5 4 9s-4 4-4 9M16 3c0 5-4 5-4 9s4 4 4 9"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
    star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/>',
    shield:'<path d="M12 3 19 6v5c0 4.5-2.7 7.8-7 10-4.3-2.2-7-5.5-7-10V6z"/><path d="m9 12 2 2 4-4"/>',
    code:'<path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    activity:'<path d="M3 12h4l2-6 4 12 2-6h6"/>',
    percent:'<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2"/><circle cx="17" cy="17" r="2"/>',
    fuel:'<path d="M6 20V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v15M5 20h13M9 7h5v4H9zM17 7l3 3v7a2 2 0 0 0 2 2"/>',
    car:'<path d="M5 16h14l-1-6H6zM3 16h18v4H3z"/><circle cx="7" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/>',
    bolt:'<path d="m13 2-9 12h7l-1 8 9-12h-7z"/>',
    currency:'<circle cx="12" cy="12" r="9"/><path d="M15 8.5c-.7-1-1.7-1.5-3-1.5-1.7 0-3 1-3 2.3 0 3.4 6 1.5 6 4.7 0 1.4-1.2 2.5-3.1 2.5-1.3 0-2.5-.5-3.2-1.6M12 5v14"/>',
    bank:'<path d="M3 10h18M5 10v8M9 10v8M15 10v8M19 10v8M3 21h18M2 10l10-6 10 6"/>',
    signal:'<path d="M5 19v-2M9 19v-5M13 19v-8M17 19V7M21 19V4"/>',
    volume:'<path d="M4 10v4h4l5 4V6l-5 4z"/><path d="M16 9c1.5 1.5 1.5 4.5 0 6M19 6c3 3 3 9 0 12"/>',
    quote:'<path d="M7 7h5v5H7l-2 5M15 7h5v5h-5l-2 5"/>',
    keyboard:'<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M6 10h.01M9 10h.01M12 10h.01M15 10h.01M18 10h.01M7 14h10"/>',
    invoice:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    dice:'<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="8" cy="8" r="1"/><circle cx="16" cy="16" r="1"/><circle cx="12" cy="12" r="1"/>',
    game:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>',
    coin:'<circle cx="12" cy="12" r="9"/><path d="M9 8c1-.8 2.1-1 3-1 2 0 3 1.2 3 2.7 0 3.6-6 2-6 5.1 0 1.4 1.3 2.2 3 2.2 1 0 2-.3 2.8-1"/>'
  };
  const emojiMap = {
    '🔒':'lock','🔍':'search','🌙':'moon','☀️':'sun','🖥️':'monitor','📘':'book','📗':'book','📅':'calendar','🗓️':'calendar','🧮':'calculator','📝':'note','🎯':'target','🔑':'key','🆔':'id','🔗':'link','⏱️':'clock','🎨':'palette','🗜️':'compressor','🔄':'rotate','📐':'crop','✂️':'scissors','🔁':'rotate','🖼️':'image','📎':'paperclip','📤':'upload','🗑️':'trash','↕️':'shuffle','🔃':'rotate','🖨️':'printer','⏲️':'timer','🍅':'tomato','🎂':'cake','⏳':'hourglass','ⓘ':'info','☰':'menu','★':'star','☆':'star','🛡️':'shield'
  };
  const extra = { compressor:'image', dashboard:'home', json:'code', base64:'code', regex:'code', hash:'code', 'html-entities':'code', 'json-csv':'shuffle', qr:'code', barcode:'code', password:'lock', stopwatch:'clock', timer:'timer', pomodoro:'tomato', units:'shuffle', age:'cake', date:'calendar', 'time-difference':'hourglass', converter:'rotate', resizer:'crop', cropper:'crop', rotate:'rotate', 'base64-image':'image', merge:'paperclip', split:'scissors', extract:'upload', 'delete-pages':'trash', reorder:'shuffle', 'rotate-pdf':'rotate', 'images-to-pdf':'printer', 'pdf-to-images':'image' };
  function svg(name, cls='') { const body = paths[name] || paths.code; return `<svg class="ke-icon ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`; }
  function forTool(id, fallback='code'){ return svg(extra[id] || fallback); }
  function replaceEmojiText(root=document.body){
    const walker=document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes=[]; let n; while(n=walker.nextNode()){ if(Object.values(emojiMap).some(Boolean) && /[🔒🔍🌙☀️🖥️📘📗📅🗓️🧮📝🎯🔑🆔🔗⏱️🎨🗜️🔄📐✂️🔁🖼️📎📤🗑️↕️🔃🖨️⏲️🍅🎂⏳ⓘ☰★☆🛡️]/u.test(n.nodeValue)) nodes.push(n); }
    nodes.forEach(node=>{ const frag=document.createDocumentFragment(); const parts=node.nodeValue.split(/(🔒|🔍|🌙|☀️|🖥️|📘|📗|📅|🗓️|🧮|📝|🎯|🔑|🆔|🔗|⏱️|🎨|🗜️|🔄|📐|✂️|🔁|🖼️|📎|📤|🗑️|↕️|🔃|🖨️|⏲️|🍅|🎂|⏳|ⓘ|☰|★|☆|🛡️)/u); parts.forEach(p=>{ if(emojiMap[p]){ const s=document.createElement('span'); s.innerHTML=svg(emojiMap[p]); s.className='ke-inline-icon'; frag.appendChild(s); } else if(p) frag.appendChild(document.createTextNode(p)); }); node.parentNode.replaceChild(frag,node); });
  }
  return {svg, forTool, replaceEmojiText};
})();
