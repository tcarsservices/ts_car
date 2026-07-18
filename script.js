const services = [
  { id:"computer", icon:"🖥️", title:"فحص كمبيوتر", short:"فحص أنظمة السيارة وقراءة الأعطال باستخدام أجهزة حديثة.", description:"نفحص أنظمة السيارة إلكترونياً، نقرأ أكواد الأعطال، ونوضح للزبون النتائج والخطوات المقترحة قبل البدء بأي تبديل.", gallery:["جهاز الفحص","قراءة الأكواد","تقرير الأعطال"] },
  { id:"oil", icon:"🛢️", title:"تبديل الزيوت والفلاتر", short:"اختيار الزيت المناسب وتبديل الفلاتر باحترافية.", description:"نختار اللزوجة والمواصفة المناسبة حسب نوع السيارة والمحرك، مع تسجيل نوع الزيت وعدد اللترات والفلاتر المستبدلة.", gallery:["الزيت المستخدم","الفلتر الجديد","قبل وبعد الخدمة"] },
  { id:"tpms", icon:"🛞", title:"TPMS والإطارات", short:"فحص وبرمجة حساسات ضغط الإطارات وخدمات الإطارات.", description:"فحص حساسات ضغط الإطارات، تحديد الحساس المتعطل، البرمجة وإعادة التعلّم عند الحاجة.", gallery:["فحص TPMS","برمجة الحساس","قراءة ضغط الإطارات"] },
  { id:"battery", icon:"🔋", title:"البطاريات", short:"فحص البطارية ومنظومة الشحن وتوفير الخيارات المناسبة.", description:"نفحص جهد البطارية، الدينمو، ومنظومة الشحن، ثم نوضح حالة البطارية والخيار المناسب للسيارة.", gallery:["فحص البطارية","قراءة الشحن","البطارية المركبة"] },
  { id:"gear", icon:"⚙️", title:"هيدروليك الكير", short:"تبديل زيت وهيدروليك الكير حسب مواصفات السيارة.", description:"خدمة تبديل هيدروليك الكير والزيت المناسب مع فحص شامل قبل وبعد العمل وتسجيل تفاصيل الصيانة.", gallery:["الهيدروليك القديم","الزيت المستخدم","بعد إكمال الخدمة"] },
  { id:"alignment", icon:"🧰", title:"تعديل ويل كب", short:"تعديل وضبط زوايا العجلات لتحسين الثبات.", description:"ضبط زوايا العجلات وتقليل تآكل الإطارات وتحسين ثبات السيارة حسب الحالة.", gallery:["قبل التعديل","قراءة الزوايا","بعد الضبط"] },
  { id:"throttle", icon:"💨", title:"تنظيف بوابة الهواء", short:"تنظيف البوابة والثروتل لتحسين استجابة المحرك.", description:"تنظيف بوابة الهواء والثروتل وإزالة الترسبات لتحسين الاستجابة واستقرار دوران المحرك.", gallery:["قبل التنظيف","أثناء الخدمة","بعد التنظيف"] },
  { id:"care", icon:"✨", title:"عناية شاملة", short:"متابعة حالة السيارة وتقديم نصائح الصيانة المناسبة.", description:"فحص عام ومراجعة سريعة لأهم نقاط الصيانة مع نصائح واضحة حسب حالة السيارة.", gallery:["فحص عام","ملاحظات الفني","توصيات الصيانة"] }
];

const grid = document.getElementById("servicesGrid");
const modal = document.getElementById("serviceModal");
const modalTitle = document.getElementById("modalTitle");
const modalIcon = document.getElementById("modalIcon");
const modalDescription = document.getElementById("modalDescription");
const modalGallery = document.getElementById("modalGallery");

services.forEach((service) => {
  const card = document.createElement("button");
  card.className = "service-card reveal";
  card.type = "button";
  card.innerHTML = `
    <div class="service-icon">${service.icon}</div>
    <h3>${service.title}</h3>
    <p>${service.short}</p>
    <span class="service-more">اضغط لعرض التفاصيل والصور ←</span>
  `;
  card.addEventListener("click", () => openService(service));
  grid.appendChild(card);
});

function openService(service){
  modalIcon.textContent = service.icon;
  modalTitle.textContent = service.title;
  modalDescription.textContent = service.description;
  const savedImages = getServiceImages(service.id);
  modalGallery.innerHTML = savedImages.length
    ? savedImages.map((src) => `<img class="gallery-image" src="${src}" alt="${service.title}" />`).join("")
    : service.gallery.map((item) => `<div class="gallery-placeholder">${item}<br><small>لم تتم إضافة صورة بعد</small></div>`).join("");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
}

function closeModal(){
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden","true");
  document.body.style.overflow = "";
}

document.querySelectorAll("[data-close-modal]").forEach((el) => el.addEventListener("click", closeModal));
document.addEventListener("keydown", (e) => { if(e.key === "Escape") closeModal(); });

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if(entry.isIntersecting) entry.target.classList.add("show");
  });
},{threshold:.12});

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

function getServiceImages(serviceId){
  try{
    const all = JSON.parse(localStorage.getItem("tscar_service_images_v1")) || {};
    return Array.isArray(all[serviceId]) ? all[serviceId] : [];
  }catch{return [];}
}
