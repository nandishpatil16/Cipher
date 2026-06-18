'use strict';
/* ═══════════════════════════════════════════════
   CIPHER v4 — app.js
   AES-256-GCM · PBKDF2 · Zero-knowledge vault
═══════════════════════════════════════════════ */

// ── State ────────────────────────────────────────
let vault=[], masterKey=null, activeFilter='all', editingId=null;
let genMode='random', genPw='', genHistory=[], clipHistory=[];
let autoLockMins=0, autoLockTimer=null, inactivityTimer=null;
let tplFilter='all';

const VAULT_KEY='cipher_vault_v4';
const META_KEY='cipher_meta_v4';
const THEME_KEY='cipher_theme';
const AL_KEY='cipher_autolock';
const ITERS=150000;

// ── Site Templates ───────────────────────────────
const TEMPLATES=[
  // Social
  {name:'Google',url:'https://accounts.google.com',cat:'social',emoji:'🔵'},
  {name:'Facebook',url:'https://facebook.com',cat:'social',emoji:'📘'},
  {name:'Instagram',url:'https://instagram.com',cat:'social',emoji:'📸'},
  {name:'Twitter / X',url:'https://x.com',cat:'social',emoji:'🐦'},
  {name:'LinkedIn',url:'https://linkedin.com',cat:'social',emoji:'🔗'},
  {name:'TikTok',url:'https://tiktok.com',cat:'social',emoji:'🎵'},
  {name:'YouTube',url:'https://youtube.com',cat:'social',emoji:'▶️'},
  {name:'Reddit',url:'https://reddit.com',cat:'social',emoji:'🤖'},
  {name:'Snapchat',url:'https://snapchat.com',cat:'social',emoji:'👻'},
  {name:'Discord',url:'https://discord.com',cat:'social',emoji:'💜'},
  {name:'Telegram',url:'https://telegram.org',cat:'social',emoji:'✈️'},
  {name:'Pinterest',url:'https://pinterest.com',cat:'social',emoji:'📌'},
  {name:'Twitch',url:'https://twitch.tv',cat:'social',emoji:'🎮'},
  {name:'Threads',url:'https://threads.net',cat:'social',emoji:'🧵'},
  {name:'WhatsApp Web',url:'https://web.whatsapp.com',cat:'social',emoji:'💬'},
  {name:'BeReal',url:'https://bere.al',cat:'social',emoji:'📷'},
  // Work
  {name:'Gmail',url:'https://mail.google.com',cat:'work',emoji:'📧'},
  {name:'Outlook',url:'https://outlook.live.com',cat:'work',emoji:'📮'},
  {name:'Slack',url:'https://slack.com',cat:'work',emoji:'💬'},
  {name:'Zoom',url:'https://zoom.us',cat:'work',emoji:'📹'},
  {name:'MS Teams',url:'https://teams.microsoft.com',cat:'work',emoji:'👥'},
  {name:'Notion',url:'https://notion.so',cat:'work',emoji:'📝'},
  {name:'GitHub',url:'https://github.com',cat:'work',emoji:'🐱'},
  {name:'GitLab',url:'https://gitlab.com',cat:'work',emoji:'🦊'},
  {name:'Jira',url:'https://atlassian.net',cat:'work',emoji:'📋'},
  {name:'Trello',url:'https://trello.com',cat:'work',emoji:'📊'},
  {name:'Asana',url:'https://asana.com',cat:'work',emoji:'✅'},
  {name:'Figma',url:'https://figma.com',cat:'work',emoji:'🎨'},
  {name:'Salesforce',url:'https://salesforce.com',cat:'work',emoji:'☁️'},
  {name:'Canva',url:'https://canva.com',cat:'work',emoji:'🖌️'},
  {name:'Dropbox',url:'https://dropbox.com',cat:'work',emoji:'📦'},
  {name:'Monday.com',url:'https://monday.com',cat:'work',emoji:'📅'},
  {name:'Vercel',url:'https://vercel.com',cat:'work',emoji:'▲'},
  // Finance
  {name:'PayPal',url:'https://paypal.com',cat:'finance',emoji:'💸'},
  {name:'Stripe',url:'https://dashboard.stripe.com',cat:'finance',emoji:'💳'},
  {name:'Paytm',url:'https://paytm.com',cat:'finance',emoji:'💰'},
  {name:'Google Pay',url:'https://pay.google.com',cat:'finance',emoji:'📱'},
  {name:'PhonePe',url:'https://phonepe.com',cat:'finance',emoji:'📲'},
  {name:'Razorpay',url:'https://razorpay.com',cat:'finance',emoji:'⚡'},
  {name:'Binance',url:'https://binance.com',cat:'finance',emoji:'₿'},
  {name:'Coinbase',url:'https://coinbase.com',cat:'finance',emoji:'🪙'},
  {name:'Zerodha',url:'https://zerodha.com',cat:'finance',emoji:'📈'},
  {name:'Groww',url:'https://groww.in',cat:'finance',emoji:'📊'},
  {name:'HDFC Bank',url:'https://hdfcbank.com',cat:'finance',emoji:'🏦'},
  {name:'SBI Net Banking',url:'https://sbi.co.in',cat:'finance',emoji:'🏛️'},
  {name:'ICICI Bank',url:'https://icicibank.com',cat:'finance',emoji:'🏦'},
  {name:'Amazon Pay',url:'https://pay.amazon.in',cat:'finance',emoji:'🛒'},
  {name:'WazirX',url:'https://wazirx.com',cat:'finance',emoji:'💎'},
  // Personal
  {name:'Amazon',url:'https://amazon.com',cat:'personal',emoji:'📦'},
  {name:'Flipkart',url:'https://flipkart.com',cat:'personal',emoji:'🛍️'},
  {name:'Netflix',url:'https://netflix.com',cat:'personal',emoji:'🎬'},
  {name:'Spotify',url:'https://spotify.com',cat:'personal',emoji:'🎵'},
  {name:'Apple ID',url:'https://appleid.apple.com',cat:'personal',emoji:'🍎'},
  {name:'iCloud',url:'https://icloud.com',cat:'personal',emoji:'☁️'},
  {name:'Adobe',url:'https://adobe.com',cat:'personal',emoji:'🎨'},
  {name:'OneDrive',url:'https://onedrive.live.com',cat:'personal',emoji:'💾'},
  {name:'Yahoo Mail',url:'https://mail.yahoo.com',cat:'personal',emoji:'💌'},
  {name:'Hotmail',url:'https://outlook.live.com',cat:'personal',emoji:'📬'},
  {name:'Myntra',url:'https://myntra.com',cat:'personal',emoji:'👗'},
  {name:'Swiggy',url:'https://swiggy.com',cat:'personal',emoji:'🍔'},
  {name:'Zomato',url:'https://zomato.com',cat:'personal',emoji:'🍕'},
  {name:'Disney+',url:'https://hotstar.com',cat:'personal',emoji:'✨'},
  {name:'Prime Video',url:'https://primevideo.com',cat:'personal',emoji:'🎥'},
  {name:'Duolingo',url:'https://duolingo.com',cat:'personal',emoji:'🦜'},
  // Gaming
  {name:'Steam',url:'https://store.steampowered.com',cat:'gaming',emoji:'🎮'},
  {name:'Epic Games',url:'https://epicgames.com',cat:'gaming',emoji:'🎯'},
  {name:'PlayStation',url:'https://playstation.com',cat:'gaming',emoji:'🕹️'},
  {name:'Xbox Live',url:'https://xbox.com',cat:'gaming',emoji:'🟢'},
  {name:'Nintendo',url:'https://nintendo.com',cat:'gaming',emoji:'🔴'},
  {name:'Battle.net',url:'https://battle.net',cat:'gaming',emoji:'⚔️'},
  {name:'EA Play',url:'https://ea.com',cat:'gaming',emoji:'🏆'},
  {name:'Ubisoft',url:'https://ubisoft.com',cat:'gaming',emoji:'🐇'},
  {name:'Roblox',url:'https://roblox.com',cat:'gaming',emoji:'🧱'},
  {name:'Minecraft',url:'https://minecraft.net',cat:'gaming',emoji:'⛏️'},
  // Other
  {name:'Stack Overflow',url:'https://stackoverflow.com',cat:'other',emoji:'💻'},
  {name:'WordPress',url:'https://wordpress.com',cat:'other',emoji:'🌐'},
  {name:'Shopify',url:'https://shopify.com',cat:'other',emoji:'🛒'},
  {name:'Cloudflare',url:'https://cloudflare.com',cat:'other',emoji:'🔥'},
  {name:'AWS',url:'https://aws.amazon.com',cat:'other',emoji:'☁️'},
  {name:'Google Cloud',url:'https://cloud.google.com',cat:'other',emoji:'🌤️'},
  {name:'Namecheap',url:'https://namecheap.com',cat:'other',emoji:'🌐'},
  {name:'ChatGPT',url:'https://chat.openai.com',cat:'other',emoji:'🤖'},
];

