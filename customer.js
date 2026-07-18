const STORAGE_KEY = "tscar_service_records_v1";
const CUSTOMER_SESSION = "tscar_customer_session";
const loginCard = document.getElementById("customerLoginCard");
const portal = document.getElementById("customerPortal");
const loginForm = document.getElementById("customerLoginForm");
const identifierInput = document.getElementById("customerIdentifier");
const pinInput = document.getElementById("customerPin");
const errorEl = document.getElementById("customerLoginError");
const logoutBtn = document.getElementById("customerLogoutBtn");

function loadRecords(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||[]}catch{return []}}
function normalize(v=""){return String(v).trim().toLowerCase().replace(/\s+/g,"")}
function findCustomerRecords(identifier,pin){
  const id = normalize(identifier);
  return loadRecords().filter(r=>{
    const phoneMatch = normalize(r.phone)===id;
    const emailMatch = normalize(r.customerEmail)===id;
    return (phoneMatch||emailMatch) && String(r.customerPin||"")===String(pin||"");
  }).sort((a,b)=>String(b.serviceDate||"").localeCompare(String(a.serviceDate||"")));
}
function showPortal(records){
  if(!records.length)return;
  loginCard.classList.add("hidden"); portal.classList.remove("hidden");
  const latest=records[0];
  document.getElementById("welcomeName").textContent=`أهلاً ${latest.customerName||"بك"}`;
  const current=Number(latest.mileage||0), next=Number(latest.nextMileage||0), remaining=next&&current?next-current:null;
  document.getElementById("summaryGrid").innerHTML=`
    <div class="summary"><span>آخر صيانة</span><strong>${escapeHtml(latest.serviceDate||"-")}</strong></div>
    <div class="summary"><span>آخر فاتورة</span><strong>${formatPrice(latest.price)}</strong></div>
    <div class="summary"><span>العداد الحالي</span><strong>${formatMileage(latest.mileage)}</strong></div>
    <div class="summary"><span>عداد الرجوع</span><strong class="${remaining!==null&&remaining<=0?'due':'ok'}">${formatMileage(latest.nextMileage)}</strong></div>`;
  document.getElementById("latestInvoice").innerHTML=`<h2>آخر فاتورة وصيانة</h2>
    <div class="invoice-grid">
      <div><b>السيارة:</b> ${escapeHtml([latest.carType,latest.carModel].filter(Boolean).join(" - ")||"-")}</div>
      <div><b>رقم السيارة:</b> ${escapeHtml(latest.plateNumber||"-")}</div>
      <div><b>نوع الزيت:</b> ${escapeHtml(latest.oilType||"-")} ${latest.liters?`(${escapeHtml(latest.liters)} لتر)`:""}</div>
      <div><b>المتبقي للرجوع:</b> ${remaining===null?"-":remaining<=0?"حان موعد الصيانة":`${remaining.toLocaleString("ar-IQ")} كم`}</div>
    </div>
    <div class="details"><b>ما تم تبديله:</b> ${escapeHtml(latest.replacedParts||"-")}\n<b>تفاصيل الصيانة:</b> ${escapeHtml(latest.lastService||"-")}\n<b>ملاحظات:</b> ${escapeHtml(latest.notes||"-")}</div>`;
  document.getElementById("historyCount").textContent=`${records.length} سجل`;
  document.getElementById("customerHistory").innerHTML=records.map(r=>`<article class="history-item"><div class="history-top"><h3>${escapeHtml(r.serviceDate||"بدون تاريخ")}</h3><strong>${formatPrice(r.price)}</strong></div><p>${escapeHtml([r.carType,r.carModel].filter(Boolean).join(" - ")||"")} • العداد: ${formatMileage(r.mileage)} • الرجوع: ${formatMileage(r.nextMileage)}</p></article>`).join("");
}
loginForm.addEventListener("submit",e=>{e.preventDefault();const records=findCustomerRecords(identifierInput.value,pinInput.value);if(!records.length){errorEl.textContent="البيانات أو رمز الدخول غير صحيح";return;}sessionStorage.setItem(CUSTOMER_SESSION,JSON.stringify({identifier:identifierInput.value,pin:pinInput.value}));errorEl.textContent="";showPortal(records)});
logoutBtn.addEventListener("click",()=>{sessionStorage.removeItem(CUSTOMER_SESSION);location.reload()});
try{const s=JSON.parse(sessionStorage.getItem(CUSTOMER_SESSION));if(s){const r=findCustomerRecords(s.identifier,s.pin);if(r.length)showPortal(r)}}catch{}
function formatPrice(v){const n=Number(v);return Number.isFinite(n)&&v!==""?`${n.toLocaleString("ar-IQ")} د.ع`:"-"}
function formatMileage(v){const n=Number(v);return Number.isFinite(n)&&v!==""?`${n.toLocaleString("ar-IQ")} كم`:"-"}
function escapeHtml(v=""){return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]))}
