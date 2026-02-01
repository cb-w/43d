// script.js - يعرض الأعضاء من members.json ثم يعرض بقية الصور العشوائية من images.json

async function loadAndRender() {
  const grid = document.getElementById('membersGrid');
  const photosContainer = document.getElementById('randomPhotos');
  grid.innerHTML = '';
  photosContainer.innerHTML = '';

  let members = [];
  try {
    const res = await fetch('./members.json', { cache: "no-store" });
    if (res.ok) members = await res.json();
  } catch (err) {
    console.warn('members.json not found:', err);
  }

  // عرض الأعضاء من members.json
  members.forEach((m) => {
    const filename = m.image;
    const displayName = m.name || filename.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ");
    const card = document.createElement('article');
    card.className = 'card standard';
    card.innerHTML = `
      <div class="avatar"><img src="images/${filename}" alt="${displayName}" onerror="this.src='images/placeholder.png'"></div>
      <div class="meta">
        <div class="name">${displayName}</div>
        <div class="muted">${m.location || ''}</div>
      </div>
      <div class="chev">›</div>
    `;
    card.addEventListener('click', ()=> openModalFromFilename(filename, displayName, m));
    grid.appendChild(card);
  });

  // جمع كل أسماء صور الأعضاء لتستبعدها من الصور العشوائية
  const memberImgs = members.map(m => m.image);

  // اقرأ images.json لو موجود لعرض بقية الصور العشوائية
  let files = [];
  try {
    const res2 = await fetch('images.json', { cache: "no-store" });
    if (res2.ok) files = await res2.json();
  } catch (err) {
    console.warn('images.json not found:', err);
  }

  const ignorePattern = /^(logo|placeholder)/i;
  const remaining = files.filter(f => !ignorePattern.test(f) && !memberImgs.includes(f));

  // رندر صور عشوائية تحت البطاقات
  remaining.forEach((filename) => {
    const tile = document.createElement('div');
    tile.className = 'photo-tile';
    tile.innerHTML = `<img src="images/${filename}" alt="${filename}" onerror="this.src='images/placeholder.png'">`;
    tile.addEventListener('click', ()=> openModalFromFilename(filename, ''));
    photosContainer.appendChild(tile);
  });
}

function openModalFromFilename(filename, displayName, memberObj) {
  const modal = document.getElementById('modal');
  const detailImage = document.getElementById('detailImage');
  const detailName = document.getElementById('detailName');
  const detailNickname = document.getElementById('detailNickname');
  const detailAge = document.getElementById('detailAge');
  const detailLocation = document.getElementById('detailLocation');

  detailImage.src = `images/${filename}`;
  detailName.textContent = memberObj?.name || displayName || '';
  detailNickname.textContent = memberObj?.nickname || '';
  detailAge.textContent = memberObj?.age ? memberObj.age + ' سنة' : '';
  detailLocation.textContent = memberObj?.location || '';
  modal.setAttribute('aria-hidden','false');
}

document.getElementById('modalClose').addEventListener('click', ()=> document.getElementById('modal').setAttribute('aria-hidden','true'));
document.getElementById('modal').addEventListener('click', (e)=> { if(e.target === document.getElementById('modal')) document.getElementById('modal').setAttribute('aria-hidden','true'); });

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

// ابدأ التحميل
loadAndRender();