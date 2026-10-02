/* ============================================
   KE Tools — Unit Converter
   ============================================ */
KE.registerTool("units", function(container){
  const CATEGORIES = {
    length: { label:"Length", units:{ m:1, km:1000, cm:0.01, mm:0.001, mi:1609.344, yd:0.9144, ft:0.3048, in:0.0254, nmi:1852 } },
    weight: { label:"Weight", units:{ kg:1, g:0.001, mg:0.000001, t:1000, lb:0.45359237, oz:0.028349523125, st:6.35029318 } },
    temperature: { label:"Temperature", special:true },
    area: { label:"Area", units:{ "m²":1, "km²":1e6, "cm²":0.0001, "ha":10000, "acre":4046.8564224, "ft²":0.09290304, "mi²":2589988.110336 } },
    volume: { label:"Volume", units:{ l:1, ml:0.001, "m³":1000, "gal (US)":3.785411784, "qt (US)":0.946352946, "cup (US)":0.2365882365, "fl oz (US)":0.0295735295625 } },
    speed: { label:"Speed", units:{ "m/s":1, "km/h":0.277777778, "mph":0.44704, "knot":0.514444444, "ft/s":0.3048 } },
    time: { label:"Time", units:{ s:1, ms:0.001, min:60, hr:3600, day:86400, week:604800, year:31557600 } },
    data: { label:"Data", units:{ B:1, KB:1024, MB:1048576, GB:1073741824, TB:1099511627776, bit:0.125 } },
  };

  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="form-row">
      <div class="form-group"><label>Category</label>
        <select id="un-cat">${Object.keys(CATEGORIES).map(k => `<option value="${k}">${CATEGORIES[k].label}</option>`).join("")}</select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>From</label>
        <input type="number" id="un-from-val" value="1" step="any" />
        <select id="un-from-unit" style="margin-top:8px;"></select>
      </div>
      <div class="form-group"><label>To</label>
        <input type="text" id="un-to-val" disabled />
        <select id="un-to-unit" style="margin-top:8px;"></select>
      </div>
    </div>
  `;
  const catSelect = container.querySelector("#un-cat");
  const fromVal = container.querySelector("#un-from-val");
  const toVal = container.querySelector("#un-to-val");
  const fromUnit = container.querySelector("#un-from-unit");
  const toUnit = container.querySelector("#un-to-unit");

  function populateUnits(catKey){
    const cat = CATEGORIES[catKey];
    const keys = cat.special ? ["Celsius","Fahrenheit","Kelvin"] : Object.keys(cat.units);
    fromUnit.innerHTML = keys.map((k,i) => `<option value="${k}" ${i===0?"selected":""}>${k}</option>`).join("");
    toUnit.innerHTML = keys.map((k,i) => `<option value="${k}" ${i===1?"selected":""}>${k}</option>`).join("");
  }

  function convertTemp(val, from, to){
    let c;
    if(from === "Celsius") c = val;
    else if(from === "Fahrenheit") c = (val - 32) * 5/9;
    else c = val - 273.15;
    if(to === "Celsius") return c;
    if(to === "Fahrenheit") return c * 9/5 + 32;
    return c + 273.15;
  }

  function calc(){
    const catKey = catSelect.value;
    const cat = CATEGORIES[catKey];
    const val = Number(fromVal.value);
    if(!KE.Utils.isValidNumber(fromVal.value)){ toVal.value = ""; return; }
    let result;
    if(cat.special){
      result = convertTemp(val, fromUnit.value, toUnit.value);
    } else {
      const baseVal = val * cat.units[fromUnit.value];
      result = baseVal / cat.units[toUnit.value];
    }
    toVal.value = (Math.round(result * 1e6) / 1e6).toString();
  }

  catSelect.addEventListener("change", () => { populateUnits(catSelect.value); calc(); });
  [fromVal, fromUnit, toUnit].forEach(el => el.addEventListener("input", calc));

  populateUnits("length");
  calc();
});
