const starter=[
{id:1,title:"Ceramic coffee set",category:"Home",points:450,condition:"Brand new, unopened",owner:"Aarav",pincode:"411014",emoji:"☕",bg:"#e7e9dc",desc:"A lovely neutral ceramic coffee set. Never used, still in its gift packaging.",wants:"Books or home décor",sample:true},
{id:2,title:"Illustrated storybook set",category:"Books",points:300,condition:"Brand new, unopened",owner:"Mira",pincode:"411057",emoji:"📚",bg:"#f1e3d4",desc:"A set of beautifully illustrated storybooks, received as a gift and never opened.",wants:"Board games or stationery",sample:true},
{id:3,title:"Minimal desk organiser",category:"Home",points:550,condition:"Brand new, open box",owner:"Rohan",pincode:"411045",emoji:"🗂️",bg:"#e1e9e4",desc:"Minimal desk organiser in a soft neutral finish. Opened only to check contents.",wants:"Books or accessories",sample:true},
{id:4,title:"Classic board game",category:"Games",points:650,condition:"Brand new, unopened",owner:"Anaya",pincode:"411033",emoji:"🎲",bg:"#efe4d2",desc:"A new family board game, still sealed. Great for game nights.",wants:"Home décor or books",sample:true},
{id:5,title:"Canvas tote bag",category:"Accessories",points:350,condition:"Unused, no original packaging",owner:"Ishaan",pincode:"411018",emoji:"👜",bg:"#e7e8dc",desc:"A sturdy canvas tote bag, unused and in excellent condition.",wants:"Stationery or games",sample:true},
{id:6,title:"Creative building blocks",category:"Toys",points:700,condition:"Brand new, unopened",owner:"Sara",pincode:"411027",emoji:"🧸",bg:"#f0dfd9",desc:"A colourful creative building set, unopened and ready for a new home.",wants:"Books or accessories",sample:true},
{id:7,title:"Premium notebook set",category:"Stationery",points:250,condition:"Brand new, unopened",owner:"Dev",pincode:"411038",emoji:"📓",bg:"#e1e8dd",desc:"Three premium notebooks in gift packaging. All unused.",wants:"Home or games",sample:true},
{id:8,title:"Decorative table lamp",category:"Home",points:900,condition:"Brand new, open box",owner:"Kiara",pincode:"411006",emoji:"💡",bg:"#f1e8d7",desc:"A tasteful decorative table lamp, opened for inspection but never used.",wants:"Accessories or books",sample:true}
];
let gifts=JSON.parse(localStorage.getItem("giftera_gifts")||localStorage.getItem("gl_gifts")||"null")||starter;
let requests=JSON.parse(localStorage.getItem("giftera_requests")||localStorage.getItem("gl_requests")||"[]");
let activeFilter="All";
function save(){localStorage.setItem("giftera_gifts",JSON.stringify(gifts));localStorage.setItem("giftera_requests",JSON.stringify(requests))}
function showPage(id){document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));document.getElementById(id).classList.add("active");window.scrollTo({top:0,behavior:"smooth"});if(id==="market")renderMarket();if(id==="dashboard")renderDashboard();if(id==="home")renderHome();setTimeout(()=>observeMotion(document.getElementById(id)),80)}
function card(g){return `<article class="gift-card"><div class="gift-photo" style="background:${g.bg||"#e7e9dc"}"><span>${g.photo?`<img src="${escapeHtml(g.photo)}" alt="${escapeHtml(g.title)}" style="width:100%;height:100%;object-fit:cover;border-radius:0">`:g.emoji||"🎁"}</span><span class="tag">${g.category}</span></div><div class="gift-info"><h3>${escapeHtml(g.title)}</h3><div class="gift-meta">${escapeHtml(g.condition||"New gift")} · ${escapeHtml(g.pincode||"Pune")}</div><div class="gift-bottom"><span class="points">${Number(g.points)||0} Gifter Points</span><button class="btn secondary" onclick="openGift(${g.id})">View gift</button></div></div></article>`}
function renderHome(){document.getElementById("homeGifts").innerHTML=gifts.slice(0,4).map(card).join("")}
function renderMarket(){let q=(document.getElementById("searchInput")?.value||"").toLowerCase();let list=gifts.filter(g=>(activeFilter==="All"||g.category===activeFilter)&&(`${g.title} ${g.category} ${g.description||""}`).toLowerCase().includes(q));document.getElementById("marketGifts").innerHTML=list.length?list.map(card).join(""):`<div class="empty">No gifts found. Try another search or category.</div>`}
function setFilter(cat,el){activeFilter=cat;document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));el.classList.add("active");renderMarket()}
function openGift(id){let g=gifts.find(x=>x.id===id);if(!g)return;document.getElementById("modalContent").innerHTML=`<div style="font-size:65px;text-align:center;background:${g.bg||"#e7e9dc"};border-radius:15px;padding:20px;margin:15px 0">${g.emoji||"🎁"}</div><h2 style="font:30px Georgia;color:var(--green);margin:0 0 6px">${escapeHtml(g.title)}</h2><p class="section-sub">${escapeHtml(g.description||"A gift looking for a new home.")}</p><div class="notice">${escapeHtml(g.condition||"Condition to be confirmed")} · ${escapeHtml(g.category)} · ${escapeHtml(g.pincode||"Pune")}</div><p><b>${Number(g.points)||0} Gifter Points</b></p><p class="hint">Listed by ${escapeHtml(g.owner||"GIFTERA member")} · ${g.sample?"Sample listing":"Community demo listing"}</p><div class="form-actions"><button class="btn primary" onclick="requestGift(${g.id},'points')">Request with points</button><button class="btn outline" onclick="requestGift(${g.id},'direct')">Propose direct swap</button></div><p class="hint">Demo interaction only. No real points, user identity or courier booking is involved.</p>`;document.getElementById("giftModal").classList.add("show")}
function closeModal(){document.getElementById("giftModal").classList.remove("show")}
function requestGift(id,type){let g=gifts.find(x=>x.id===id);requests.push({id:Date.now(),gift:g.title,type,status:"Demo request created"});save();closeModal();toast(type==="points"?"Demo points request created":"Demo swap proposal created");}
function renderDashboard(){let mine=gifts.filter(g=>!g.sample);document.getElementById("statGifts").textContent=mine.length;document.getElementById("statRequests").textContent=requests.length;document.getElementById("myListings").innerHTML=mine.length?mine.map(g=>`<div class="list-row"><span>🎁 ${escapeHtml(g.title)}</span><span class="hint">Submitted · pending demo review</span></div>`).join(""):`<p class="section-sub">You haven't listed a gift yet.</p>`;document.getElementById("myRequests").innerHTML=requests.length?requests.map(r=>`<div class="list-row"><span>${escapeHtml(r.gift)} · ${r.type==="points"?"Points request":"Direct swap"}</span><span class="hint">${r.status}</span></div>`).join(""):`<p class="section-sub">No exchange requests yet.</p>`}
document.getElementById("giftForm").addEventListener("submit",e=>{e.preventDefault();let f=new FormData(e.target);let g={id:Date.now(),title:f.get("title"),category:f.get("category"),points:Number(f.get("points"))||300,condition:f.get("condition"),owner:f.get("owner"),pincode:f.get("pincode"),emoji:"🎁",bg:"#e4eadf",description:f.get("description"),wants:f.get("wants"),photo:f.get("photo"),sample:false};gifts.unshift(g);save();e.target.reset();toast("Gift saved in this browser demo. It is not publicly listed.");showPage("dashboard")});
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
let toastTimer;function toast(s){let el=document.getElementById("toast");el.textContent=s;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2800)}
renderHome();

