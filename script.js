// script.js - يعرض الأعضاء أولاً، ثم الصور العشوائية (photo_*) تحت البطاقات.
// يتجاهل ملفات الشعار والـ placeholder من القوائم.

async function loadAndRender() {
  const grid = document.getElementById('membersGrid');
  const photosContainer = document.getElementById('randomPhotos');
  grid.innerHTML = '';
  photosContainer.innerHTML = '';

  let files = [];
  try {
    const res = await fetch('images.json', { cache: "no-store" });
    if (!res.ok) throw new Error('images.json not found');
    files = await res.json();
  } catch (err) {
    console.warn('Could not load images.json:', err);
    grid.innerHTML = `<p style="color:#bbb">لم يتم العثور على images.json. شغّل أمر التوليد أو افتح الموقع عبر خادم محلي.</p>`;
    return;
  }

  // استبعد ملف��ت الشعار والـ placeholder
  const ignorePattern = /^(logo|placeholder)/i;
  const filtered = files.filter(f => !ignorePattern.test(f));

  // قسّم الملفات: أعضاء عادية وملفات عشوائية تبدأ بـ photo_
  const randomFiles = filtered.filter(f => /^photo_/i.test(f));
  const memberFiles = filtered.filter(f => !/^photo_/i.test(f));

  // رندر بطاقات الأعضاء (الدائرية مع أسماء مستخرجة)
  memberFiles.forEach((filename, i) => {
    const displayName = filename.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ");
    const card = document.createElement('article');
    card.className = 'card standard';
    card.dataset.index = i;
    card.innerHTML = `
      <div class="avatar"><img src="images/${filename}" alt="${displayName}" onerror="this.src='images/placeholder.png'"></div>
      <div class="meta">
        <div class="name">${displayName}</div>
        <div class="muted"></div>
      </div>
      <div class="chev">›</div>
    `;
    card.addEventListener('click', ()=> openModalFromFilename(filename, displayName));
    grid.appendChild(card);
  });

  // رندر الصور العشوائية في قسم منفصل تحت البطاقات
  randomFiles.forEach((filename) => {
    const tile = document.createElement('div');
    tile.className = 'photo-tile';
    tile.innerHTML = `<img src="images/${filename}" alt="${filename}" onerror="this.src='images/placeholder.png'">`;
    tile.addEventListener('click', ()=> openModalFromFilename(filename, ''));
    photosContainer.appendChild(tile);
  });
}

// فتح المودال بالصورة الكبيرة (يعمل لكلا النوعين)
function openModalFromFilename(filename, displayName) {
  const modal = document.getElementById('modal');
  const detailImage = document.getElementById('detailImage');
  const detailName = document.getElementById('detailName');
  const detailNickname = document.getElementById('detailNickname');
  const detailAge = document.getElementById('detailAge');
  const detailLocation = document.getElementById('detailLocation');

  detailImage.src = `images/${filename}`;
  detailName.textContent = displayName || '';
  detailNickname.textContent = '';
  detailAge.textContent = '';
  detailLocation.textContent = '';
  modal.setAttribute('aria-hidden','false');
}

// البحث — يبحث فقط في بطاقات الأعضاء (لا يلمس الصور العشوائية)
const searchInput = document.getElementById('search');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    const cards = document.querySelectorAll('.card.standard');
    cards.forEach(c => {
      const nameEl = c.querySelector('.name');
      const name = nameEl ? nameEl.textContent.toLowerCase() : '';
      c.style.display = name.includes(q) ? 'flex' : 'none';
    });
  });
}

// إغلاق المودال
document.getElementById('modalClose').addEventListener('click', ()=> document.getElementById('modal').setAttribute('aria-hidden','true'));
document.getElementById('modal').addEventListener('click', (e)=> { if(e.target === document.getElementById('modal')) document.getElementById('modal').setAttribute('aria-hidden','true'); });

// ابدأ التحميل
loadAndRender();