// ── Security Tips ─────────────────────────────────
const TIPS=[
  {title:'Use Passphrases',text:'Four random words like "Brave-Ocean-Tiger-4812" are easier to remember and much harder to crack than short complex passwords.'},
  {title:'Enable 2FA Everywhere',text:'Two-factor authentication makes it 99.9% harder for attackers to access your accounts even if they steal your password.'},
  {title:'Never Reuse Passwords',text:'If one site is breached, attackers try your credentials everywhere. Unique passwords for every site is essential.'},
  {title:'Check Breach Status',text:'Use the breach check button (⚠) when adding passwords. It checks against 12 billion leaked passwords anonymously.'},
  {title:'Refresh Old Passwords',text:'Passwords older than 6 months on critical accounts (email, banking) should be refreshed regularly.'},
  {title:'Beware of Phishing',text:'Always verify URLs before entering credentials. Attackers clone popular sites with slightly misspelled domains.'},
  {title:'Use Long Passwords',text:'Length beats complexity. A 20-character lowercase password is stronger than a 10-character one with symbols.'},
  {title:'Protect Your Master',text:'Your Cipher master password guards everything. Make it unique, strong, and never write it on paper.'},
  {title:'Auto-Lock Your Vault',text:'Enable auto-lock in Settings so your vault locks automatically after inactivity, preventing unauthorized access.'},
  {title:'Export Regularly',text:'Download an encrypted backup of your vault periodically so you never lose access to your passwords.'},
];
let tipIdx = Math.floor(Math.random() * TIPS.length);

// ── Wordlist for passphrases ─────────────────────
const WORDS=['apple','brave','cloud','dance','eagle','flame','grace','happy','ivory','jolly','karma','light','magic','noble','ocean','peace','quiet','river','storm','tiger','ultra','vivid','water','xenon','yacht','zesty','amber','bliss','crisp','dream','elite','fresh','glade','honey','iceberg','joyful','kite','lemon','mango','night','orbit','prime','quest','royal','silver','torch','unity','velvet','windy','extra','young','zipper','falcon','grove','harbor','island','jungle','kettle','lantern','marble','nectar','opaque','pepper','quartz','riddle','shadow','tunnel','umbra','violet','walrus','xerox','yellow','zenith'];

// ── Avatar Colors ────────────────────────────────
const AV_COLORS=['#7c3aed','#3b82f6','#8b5cf6','#ec4899','#f59e0b','#10b981','#14b8a6','#ef4444','#f97316','#06b6d4','#84cc16','#a855f7','#0ea5e9','#d946ef'];

// ── Utils ─────────────────────────────────────────
const uid=()=>crypto.randomUUID?.()??Math.random().toString(36).slice(2);
const b2b=b=>btoa(String.fromCharCode(...new Uint8Array(b)));
const b2u=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const s2b=s=>new TextEncoder().encode(s);
const b2s=b=>new TextDecoder().decode(b);
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const $=id=>document.getElementById(id);

function avColor(n){let h=0;for(const c of n)h=c.charCodeAt(0)+((h<<5)-h);return AV_COLORS[Math.abs(h)%AV_COLORS.length]}
function initials(n){return n.trim().split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase()||'?'}
function timeAgo(ts){
  const d=(Date.now()-ts)/1000;
  if(d<60)return'just now';if(d<3600)return Math.floor(d/60)+'m ago';
  if(d<86400)return Math.floor(d/3600)+'h ago';if(d<2592000)return Math.floor(d/86400)+'d ago';
  if(d<31536000)return Math.floor(d/2592000)+'mo ago';return Math.floor(d/31536000)+'y ago';
}
function domainOf(url){try{return new URL(url).hostname.replace('www.','');}catch{return url}}

