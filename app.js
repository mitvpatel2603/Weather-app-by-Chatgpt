const el = id => document.getElementById(id);
const state = { celsius: true, data: null };
const codes = {0:['☀️','Clear sky'],1:['🌤️','Mostly sunny'],2:['⛅','Partly cloudy'],3:['☁️','Overcast'],45:['🌫️','Foggy'],48:['🌫️','Foggy'],51:['🌦️','Light drizzle'],53:['🌦️','Drizzle'],55:['🌧️','Heavy drizzle'],61:['🌧️','Light rain'],63:['🌧️','Rain showers'],65:['🌧️','Heavy rain'],71:['🌨️','Light snow'],73:['🌨️','Snow'],75:['❄️','Heavy snow'],80:['🌦️','Rain showers'],81:['🌧️','Rain showers'],82:['⛈️','Heavy showers'],95:['⛈️','Thunderstorms']};
const fmt = new Intl.DateTimeFormat(undefined,{weekday:'short',month:'short',day:'numeric'});
const formatTime = value => value ? new Intl.DateTimeFormat(undefined,{hour:'numeric',minute:'2-digit'}).format(new Date(value)) : '—';
const temp = value => state.celsius ? Math.round(value) : Math.round(value * 9/5 + 32);
const toast = message => { const t=el('toast');t.textContent=message;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3200); };

function render(data){
  state.data=data; const {current,daily,place}=data; const info=codes[current.weather_code]||codes[0];
  el('place-name').textContent=place; el('date-label').textContent=new Intl.DateTimeFormat(undefined,{weekday:'long',month:'long',day:'numeric'}).format(new Date());
  el('condition-label').textContent=info[1]; el('temperature').textContent=temp(current.temperature_2m); el('unit-toggle').textContent=state.celsius?'C':'F';
  el('feels-like').textContent=`Feels like ${temp(current.apparent_temperature)}°`; el('wind').textContent=`${Math.round(current.wind_speed_10m)} km/h`;el('humidity').textContent=`${current.relative_humidity_2m}%`;el('visibility').textContent=current.visibility?`${(current.visibility/1000).toFixed(1)} km`:'—';
  el('sunrise').textContent=formatTime(daily.sunrise[0]);el('sunset').textContent=formatTime(daily.sunset[0]);el('uv').textContent=Math.round(daily.uv_index_max[0]||0); el('uv-caption').textContent=(daily.uv_index_max[0]||0)<3?'Low':daily.uv_index_max[0]<6?'Moderate':'High';el('precipitation').textContent=`${daily.precipitation_probability_max[0]||0}%`;
  el('forecast-grid').innerHTML=daily.time.slice(0,5).map((date,i)=>{const c=codes[daily.weather_code[i]]||codes[0];return `<article class="forecast-card ${i===0?'today':''}"><div class="day">${i===0?'Today':new Intl.DateTimeFormat(undefined,{weekday:'long'}).format(new Date(date+'T12:00'))}</div><div class="date">${fmt.format(new Date(date+'T12:00'))}</div><div class="weather-icon">${c[0]}</div><div class="temps">${temp(daily.temperature_2m_max[i])}° <span>${temp(daily.temperature_2m_min[i])}°</span></div><p class="rain">☂ ${daily.precipitation_probability_max[i]||0}% rain</p></article>`}).join('');
}
async function loadWeather(latitude,longitude,place){
  document.body.classList.add('loading');
  try{const url=`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max&timezone=auto&forecast_days=5`;const r=await fetch(url);if(!r.ok)throw Error();render({...await r.json(),place});}
  catch{toast('Weather service is unavailable. Please try again.');}
  finally{document.body.classList.remove('loading');}
}
async function searchCity(query){
  if(!query.trim())return; try{const r=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`);const json=await r.json();const p=json.results?.[0];if(!p){toast('We couldn’t find that city. Try another search.');return;}loadWeather(p.latitude,p.longitude,`${p.name}${p.country?', '+p.country:''}`)}catch{toast('Search is unavailable. Please try again.');}}
el('search-form').addEventListener('submit',e=>{e.preventDefault();searchCity(el('city-input').value)});
el('unit-toggle').addEventListener('click',()=>{state.celsius=!state.celsius;if(state.data)render(state.data)});
el('location-btn').addEventListener('click',()=>{if(!navigator.geolocation){toast('Location is not supported by this browser.');return;}navigator.geolocation.getCurrentPosition(p=>loadWeather(p.coords.latitude,p.coords.longitude,'Your location'),()=>toast('Location access was not granted. Search for a city instead.'),{timeout:10000});});
loadWeather(28.6139,77.2090,'New Delhi, India');