// Scroll-aware reveal, floating depth, and gentle 3D card tilt.
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => { if(entry.isIntersecting){ entry.target.classList.add('in-view'); revealObserver.unobserve(entry.target); } });
},{threshold:.12});
function observeMotion(root=document){
  root.querySelectorAll('.step,.gift-card,.section-head,.cta,.form-card,.panel').forEach((el,i)=>{
    if(!el.classList.contains('reveal')) el.classList.add('reveal');
    el.style.transitionDelay = `${Math.min(i%4,3)*70}ms`;
    revealObserver.observe(el);
  });
  root.querySelectorAll('.gift-card').forEach(card=>{
    if(card.dataset.tiltReady) return; card.dataset.tiltReady='1';
    card.addEventListener('pointermove',e=>{
      if(window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth<800) return;
      const r=card.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`perspective(900px) rotateX(${(-y*8).toFixed(2)}deg) rotateY(${(x*9).toFixed(2)}deg) translateY(-5px)`;
    });
    card.addEventListener('pointerleave',()=>{card.style.transform=''});
  });
}
function updateScrollProgress(){const d=document.documentElement;const max=d.scrollHeight-innerHeight;document.getElementById('scrollProgress').style.width=(max>0?(scrollY/max)*100:0)+'%';}
window.addEventListener('scroll',updateScrollProgress,{passive:true});
const motionMutation = new MutationObserver(()=>observeMotion());
motionMutation.observe(document.getElementById('home'),{childList:true,subtree:true});
motionMutation.observe(document.getElementById('market'),{childList:true,subtree:true});
observeMotion(); updateScrollProgress();
