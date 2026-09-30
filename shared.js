const K={u:'gw_users',d:'gw_dests',t:'gw_thr',s:'gw_session'};
const ROLES={tourism:'Tourism Officer',lgu:'LGU Officer',admin:'System Admin'};
async function hash(s){try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('gw:'+s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}catch(e){let h=5381;for(const c of 'gw:'+s)h=(h*33^c.charCodeAt(0))>>>0;return 'f'+h}}
const cams=n=>Array.from({length:n},(_,i)=>({name:'Camera '+(i+1),online:true}));
const dst=(id,name,region,lat,lng,visitors,cap,trend,alert,alertMsg,n)=>({id,name,region,lat,lng,visitors,cap,trend,alert,alertMsg,cameras:cams(n)});
const SEED=[
dst('baguio','Baguio City','Benguet, CAR',16.4023,120.5960,42800,87,[18000,24000,31000,38000,42000,41000,42800],'warn','Approaching capacity. LGU entry management recommended.',4),
dst('sagada','Sagada','Mountain Province, CAR',17.0848,120.9013,8400,62,[4000,5200,6800,7500,8100,8200,8400],'ok','Within normal range. Stable conditions.',2),
dst('vigan','Vigan City','Ilocos Sur',17.5747,120.3869,21000,55,[14000,16000,17500,19000,20000,20800,21000],'ok','Stable. Good opportunity for targeted promotion.',3),
dst('laoag','Laoag City','Ilocos Norte',18.1978,120.5936,14500,44,[9000,10500,11000,12500,13800,14200,14500],'ok','Well within capacity. Growth opportunity.',2),
dst('banaue','Banaue','Ifugao, CAR',16.9178,121.0589,5200,71,[2800,3400,4000,4600,4900,5100,5200],'warn','Rising density detected. Monitor closely.',2),
dst('tug','Tuguegarao City','Cagayan Valley',17.6132,121.7270,9800,33,[6000,6800,7200,8000,8800,9400,9800],'info','Low congestion. Strong promotion opportunity.',2),
dst('bolinao','Bolinao','Pangasinan, Region I',16.3833,119.9000,18500,48,[11000,12500,14000,15500,16800,17500,18500],'ok','Rising trend. Plan infrastructure ahead of peak.',2),
dst('angeles','Angeles City','Pampanga, Central Luzon',15.1450,120.5887,28500,59,[18000,20000,22000,24000,26000,27500,28500],'ok','Steady growth. Conditions remain stable.',3)];
const Store={
 get(k,f){try{const v=JSON.parse(localStorage.getItem(k));return v==null?f:v}catch(e){return f}},
 set(k,v){localStorage.setItem(k,JSON.stringify(v))},
 async init(){
  if(!this.get(K.u)) this.set(K.u,[
   {username:'admin',name:'System Admin',role:'admin',active:true,pw:await hash('Admin@123')},
   {username:'tourism',name:'Tourism Officer',role:'tourism',active:true,pw:await hash('Tourism@123')},
   {username:'lgu',name:'LGU Officer',role:'lgu',active:true,pw:await hash('Lgu@12345')}]);
  if(!this.get(K.d)) this.set(K.d,SEED);
  if(!this.get(K.t)) this.set(K.t,{med:40,high:70});
 },
 users(){return this.get(K.u,[])},
 destinations(){return this.get(K.d,[])},
 thresholds(){return this.get(K.t,{med:40,high:70})}
};
const Auth={
 async login(u,p,kind){
  await Store.init();
  const x=Store.users().find(a=>a.username===u.trim().toLowerCase());
  if(!x||!x.active||x.pw!==await hash(p)) return 'Invalid username or password.';
  if((kind==='admin')!==(x.role==='admin')) return kind==='admin'?'This page is for the System Admin only.':'System Admin must sign in on the admin login page.';
  Store.set(K.s,{username:x.username,name:x.name,role:x.role});
  location.href=x.role==='admin'?'admin.html':'index.html';
 },
 user(){return Store.get(K.s,null)},
 require(roles){
  const s=this.user(), u=s&&Store.users().find(a=>a.username===s.username&&a.active);
  if(!s||!u||!roles.includes(s.role)){localStorage.removeItem(K.s);location.replace(roles.length===1&&roles[0]==='admin'?'admin-login.html':'login.html');return null}
  return s;
 },
 logout(){const a=(this.user()||{}).role==='admin';localStorage.removeItem(K.s);location.href=a?'admin-login.html':'login.html'}
};
function loginPage(kind){
 const a=kind==='admin', s=Auth.user();
 if(s) location.replace(s.role==='admin'?'admin.html':'index.html');
 document.body.className='login';
 document.body.innerHTML=`<form class="lcard" id="lf"><div class="brand-title">GalaWatch</div><div class="brand-sub">${a?'System Administrator Login':'Tourism Officer / LGU Officer Login'}</div>
 <label>Username<input id="lu" autocomplete="username" required></label>
 <label>Password<input id="lp" type="password" autocomplete="current-password" required></label>
 <div class="err" id="le"></div><button class="btn" type="submit">Sign in</button>
 <a href="${a?'login.html':'admin-login.html'}">${a?'Go to officer login':'Go to system admin login'}</a></form>`;
 document.getElementById('lf').onsubmit=async e=>{e.preventDefault();const le=document.getElementById('le');le.textContent='';const r=await Auth.login(document.getElementById('lu').value,document.getElementById('lp').value,kind);if(r)le.textContent=r};
}