// ── Crypto ────────────────────────────────────────
async function deriveKey(pw,salt){
  const m=await crypto.subtle.importKey('raw',s2b(pw),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:ITERS,hash:'SHA-256'},m,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
async function enc(key,data){const iv=crypto.getRandomValues(new Uint8Array(12));const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,s2b(JSON.stringify(data)));return{iv:b2b(iv),ct:b2b(ct)}}
async function dec(key,iv,ct){const buf=await crypto.subtle.decrypt({name:'AES-GCM',iv:b2u(iv)},key,b2u(ct));return JSON.parse(b2s(buf))}
async function saveVault(){const r=await enc(masterKey,vault);localStorage.setItem(VAULT_KEY,JSON.stringify(r))}
async function loadVaultData(key){const raw=localStorage.getItem(VAULT_KEY);if(!raw)return[];const{iv,ct}=JSON.parse(raw);return dec(key,iv,ct)}

// ── Auth ──────────────────────────────────────────
function switchTab(t){
  $('login-form').classList.toggle('hidden',t!=='login');
  $('register-form').classList.toggle('hidden',t!=='register');
  $('tab-login').classList.toggle('active',t==='login');
  $('tab-register').classList.toggle('active',t==='register');
  $('tab-ink').classList.toggle('right',t==='register');
  clearErrs();
}
function clearErrs(){['login-err','register-err'].forEach(id=>{$(id).classList.add('hidden');$(id).querySelector('span').textContent=''})}
function showErr(id,msg){const el=$(id);el.classList.remove('hidden');el.querySelector('span').textContent=msg}

async function handleRegister(e){
  e.preventDefault();
  const pw=$('reg-pw').value,conf=$('reg-confirm').value;
  if(pw.length<8)return showErr('register-err','Master password must be at least 8 characters.');
  if(pw!==conf)return showErr('register-err','Passwords do not match.');
  if(localStorage.getItem(META_KEY))return showErr('register-err','Vault already exists. Please sign in.');
  setBtnLoad('register-btn',true);
  const salt=crypto.getRandomValues(new Uint8Array(16));
  masterKey=await deriveKey(pw,salt);
  const tok=await enc(masterKey,{v:'cipher_v4',ts:Date.now()});
  localStorage.setItem(META_KEY,JSON.stringify({salt:b2b(salt),...tok}));
  vault=[];await saveVault();
  enterApp();
}
async function handleLogin(e){
  e.preventDefault();
  const pw=$('login-password').value,raw=localStorage.getItem(META_KEY);
  if(!raw)return showErr('login-err','No vault found. Create one first.');
  setBtnLoad('login-btn',true);
  try{
    const{salt,iv,ct}=JSON.parse(raw);
    const key=await deriveKey(pw,b2u(salt));
    const data=await dec(key,iv,ct);
    if(!data.v?.startsWith('cipher'))throw new Error();
    masterKey=key;vault=await loadVaultData(key);
    enterApp();
  }catch{
    setBtnLoad('login-btn',false);
    showErr('login-err','Incorrect master password. Try again.');
    $('login-password').value='';$('login-password').focus();
  }
}
function setBtnLoad(id,on){
  const b=$(id);b.disabled=on;
  b.querySelector('span').style.display=on?'none':'';
  b.querySelector('.btn-spinner').classList.toggle('hidden',!on);
  b.querySelector('svg').style.display=on?'none':'';
}
function enterApp(){
  $('auth-screen').classList.add('hidden');$('app').classList.remove('hidden');
  const savedTheme=localStorage.getItem(THEME_KEY)||'light';
  applyTheme(savedTheme);
  const savedAL=+localStorage.getItem(AL_KEY)||0;
  setAutoLock(savedAL,true);
  setGreeting();setTip();renderAll();goTo('dashboard');genPassword();
  renderTemplateGrid();
}
function lockVault(){
  clearTimers();vault=[];masterKey=null;
  $('app').classList.add('hidden');$('auth-screen').classList.remove('hidden');
  $('login-password').value='';clearErrs();
  switchTab(localStorage.getItem(META_KEY)?'login':'register');
}

