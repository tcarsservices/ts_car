const PASSWORD = "TS2026";
const STORAGE_KEY = "tscar_service_records_v1";
const SESSION_KEY = "tscar_admin_logged_in";

const loginScreen = document.getElementById("loginScreen");
const adminApp = document.getElementById("adminApp");
const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("passwordInput");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");

function showApp(){
  loginScreen.classList.add("hidden");
  adminApp.classList.remove("hidden");
}
if(sessionStorage.getItem(SESSION_KEY) === "1") showApp();

loginForm.addEventListener("submit",(e)=>{
  e.preventDefault();
  if(passwordInput.value === PASSWORD){
    sessionStorage.setItem(SESSION_KEY,"1");
    loginError.textContent = "";
    showApp();
  } else {
    loginError.textContent = "كلمة المرور غير صحيحة";
  }
});
logoutBtn.addEventListener("click",()=>{
  sessionStorage.removeItem(SESSION_KEY);
  location.reload();
});

const form = document.getElementById("serviceForm");
const recordsContainer = document.getElementById("recordsContainer");
const searchInput = document.getElementById("searchInput");
const resetBtn = document.getElementById("resetBtn");
const printCurrentBtn = document.getElementById("printCurrentBtn");
const exportBtn = document.getElementById("exportBtn");
const importInput = document.getElementById("importInput");
const recordCount = document.getElementById("recordCount");
const formTitle = document.getElementById("formTitle");

const fields = ["recordId","customerName","phone","carType","carModel","plateNumber","serviceDate","mileage","oilType","liters","price","replacedParts","lastService","notes"];
const el = Object.fromEntries(fields.map(id=>[id,document.getElementById(id)]));

let records = loadRecords();
if(!el.serviceDate.value) el.serviceDate.value = new Date().toISOString().slice(0,10);
renderRecords();