// ── Theme ─────────────────────────────────────────
function applyTheme(t){
  document.documentElement.setAttribute('data-theme',t);
  localStorage.setItem(THEME_KEY,t);
  const dark=t==='dark';
  $('ico-moon').classList.toggle('hidden',dark);
  $('ico-sun').classList.toggle('hidden',!dark);
  $('theme-lbl').textContent=dark?'Light':'Dark';
  const dt=$('dark-toggle');if(dt)dt.checked=dark;
}
function toggleDark(){applyTheme(document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark')}

// ── Auto-Lock ─────────────────────────────────────
function clearTimers(){clearInterval(autoLockTimer);clearTimeout(inactivityTimer);autoLockTimer=null;inactivityTimer=null}
function setAutoLock(mins,silent=false){
  clearTimers();
  autoLockMins=mins;
  localStorage.setItem(AL_KEY,mins);
  const badge=$('al-badge');
  if(!mins){badge.classList.add('hidden');return}
  if(!silent)toast('Auto-lock set to '+mins+' min','in');
  badge.classList.remove('hidden');
  startAutoLock();
  // sync radio
  document.querySelectorAll('input[name="al"]').forEach(r=>{r.checked=(+r.value===mins)});
}
function startAutoLock(){
  clearTimers();
  if(!autoLockMins)return;
  let remaining=autoLockMins*60;
  const badge=$('al-timer');
  autoLockTimer=setInterval(()=>{
    remaining--;
    const m=Math.floor(remaining/60),s=remaining%60;
    if(badge)badge.textContent=(m>0?m+'m ':'')+s+'s';
    if(remaining<=0){clearTimers();lockVault();toast('Vault auto-locked.','wa')}
  },1000);
  // Reset on activity
  ['mousemove','keydown','click','touchstart'].forEach(ev=>{
    document.addEventListener(ev,resetInactivity,{passive:true});
  });
}
function resetInactivity(){
  clearTimers();startAutoLock();
}
function openSettings(){$('settings-wrap').classList.remove('hidden')}
function closeSettings(){$('settings-wrap').classList.add('hidden')}
function nukeVault(){
  if(!confirm('⚠️ This will permanently delete ALL vault data. This cannot be undone. Type "DELETE" to confirm.\n\nAre you absolutely sure?'))return;
  const r=prompt('Type DELETE to confirm:');
  if(r!=='DELETE')return;
  localStorage.removeItem(VAULT_KEY);localStorage.removeItem(META_KEY);
  localStorage.removeItem(AL_KEY);
  closeSettings();lockVault();
  toast('All vault data deleted.','er');
}

// ── Greeting ──────────────────────────────────────
function setGreeting(){
  const h=new Date().getHours();
  const g=h<5?'🌙 Good night':h<12?'☀️ Good morning':h<17?'👋 Good afternoon':h<21?'🌅 Good evening':'🌙 Good night';
  $('tb-sub').textContent=g;
}

// ── Navigation ────────────────────────────────────
const TITLES={dashboard:'Dashboard',vault:'My Vault',favorites:'Favorites',generator:'Generator',audit:'Security Audit'};
function goTo(view){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  $(`view-${view}`).classList.add('active');
  document.querySelectorAll('.sb-btn[data-view],.bnav-i[data-view]').forEach(el=>el.classList.toggle('active',el.dataset.view===view));
  $('tb-title').textContent=TITLES[view]||view;
  $('sb-overlay').classList.add('hidden');$('sb').classList.remove('open');
  $('clip-dropdown').classList.add('hidden');
  if(view==='vault')renderVault();
  if(view==='favorites')renderFavorites();
  if(view==='audit')runAudit();
}
function toggleSb(){const o=$('sb').classList.toggle('open');$('sb-overlay').classList.toggle('hidden',!o)}
function quickSearch(q){
  if(!q){goTo('vault');return}
  goTo('vault');$('vault-search').value=q;renderVault();
}

// ── Strength ──────────────────────────────────────
function calcStr(pw){
  if(!pw)return{pct:0,label:'',cls:'',segs:0,sc:''};
  let s=0;
  if(pw.length>=8)s++;if(pw.length>=12)s++;if(pw.length>=16)s++;if(pw.length>=20)s++;
  if(/[A-Z]/.test(pw))s++;if(/[a-z]/.test(pw))s++;if(/[0-9]/.test(pw))s++;if(/[^A-Za-z0-9]/.test(pw))s++;
  if(s<=2)return{pct:20,label:'Very Weak',cls:'str-vw',segs:1,sc:'w'};
  if(s<=3)return{pct:40,label:'Weak',cls:'str-w',segs:1,sc:'w'};
  if(s<=4)return{pct:60,label:'Fair',cls:'str-f',segs:2,sc:'f'};
  if(s<=6)return{pct:80,label:'Good',cls:'str-g',segs:3,sc:'g'};
  return{pct:100,label:'Very Strong',cls:'str-s',segs:4,sc:'s'};
}
function calcEntropy(pw){
  let cs=0;if(/[a-z]/.test(pw))cs+=26;if(/[A-Z]/.test(pw))cs+=26;if(/[0-9]/.test(pw))cs+=10;if(/[^A-Za-z0-9]/.test(pw))cs+=32;
  return cs?(pw.length*Math.log2(cs)).toFixed(1)+' bits':'0 bits';
}
function setStrPills(pref,pw){
  const{segs,sc,label,cls}=calcStr(pw);
  for(let i=0;i<4;i++){const el=$(pref+i);if(el)el.className='ss'+(i<segs?' '+sc:'')}
  const lbl=$(pref==='ss'?'str-lbl':'e-str-lbl');
  if(lbl){lbl.textContent=label;lbl.className='str-lbl '+cls}
}
function updateRegStr(pw){setStrPills('ss',pw)}
function onPwInput(pw){setStrPills('es',pw)}

// ── Breach Check (HIBP k-anonymity) ──────────────
async function checkBreach(){
  const pw=$('e-pw').value;
  if(!pw){toast('Enter a password to check.','wa');return}
  const btn=$('breach-btn');
  btn.style.animation='spin .7s linear infinite';
  const res=$('breach-result');
  try{
    const enc=await crypto.subtle.digest('SHA-1',s2b(pw));
    const hex=Array.from(new Uint8Array(enc)).map(b=>b.toString(16).padStart(2,'0')).join('').toUpperCase();
    const prefix=hex.slice(0,5),suffix=hex.slice(5);
    const resp=await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if(!resp.ok)throw new Error();
    const txt=await resp.text();
    const match=txt.split('\n').find(l=>l.startsWith(suffix));
    btn.style.animation='';
    if(match){
      const count=parseInt(match.split(':')[1]);
      res.className='breach-result';res.style.background='var(--ro-l)';res.style.color='var(--ro)';
      res.textContent=`⚠ Breached ${count.toLocaleString()}×`;
      toast(`⚠ This password appeared in ${count.toLocaleString()} data breaches!`,'er');
    }else{
      res.className='breach-result';res.style.background='var(--em-l)';res.style.color='#065f46';
      res.textContent='✓ Not breached';
      toast('✓ Password not found in known breaches.','ok');
    }
  }catch{
    btn.style.animation='';
    res.className='breach-result hidden';
    toast('Could not reach breach database. Check your connection.','wa');
  }
}

// ── Visual Category Picker ────────────────────────
function pickCat(cat){
  $('e-cat').value=cat;
  document.querySelectorAll('.cp-btn').forEach(b=>b.classList.toggle('active',b.dataset.cat===cat));
}

// ── Generator ─────────────────────────────────────
function setGenMode(mode,el){
  genMode=mode;
  document.querySelectorAll('.gmt').forEach(b=>b.classList.remove('active'));el.classList.add('active');
  ['gc-random','gc-passphrase','gc-pin'].forEach(id=>$(id).classList.add('hidden'));
  const map={random:'gc-random',passphrase:'gc-passphrase',pin:'gc-pin'};
  $(map[mode]).classList.remove('hidden');
  dispatchGen();
}
function dispatchGen(){if(genMode==='random')genPassword();else if(genMode==='passphrase')genPassphrase();else genPin()}
function genPassword(){
  const len=+$('gc-len').value;
  const excl=$('gc-ambi').checked?'0O1lI':'';
  let chars='';
  if($('gc-upper').checked)chars+=('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(c=>!excl.includes(c)).join(''));
  if($('gc-lower').checked)chars+=('abcdefghijklmnopqrstuvwxyz'.split('').filter(c=>!excl.includes(c)).join(''));
  if($('gc-nums').checked)chars+=('0123456789'.split('').filter(c=>!excl.includes(c)).join(''));
  if($('gc-syms').checked)chars+='!@#$%^&*()-_=+[]{}|;:,.<>?';
  if(!chars)chars='abcdefghijklmnopqrstuvwxyz';
  const arr=crypto.getRandomValues(new Uint8Array(len*3));let pw='';
  const max=Math.floor(256/chars.length)*chars.length;
  for(let i=0;i<arr.length&&pw.length<len;i++)if(arr[i]<max)pw+=chars[arr[i]%chars.length];
  while(pw.length<len){const b=crypto.getRandomValues(new Uint8Array(1))[0];if(b<max)pw+=chars[b%chars.length]}
  setGenResult(pw);
}
function genPassphrase(){
  const wc=+$('gc-wc').value,sep=$('gc-sep').value,cap2=$('gc-cap').checked,num=$('gc-numsfx').checked;
  const arr=crypto.getRandomValues(new Uint32Array(wc));
  const picked=Array.from(arr).map(v=>WORDS[v%WORDS.length]);
  let pw=picked.map(w=>cap2?w[0].toUpperCase()+w.slice(1):w).join(sep);
  if(num)pw+=sep+(crypto.getRandomValues(new Uint16Array(1))[0]%9000+1000);
  setGenResult(pw);
}
function genPin(){
  const len=+$('gc-pin-len').value;
  const arr=crypto.getRandomValues(new Uint8Array(len*2));
  let pin='';for(let i=0;i<arr.length&&pin.length<len;i++)if(arr[i]<250)pin+=(arr[i]%10);
  setGenResult(pin);
}
function setGenResult(pw){
  genPw=pw;$('gen-txt').textContent=pw;
  const{pct,label}=calcStr(pw);
  $('gen-sfill').style.width=pct+'%';$('gen-str-lbl').textContent=label;
  $('gen-entropy').textContent='Entropy: '+calcEntropy(pw);
  try{const r=$('gc-len');r.style.setProperty('--v',((r.value-r.min)/(r.max-r.min)*100).toFixed(1)+'%')}catch{}
}
function updateGenLen(){$('gc-len-val').textContent=$('gc-len').value;const r=$('gc-len');r.style.setProperty('--v',((r.value-r.min)/(r.max-r.min)*100).toFixed(1)+'%')}
function updateGenWc(){$('gc-wc-val').textContent=$('gc-wc').value}
function updateGenPin(){$('gc-pin-val').textContent=$('gc-pin-len').value}
async function copyGen(){
  if(!genPw||genPw==='Click Generate')return;
  await navigator.clipboard.writeText(genPw).catch(()=>{});
  addToClipHistory(genPw,'Generated','password');
  const btn=$('gen-copy');
  btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
  addGenHistoryItem(genPw);toast('Copied!','ok');
  setTimeout(()=>{btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'},2200);
}
function useGen(){openModal();setTimeout(()=>{$('e-pw').value=genPw;onPwInput(genPw)},80)}
function fillGen(){dispatchGen();$('e-pw').value=genPw;onPwInput(genPw);toast('Strong password generated!','in')}
function addGenHistoryItem(pw){genHistory.unshift({pw,ts:Date.now()});if(genHistory.length>10)genHistory.pop()}
function toggleGenHist(){$('gen-hist-panel').classList.toggle('hidden');renderGenHist()}
function renderGenHist(){
  $('ghp-list').innerHTML=genHistory.length
    ?genHistory.map(g=>`<div class="ghp-item"><span class="ghp-pw">${esc(g.pw)}</span><button class="ghp-copy" onclick="clipText('${g.pw.replace(/\\/g,'\\\\').replace(/'/g,"\\'")}','Password')">Copy</button></div>`).join('')
    :'<div style="padding:12px 14px;font-size:.8rem;color:var(--tx4)">No history yet.</div>';
}
function clearGenHist(){genHistory=[];renderGenHist()}

// ── Clipboard History ─────────────────────────────
function addToClipHistory(text,site,label){
  clipHistory.unshift({text,site,label,ts:Date.now()});
  if(clipHistory.length>10)clipHistory.pop();
  $('clip-dot').classList.remove('hidden');
}
function toggleClipHistory(){
  const d=$('clip-dropdown');d.classList.toggle('hidden');
  if(!d.classList.contains('hidden')){$('clip-dot').classList.add('hidden');renderClipHistory()}
}
function renderClipHistory(){
  const el=$('clip-list');
  if(!clipHistory.length){el.innerHTML='<div class="clip-empty">Nothing copied yet</div>';return}
  el.innerHTML=clipHistory.map((c,i)=>`
    <div class="clip-item" onclick="reclip(${i})">
      <div style="flex:1;min-width:0">
        <div class="clip-site">${esc(c.site)}</div>
        <div class="clip-what">${esc(c.label)}</div>
      </div>
      <span class="clip-ts">${timeAgo(c.ts)}</span>
    </div>`).join('');
}
async function reclip(i){
  const item=clipHistory[i];if(!item)return;
  await navigator.clipboard.writeText(item.text).catch(()=>{});
  toast(`${item.label} re-copied!`,'ok');
  $('clip-dropdown').classList.add('hidden');
}
function clearClipHistory(){clipHistory=[];renderClipHistory();$('clip-dot').classList.add('hidden')}

// ── Site Templates ────────────────────────────────
function openTemplates(){$('templates-wrap').classList.remove('hidden');filterTemplates('')}
function closeTemplates(){$('templates-wrap').classList.add('hidden')}
function filterTplCat(cat,el){
  tplFilter=cat;
  document.querySelectorAll('.tpl-cat-btn').forEach(b=>b.classList.toggle('active',b.dataset.tcat===cat));
  filterTemplates($('tpl-search').value);
}
function filterTemplates(q){
  let list=TEMPLATES;
  if(tplFilter!=='all')list=list.filter(t=>t.cat===tplFilter);
  if(q)list=list.filter(t=>t.name.toLowerCase().includes(q.toLowerCase())||t.cat.includes(q.toLowerCase()));
  renderTemplateGrid(list);
}
function renderTemplateGrid(list=TEMPLATES){
  const el=$('tpl-grid');if(!el)return;
  if(!list.length){el.innerHTML='<div class="tpl-no-results">🔍 No sites found</div>';return}
  el.innerHTML=list.map(t=>`
    <div class="tpl-item" onclick="quickAddSite('${esc(t.name)}','${esc(t.url)}','${t.cat}')">
      <div class="tpl-emoji">${t.emoji}</div>
      <div class="tpl-name">${esc(t.name)}</div>
      <div class="tpl-cat-label">${cap(t.cat)}</div>
    </div>`).join('');
}
function quickAddSite(name,url,cat){
  closeTemplates();
  openModal();
  setTimeout(()=>{
    $('e-site').value=name;$('e-url').value=url;
    onSiteInput(name);pickCat(cat);
    $('e-user').focus();
  },100);
}

// ── Modal ─────────────────────────────────────────
function openModal(id=null){
  editingId=id;$('entry-form').reset();setStrPills('es','');updateModalAv('');
  pickCat('personal');
  $('breach-result').className='breach-result hidden';
  if(id){
    const e=vault.find(x=>x.id===id);if(!e)return;
    $('modal-ttl').textContent='Edit Password';$('modal-sub').textContent=e.site;
    $('e-site').value=e.site;$('e-url').value=e.url||'';$('e-user').value=e.username;
    $('e-pw').value=e.password;$('e-tags').value=(e.tags||[]).join(', ');
    $('e-fav').checked=!!e.fav;$('e-notes').value=e.notes||'';
    pickCat(e.category||'personal');
    onPwInput(e.password);updateModalAv(e.site);
  }else{
    $('modal-ttl').textContent='Add Password';$('modal-sub').textContent='Save a new credential';
  }
  $('modal-wrap').classList.remove('hidden');
  setTimeout(()=>$('e-site').focus(),80);
}
function onSiteInput(v){updateModalAv(v);$('modal-sub').textContent=v||'Save a new credential'}
function updateModalAv(name){
  const el=$('modal-av'),t=$('modal-av-txt');
  if(name.trim()){el.style.background=`linear-gradient(135deg,${avColor(name)},${avColor(name+'x')})`;t.textContent=initials(name)}
  else{el.style.background='linear-gradient(135deg,var(--pu),var(--pu-d))';t.textContent='?'}
}
function closeModal(){$('modal-wrap').classList.add('hidden');editingId=null}
function handleModalBg(e){if(e.target===$('modal-wrap'))closeModal()}

async function saveEntry(e){
  e.preventDefault();
  const cat=$('e-cat').value||'personal';
  const entry={
    id:editingId||uid(),
    site:$('e-site').value.trim(),
    url:$('e-url').value.trim(),
    username:$('e-user').value.trim(),
    password:$('e-pw').value,
    category:cat,
    tags:$('e-tags').value.split(',').map(t=>t.trim()).filter(Boolean),
    fav:$('e-fav').checked,
    notes:$('e-notes').value.trim(),
    breached:false,
    created:editingId?(vault.find(x=>x.id===editingId)?.created||Date.now()):Date.now(),
    updated:Date.now(),
  };
  if(editingId){const i=vault.findIndex(x=>x.id===editingId);vault[i]=entry}
  else vault.unshift(entry);
  await saveVault();closeModal();renderAll();renderVault();renderFavorites();
  toast(editingId?'Password updated ✓':'Password saved 🔐','ok');
}
async function deleteEntry(id){
  if(!confirm('Delete this password? This cannot be undone.'))return;
  vault=vault.filter(x=>x.id!==id);
  await saveVault();renderAll();renderVault();renderFavorites();toast('Deleted.','in');
}
async function toggleFav(id){
  const e=vault.find(x=>x.id===id);if(!e)return;
  e.fav=!e.fav;await saveVault();renderAll();renderVault();renderFavorites();
  toast(e.fav?'Added to favorites ⭐':'Removed from favorites','in');
}

// ── Vault Filter ─────────────────────────────────
function setFilter(cat,el){
  activeFilter=cat;
  document.querySelectorAll('.vf').forEach(p=>p.classList.remove('active'));
  el.classList.add('active');renderVault();
}
function clearVSearch(){$('vault-search').value='';$('v-clear').classList.add('hidden');renderVault()}

function renderVault(){
  const q=($('vault-search')?.value||'').toLowerCase().trim();
  $('v-clear')?.classList.toggle('hidden',!q);
  let list=vault;
  if(activeFilter!=='all')list=list.filter(e=>e.category===activeFilter);
  if(q)list=list.filter(e=>e.site.toLowerCase().includes(q)||e.username.toLowerCase().includes(q)||(e.url||'').toLowerCase().includes(q)||(e.tags||[]).some(t=>t.toLowerCase().includes(q)));
  renderPwList('vault-list',list,true);
}
function renderFavorites(){renderPwList('fav-list',vault.filter(e=>e.fav),false)}

function renderPwList(cid,list,showEmpty){
  const el=$(cid);if(!el)return;
  if(!list.length){
    el.innerHTML=`<div class="vault-empty"><div class="vault-empty-emoji">${showEmpty?'🗝️':'⭐'}</div><h4>${showEmpty?'No passwords found':'No favorites yet'}</h4><p>${showEmpty?'Add your first password to get started.':'Star any password to see it here.'}</p>${showEmpty?'<button class="btn-primary" onclick="openModal()">Add Password</button>':''}</div>`;
    return;
  }
  el.innerHTML=list.map((e,i)=>pwCard(e,i)).join('');
}

function pwCard(e,idx){
  const color=avColor(e.site),init=initials(e.site);
  const{label,cls}=calcStr(e.password);
  const catEmoj={social:'📱',work:'💼',finance:'💳',personal:'👤',gaming:'🎮',other:'📦'}[e.category]||'📦';
  const tags=(e.tags||[]).slice(0,2).map(t=>`<span class="pw-tag">${esc(t)}</span>`).join('');
  const domain=e.url?domainOf(e.url):'';
  const urlBtn=e.url?`<a class="pw-url-link" href="${esc(e.url)}" target="_blank" rel="noopener" title="Open ${domain}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>${domain}</a>`:'';
  return`
  <div class="pw-card${e.fav?' is-fav':''}${e.breached?' is-breached':''}" style="animation-delay:${idx*30}ms">
    <div class="pw-av-wrap">
      <div class="pw-av" style="background:${color}">${init}</div>
      <div class="pw-fav-star${e.fav?' show':''}">⭐</div>
      <div class="pw-breach-badge${e.breached?' show':''}">⚠</div>
    </div>
    <div class="pw-body">
      <div class="pw-site-row"><span class="pw-site">${esc(e.site)}</span>${tags}</div>
      <div class="pw-user">${esc(e.username)}</div>
      <div class="pw-meta-row">
        <span class="pw-pass" id="ppw-${e.id}">••••••••</span>
        <button onclick="togglePwVis('${e.id}')" class="pw-eye-mini"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
        <span class="pw-age">${timeAgo(e.updated||e.created)}</span>
        ${urlBtn}
      </div>
    </div>
    <div class="pw-badges">
      <span class="cat-chip cat-${e.category}">${catEmoj} ${cap(e.category)}</span>
      <span class="str-chip ${cls}">${label}</span>
    </div>
    <div class="pw-acts">
      <button class="pw-act star" onclick="toggleFav('${e.id}')" title="${e.fav?'Unstar':'Star'}"><svg viewBox="0 0 24 24" fill="${e.fav?'var(--am)':'none'}" stroke="${e.fav?'var(--am)':'currentColor'}" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></button>
      <button class="pw-act copy" onclick="clipAndSave('${esc(e.username)}','${esc(e.site)}','Username')" title="Copy username"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg></button>
      <button class="pw-act copy" onclick="clipAndSave('${e.password.replace(/\\/g,'\\\\').replace(/'/g,"\\'")}','${esc(e.site)}','Password')" title="Copy password"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></button>
      ${e.url?`<button class="pw-act open" onclick="window.open('${esc(e.url)}','_blank','noopener')" title="Open site"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></button>`:''}
      <button class="pw-act edit" onclick="openModal('${e.id}')" title="Edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
      <button class="pw-act del" onclick="deleteEntry('${e.id}')" title="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6m5 0V4h4v2"/></svg></button>
    </div>
  </div>`;
}

function togglePwVis(id){const el=$(`ppw-${id}`),e=vault.find(x=>x.id===id);if(!e||!el)return;el.textContent=el.textContent.startsWith('•')?e.password:'••••••••'}

// ── Clipboard ─────────────────────────────────────
async function clipText(text,label){
  try{await navigator.clipboard.writeText(text);toast(`${label} copied!`,'ok')}
  catch{toast('Copy failed.','er')}
}
async function clipAndSave(text,site,label){
  try{await navigator.clipboard.writeText(text);addToClipHistory(text,site,label);toast(`${label} copied!`,'ok')}
  catch{toast('Copy failed.','er')}
}

// ── Export ────────────────────────────────────────
function exportVault(){
  if(!vault.length){toast('Vault is empty.','in');return}
  const data={app:'Cipher',exported:new Date().toISOString(),count:vault.length,entries:vault};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download=`cipher-vault-${new Date().toISOString().slice(0,10)}.json`;
  a.click();URL.revokeObjectURL(a.href);toast('Vault exported!','ok');
}

// ── Dashboard ─────────────────────────────────────
function renderAll(){
  const total=vault.length;
  const pwMap={};vault.forEach(e=>{(pwMap[e.password]=pwMap[e.password]||[]).push(e)});
  const reusedIds=new Set(Object.values(pwMap).filter(g=>g.length>1).flat().map(e=>e.id));
  const weakIds=new Set(vault.filter(e=>calcStr(e.password).pct<60).map(e=>e.id));
  const issueIds=new Set([...reusedIds,...weakIds]);
  const strong=vault.filter(e=>calcStr(e.password).pct>=80).length;
  const fair=vault.filter(e=>{const p=calcStr(e.password).pct;return p>=60&&p<80}).length;
  const weak=weakIds.size;
  const favCount=vault.filter(e=>e.fav).length;
  const score=total?Math.max(0,Math.round((1-issueIds.size/total)*100)):100;

  // Health arc
  const arc=$('health-arc');if(arc){const c=2*Math.PI*42;arc.style.strokeDashoffset=c*(1-score/100)}
  $('health-pct').textContent=score+'%';
  $('health-title').textContent=score>=80?'Vault is Healthy 🛡️':score>=50?'Needs Attention ⚠️':'At Risk! 🚨';
  $('health-desc').textContent=issueIds.size===0?'All passwords look strong and unique.':issueIds.size+' password'+(issueIds.size!==1?'s':'')+' need your attention.';
  if(total){
    $('health-str-dist').innerHTML=
      (strong?`<span class="hsd-pill">✅ ${strong} strong</span>`:'') +
      (fair?`<span class="hsd-pill">⚡ ${fair} fair</span>`:'') +
      (weak?`<span class="hsd-pill">⚠️ ${weak} weak</span>`:'');
  }else{$('health-str-dist').innerHTML=''}

  $('h-total').textContent=total;$('h-fav').textContent=favCount;
  $('h-weak').textContent=weak;$('h-reused').textContent=reusedIds.size;
  $('qs-total').textContent=total;$('qs-fav').textContent=favCount;
  $('qs-secure').textContent=strong;$('qs-issues').textContent=issueIds.size;
  $('sb-count').textContent=total;$('sb-fav-count').textContent=favCount;$('sb-issues').textContent=issueIds.size;

  // Update filter counts
  const cats=['social','work','finance','personal','gaming','other'];
  $('fc-all').textContent=total;
  cats.forEach(c=>{const el=$('fc-'+c);if(el)el.textContent=vault.filter(e=>e.category===c).length});

  // Recent
  const catEmoj={social:'📱',work:'💼',finance:'💳',personal:'👤',gaming:'🎮',other:'📦'};
  $('dash-recent').innerHTML=vault.slice(0,6).length
    ?vault.slice(0,6).map(e=>`<div class="r-item" onclick="openModal('${e.id}')">
        <div class="r-av" style="background:${avColor(e.site)}">${initials(e.site)}</div>
        <div class="r-info"><div class="r-site">${esc(e.site)} ${e.fav?'⭐':''}</div><div class="r-user">${esc(e.username)}</div></div>
        <span class="r-age">${timeAgo(e.updated||e.created)}</span>
      </div>`).join('')
    :'<div style="text-align:center;color:var(--tx4);font-size:.82rem;padding:24px 0">No passwords saved yet</div>';

  // Categories chart
  const catColors={social:'#3b82f6',work:'#22c55e',finance:'#f59e0b',personal:'#8b5cf6',gaming:'#a855f7',other:'#64748b'};
  const counts=Object.fromEntries([...cats].map(c=>[c,vault.filter(e=>e.category===c).length]));
  const maxC=Math.max(...Object.values(counts),1);
  $('dash-cats').innerHTML=cats.map(c=>`<div class="cat-row">
    <div class="cat-top"><span class="cat-name">${catEmoj[c]} ${cap(c)}</span><span class="cat-n">${counts[c]}</span></div>
    <div class="cat-track"><div class="cat-fill" style="width:${(counts[c]/maxC*100).toFixed(1)}%;background:${catColors[c]}"></div></div>
  </div>`).join('');
}

// ── Audit ─────────────────────────────────────────
function runAudit(){
  const pwMap={};vault.forEach(e=>{(pwMap[e.password]=pwMap[e.password]||[]).push(e)});
  const reusedGrps=Object.values(pwMap).filter(g=>g.length>1);
  const reusedAll=reusedGrps.flat();
  const weak=vault.filter(e=>calcStr(e.password).pct<60);
  const old=vault.filter(e=>(Date.now()-(e.updated||e.created))>15552000000);

  const issueIds=new Set([...weak.map(e=>e.id),...reusedAll.map(e=>e.id)]);
  const score=vault.length?Math.max(0,Math.round((1-issueIds.size/vault.length)*100)):100;
  const arc=$('aud-arc');if(arc){const c=2*Math.PI*55;arc.style.strokeDashoffset=c*(1-score/100)}
  $('aud-score').textContent=score+'%';
  $('aud-desc').textContent=issueIds.size===0?'🎉 Your vault is healthy! No vulnerabilities found.':issueIds.size+' issue'+(issueIds.size!==1?'s':'')+' found. Fix them to improve your score.';

  const badges=[];
  if(!vault.length)badges.push({t:'Empty Vault',c:'var(--tx4)',bg:'var(--bg2)'});
  else{
    badges.push({t:score>=80?'✅ Healthy':'⚠️ At Risk',c:score>=80?'#065f46':'#92400e',bg:score>=80?'var(--em-l)':'var(--am-l)'});
    if(weak.length)badges.push({t:weak.length+' Weak',c:'#9f1239',bg:'var(--ro-l)'});
    if(reusedAll.length)badges.push({t:reusedAll.length+' Reused',c:'#7c2d12',bg:'#ffedd5'});
    if(old.length)badges.push({t:old.length+' Outdated',c:'#1e40af',bg:'#dbeafe'});
  }
  $('audit-badges').innerHTML=badges.map(b=>`<span class="audit-badge" style="background:${b.bg};color:${b.c}">${b.t}</span>`).join('');

  const sections=[];
  if(weak.length)sections.push(auditSection('Weak Passwords',weak,'var(--am)','var(--am-l)','#92400e',e=>calcStr(e.password).label));
  if(reusedGrps.length)sections.push(auditReused(reusedGrps));
  if(old.length)sections.push(auditSection('Outdated (6+ months)',old,'#3b82f6','#dbeafe','#1e40af',e=>'Last updated '+timeAgo(e.updated||e.created)));
  if(!sections.length)sections.push(`<div style="background:var(--sur);border:1px solid var(--bdr);border-radius:var(--r-lg);padding:48px;text-align:center;box-shadow:var(--sh1)"><div style="font-size:3rem;margin-bottom:14px">🛡️</div><h3 style="color:var(--em);margin-bottom:8px">All Clear!</h3><p style="color:var(--tx3);font-size:.875rem">No vulnerabilities found. Your vault is in great shape!</p></div>`);
  $('audit-results').innerHTML=sections.join('');
}
function auditSection(title,items,color,bg,tc,detail){
  return`<div class="audit-sec">
    <div class="audit-sec-hdr" style="border-left:4px solid ${color}"><svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" width="17" height="17"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
    <span class="aud-sec-title">${title}</span><span class="aud-badge" style="background:${bg};color:${tc}">${items.length} issues</span></div>
    <div class="audit-items">${items.map(e=>`<div class="audit-item"><div class="aud-av" style="background:${avColor(e.site)}">${initials(e.site)}</div><div class="aud-info"><div class="aud-site">${esc(e.site)}</div><div class="aud-detail">${esc(e.username)} · ${detail(e)}</div></div><button class="btn-outline" style="padding:5px 12px;font-size:.74rem" onclick="openModal('${e.id}')">Fix →</button></div>`).join('')}</div>
  </div>`;
}
function auditReused(groups){
  const all=groups.flat();
  return`<div class="audit-sec">
    <div class="audit-sec-hdr" style="border-left:4px solid var(--ro)"><svg viewBox="0 0 24 24" fill="none" stroke="var(--ro)" stroke-width="2" width="17" height="17"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    <span class="aud-sec-title">Reused Passwords</span><span class="aud-badge" style="background:var(--ro-l);color:#9f1239">${all.length} entries</span></div>
    <div class="audit-items">${groups.map(grp=>grp.map(e=>`<div class="audit-item"><div class="aud-av" style="background:${avColor(e.site)}">${initials(e.site)}</div><div class="aud-info"><div class="aud-site">${esc(e.site)}</div><div class="aud-detail">Same as: ${grp.filter(x=>x.id!==e.id).map(x=>esc(x.site)).join(', ')}</div></div><button class="btn-outline" style="padding:5px 12px;font-size:.74rem;border-color:var(--ro-l);color:var(--ro);background:var(--ro-l)" onclick="openModal('${e.id}')">Fix →</button></div>`).join('')).join('')}</div>
  </div>`;
}

// ── Tips ──────────────────────────────────────────
function setTip(){const t=TIPS[tipIdx];$('tip-title').textContent=t.title;$('tip-text').textContent=t.text}
function nextTip(){tipIdx=(tipIdx+1)%TIPS.length;setTip()}

// ── Toggles ───────────────────────────────────────
function toggleVis(id,btn){
  const inp=$(id);if(!inp)return;
  const show=inp.type==='password';inp.type=show?'text':'password';
  btn.querySelector('.ico-eye').classList.toggle('hidden',show);
  btn.querySelector('.ico-eye-off').classList.toggle('hidden',!show);
}

// ── Toast ─────────────────────────────────────────
function toast(msg,type='in'){
  const el=document.createElement('div');
  el.className=`toast ${type}`;
  el.innerHTML=`<span>${{ok:'✅',er:'❌',in:'ℹ️',wa:'⚠️'}[type]||'ℹ️'}</span><span>${msg}</span>`;
  $('toasts').appendChild(el);
  setTimeout(()=>{el.classList.add('fade');setTimeout(()=>el.remove(),350)},3500);
}

// ── Auth particles ────────────────────────────────
function spawnParticles(){
  const c=$('auth-particles');if(!c)return;
  for(let i=0;i<18;i++){
    const p=document.createElement('div');p.className='auth-particle';
    p.style.cssText=`left:${Math.random()*100}%;animation-duration:${7+Math.random()*12}s;animation-delay:${Math.random()*10}s;opacity:${.15+Math.random()*.35}`;
    c.appendChild(p);
  }
}

// ── Init ──────────────────────────────────────────
window.addEventListener('DOMContentLoaded',()=>{
  setTimeout(()=>{
    $('splash').style.display='none';
    $('auth-screen').classList.remove('hidden');
    spawnParticles();
    applyTheme(localStorage.getItem(THEME_KEY)||'light');
    switchTab(localStorage.getItem(META_KEY)?'login':'register');
    genPassword();
  },2700);

  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();openModal()}
    if((e.ctrlKey||e.metaKey)&&e.key==='g'){e.preventDefault();goTo('generator')}
    if((e.ctrlKey||e.metaKey)&&e.key==='f'){e.preventDefault();goTo('vault');$('vault-search').focus()}
    if(e.key==='Escape'){closeModal();closeTemplates();closeSettings();$('clip-dropdown').classList.add('hidden')}
  });
  document.addEventListener('click',e=>{
    const cd=$('clip-dropdown');
    if(!cd.classList.contains('hidden')&&!$('clip-btn').contains(e.target)&&!cd.contains(e.target))cd.classList.add('hidden');
  });
});