function loadRecords(){
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];}
  catch{return [];}
}
function saveRecords(){
  localStorage.setItem(STORAGE_KEY,JSON.stringify(records));
}
function getFormData(){
  return {
    id: el.recordId.value || crypto.randomUUID(),
    customerName: el.customerName.value.trim(),
    phone: el.phone.value.trim(),
    carType: el.carType.value.trim(),
    carModel: el.carModel.value.trim(),
    plateNumber: el.plateNumber.value.trim(),
    serviceDate: el.serviceDate.value,
    mileage: el.mileage.value,
    oilType: el.oilType.value.trim(),
    liters: el.liters.value,
    price: el.price.value,
    replacedParts: el.replacedParts.value.trim(),
    lastService: el.lastService.value.trim(),
    notes: el.notes.value.trim(),
    updatedAt: new Date().toISOString()
  };
}
form.addEventListener("submit",(e)=>{
  e.preventDefault();
  const data = getFormData();
  const index = records.findIndex(r=>r.id===data.id);
  if(index>=0) records[index] = data;
  else records.unshift(data);
  saveRecords();
  resetForm();
  renderRecords(searchInput.value);
  alert("تم حفظ سجل الصيانة");
});
resetBtn.addEventListener("click",resetForm);
function resetForm(){
  form.reset();
  el.recordId.value = "";
  el.serviceDate.value = new Date().toISOString().slice(0,10);
  formTitle.textContent = "إضافة سجل صيانة جديد";
}
function renderRecords(query=""){
  const q = query.trim().toLowerCase();
  const filtered = records.filter(r=>[
    r.customerName,r.phone,r.carType,r.carModel,r.plateNumber,r.oilType,r.replacedParts
  ].join(" ").toLowerCase().includes(q));
  recordCount.textContent = `${filtered.length} سجل`;
  if(!filtered.length){
    recordsContainer.innerHTML = `<div class="empty">لا توجد سجلات مطابقة</div>`;
    return;
  }
  recordsContainer.innerHTML = filtered.map(recordTemplate).join("");
  document.querySelectorAll("[data-edit]").forEach(btn=>btn.addEventListener("click",()=>editRecord(btn.dataset.edit)));
  document.querySelectorAll("[data-delete]").forEach(btn=>btn.addEventListener("click",()=>deleteRecord(btn.dataset.delete)));
  document.querySelectorAll("[data-print]").forEach(btn=>btn.addEventListener("click",()=>printRecord(btn.dataset.print)));
}
function recordTemplate(r){
  return `<article class="record">
    <div class="record-top">
      <div><h3>${escapeHtml(r.customerName)}</h3><div class="meta">${escapeHtml(r.phone||"بدون هاتف")} • ${escapeHtml(r.serviceDate||"")}</div></div>
      <strong>${formatPrice(r.price)}</strong>
    </div>
    <div class="record-grid">
      <div><b>السيارة:</b> ${escapeHtml([r.carType,r.carModel].filter(Boolean).join(" - "))}</div>
      <div><b>رقم السيارة:</b> ${escapeHtml(r.plateNumber||"-")}</div>
      <div><b>العداد:</b> ${escapeHtml(r.mileage||"-")}</div>
      <div><b>الزيت:</b> ${escapeHtml(r.oilType||"-")} ${r.liters?`(${escapeHtml(r.liters)} لتر)`:""}</div>
    </div>
    <div class="record-notes"><b>ما تم تبديله:</b> ${escapeHtml(r.replacedParts||"-")}
<b>تفاصيل الصيانة:</b> ${escapeHtml(r.lastService||"-")}
<b>ملاحظات:</b> ${escapeHtml(r.notes||"-")}</div>
    <div class="record-actions">
      <button data-edit="${r.id}">تعديل</button>
      <button data-print="${r.id}">طباعة</button>
      <button class="delete" data-delete="${r.id}">حذف</button>
    </div>
  </article>`;
}
function editRecord(id){
  const r = records.find(x=>x.id===id);
  if(!r) return;
  fields.forEach(key=>{ if(el[key]) el[key].value = r[key] ?? ""; });
  formTitle.textContent = "تعديل سجل الصيانة";
  window.scrollTo({top:0,behavior:"smooth"});
}
function deleteRecord(id){
  if(!confirm("متأكد تريد حذف هذا السجل؟")) return;
  records = records.filter(r=>r.id!==id);
  saveRecords();
  renderRecords(searchInput.value);
}
searchInput.addEventListener("input",()=>renderRecords(searchInput.value));
function printRecord(id){
  const r = records.find(x=>x.id===id);
  if(!r) return;
  const w = window.open("","_blank","width=850,height=900");
  w.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>سجل صيانة</title><style>body{font-family:Arial;padding:35px;line-height:1.8}h1{color:#075fc8}.box{border:1px solid #ccc;padding:16px;margin:12px 0;border-radius:10px}b{color:#075fc8}</style></head><body>
  <h1>TS Car - سجل صيانة</h1>
  <div class="box"><b>اسم الزبون:</b> ${escapeHtml(r.customerName)}<br><b>الهاتف:</b> ${escapeHtml(r.phone||"-")}</div>
  <div class="box"><b>السيارة:</b> ${escapeHtml(r.carType)} ${escapeHtml(r.carModel||"")}<br><b>رقم السيارة:</b> ${escapeHtml(r.plateNumber||"-")}<br><b>التاريخ:</b> ${escapeHtml(r.serviceDate)}<br><b>العداد:</b> ${escapeHtml(r.mileage||"-")}</div>
  <div class="box"><b>نوع الزيت:</b> ${escapeHtml(r.oilType||"-")}<br><b>عدد اللترات:</b> ${escapeHtml(r.liters||"-")}<br><b>السعر:</b> ${formatPrice(r.price)}</div>
  <div class="box"><b>ما تم تبديله:</b><br>${escapeHtml(r.replacedParts||"-")}<br><br><b>تفاصيل الصيانة:</b><br>${escapeHtml(r.lastService||"-")}<br><br><b>ملاحظات:</b><br>${escapeHtml(r.notes||"-")}</div>
  <p>التقني لخدمات السيارات - 0773 963 6173</p>
  <script>window.onload=()=>window.print()<\/script></body></html>`);
  w.document.close();
}
printCurrentBtn.addEventListener("click",()=>window.print());
exportBtn.addEventListener("click",()=>{
  const blob = new Blob([JSON.stringify(records,null,2)],{type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `TS-Car-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
});
importInput.addEventListener("change",async()=>{
  const file = importInput.files[0];
  if(!file) return;
  try{
    const imported = JSON.parse(await file.text());
    if(!Array.isArray(imported)) throw new Error();
    if(confirm("استيراد النسخة سيستبدل السجلات الحالية. متابعة؟")){
      records = imported;
      saveRecords();
      renderRecords();
    }
  }catch{alert("ملف النسخة الاحتياطية غير صالح");}
  importInput.value = "";
});
function formatPrice(value){
  const n = Number(value);
  return Number.isFinite(n)&&value!=="" ? `${n.toLocaleString("ar-IQ")} د.ع` : "-";
}
function escapeHtml(value=""){
  return String(value).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));
}
