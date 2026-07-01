const $ = (q, root=document) => root.querySelector(q);
const $$ = (q, root=document) => [...root.querySelectorAll(q)];

// Navbar polish
window.addEventListener('scroll', () => {
  $('.nav').classList.toggle('scrolled', window.scrollY > 18);
});

// Reveal animation
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, {threshold: .12});
$$('.reveal').forEach(el => revealObserver.observe(el));

// Phone tilt
const stage = $('#tiltStage');
if(stage){
  stage.addEventListener('mousemove', e => {
    const r = stage.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    const main = $('.phone-shell.main', stage);
    main.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-8px)`;
  });
  stage.addEventListener('mouseleave', () => {
    $('.phone-shell.main', stage).style.transform = '';
  });
}

// Scroll-like story preview using click/hover and viewport progress
const storyPhone = $('#storyPhone');
const storySteps = $$('.story-step');
storySteps.forEach(step => {
  const activate = () => {
    storySteps.forEach(s => s.classList.remove('active'));
    step.classList.add('active');
    storyPhone.src = `assets/screens/${step.dataset.img}`;
  };
  step.addEventListener('mouseenter', activate);
  step.addEventListener('click', activate);
});
window.addEventListener('scroll', () => {
  const section = $('.scroll-experience');
  if(!section || !storyPhone) return;
  const r = section.getBoundingClientRect();
  if(r.top > window.innerHeight || r.bottom < 0) return;
  const progress = Math.min(1, Math.max(0, (window.innerHeight*.5 - r.top) / Math.max(1, r.height - window.innerHeight*.35)));
  const idx = Math.min(storySteps.length - 1, Math.floor(progress * storySteps.length));
  storySteps.forEach((s,i)=>s.classList.toggle('active', i===idx));
  storyPhone.src = `assets/screens/${storySteps[idx].dataset.img}`;
});

// Screen gallery
const galleries = {
  driver:['driver-empty.png','add-passenger.png','quantity.png','active-trip.png','end-trip.png','receipt.png','history.png','earnings.png'],
  admin:['admin-dashboard.png','admin-analytics.png','driver-stats.png','applications.png','exports.png'],
  applicant:['applicant-register.png','applicant-noapp.png','application-form.png','application-filled.png','upload-docs.png','app-status.png'],
  custom:['custom-form.png','custom-active.png','custom-end.png','custom-receipt.png','custom-banner.png']
};
function renderGallery(name='driver'){
  const g = $('#screenGallery');
  if(!g) return;
  g.innerHTML = galleries[name].map(img => `<div class="phone-shell"><img src="assets/screens/${img}" alt="TriFare ${name} screen"></div>`).join('');
}
renderGallery('driver');
$$('.screen-tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.screen-tabs button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    renderGallery(btn.dataset.gallery);
  });
});

// Fare calculator: ₱15 base for 3.75km + ₱0.40 per 100m = ₱4/km
const BASE_FARE = 15;
const BASE_DISTANCE_KM = 3.75;
const RATE_PER_100M = 0.40;
let selectedDiscount = 0;
function calculateFare(){
  const km = parseFloat($('#distance')?.value || 0);
  const excessKm = Math.max(0, km - BASE_DISTANCE_KM);
  const excessFare = (excessKm * 1000 / 100) * RATE_PER_100M;
  const gross = BASE_FARE + excessFare;
  const discount = gross * selectedDiscount;
  const finalFare = gross - discount;
  $('#distanceLabel').textContent = `${km.toFixed(2)} km`;
  $('#excessDistance').textContent = `${excessKm.toFixed(2)} km`;
  $('#excessFare').textContent = `₱${excessFare.toFixed(2)}`;
  $('#discountOutput').textContent = selectedDiscount ? `-₱${discount.toFixed(2)}` : '₱0.00';
  $('#fareOutput').textContent = `₱${finalFare.toFixed(2)}`;
}
$('#distance')?.addEventListener('input', calculateFare);
$$('#passengerOptions button').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('#passengerOptions button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    selectedDiscount = parseFloat(btn.dataset.discount || 0);
    calculateFare();
  });
});
calculateFare();

// Count up stats
let counted = false;
const statObserver = new IntersectionObserver(entries => {
  if(counted) return;
  if(entries.some(e=>e.isIntersecting)){
    counted = true;
    $$('.stat strong[data-count]').forEach(el => {
      const target = parseFloat(el.dataset.count);
      const isMoney = el.parentElement.textContent.includes('Revenue');
      const start = performance.now();
      function tick(now){
        const p = Math.min(1, (now-start)/1100);
        const v = target * (1 - Math.pow(1-p,3));
        el.textContent = isMoney ? `₱${v.toFixed(2)}` : (target % 1 ? v.toFixed(2) : Math.round(v));
        if(p<1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }
});
const stats = $('.stats-section');
if(stats) statObserver.observe(stats);


// Hero carousel: floating 3-phone preview with a sharp center phone
const heroSlides = [
  {
    img: 'active-trip.png',
    kicker: 'Driver Workflow',
    title: 'Start, track, and save trips.',
    desc: 'A clean fare meter interface for passenger handling, GPS tracking, and trip recording.'
  },
  {
    img: 'add-passenger.png',
    kicker: 'Passenger Types',
    title: 'Built-in passenger categories.',
    desc: 'Regular, Student, Senior Citizen, PWD, and Child fares are clearly presented before each trip.'
  },
  {
    img: 'custom-active.png',
    kicker: 'Custom Ride',
    title: 'Fixed negotiated fares.',
    desc: 'Custom / Exclusive Ride keeps agreed fares separate from automatic metered computation.'
  },
  {
    img: 'history.png',
    kicker: 'Trip Records',
    title: 'Every completed trip is recorded.',
    desc: 'Drivers can review completed trips while admins can use the same data for reports.'
  },
  {
    img: 'admin-dashboard.png',
    kicker: 'Admin Analytics',
    title: 'Operational visibility for TODA admins.',
    desc: 'Monitor trips, revenue, drivers, applications, and export-ready operational reports.'
  },
  {
    img: 'exports.png',
    kicker: 'Reports',
    title: 'Export reports in seconds.',
    desc: 'Generate CSV and PDF reports for revenue, drivers, and trip logs.'
  }
];

let heroSlideIndex = 0;
const heroImg = $('#heroCarouselImage');
const heroPrevImg = $('#heroCarouselPrev');
const heroNextImg = $('#heroCarouselNext');
const heroKicker = $('#carouselKicker');
const heroTitle = $('#carouselTitle');
const heroDesc = $('#carouselDesc');
const heroDots = $('#heroCarouselDots');
const heroStage = $('.floating-stage');

function slideAt(index) {
  return heroSlides[(index + heroSlides.length) % heroSlides.length];
}

function setHeroSlide(index) {
  if (!heroImg) return;
  heroSlideIndex = (index + heroSlides.length) % heroSlides.length;
  const prev = slideAt(heroSlideIndex - 1);
  const current = slideAt(heroSlideIndex);
  const next = slideAt(heroSlideIndex + 1);

  heroStage?.classList.add('is-switching');

  window.setTimeout(() => {
    if (heroPrevImg) {
      heroPrevImg.src = `assets/screens/${prev.img}`;
      heroPrevImg.alt = `Previous TriFare screen: ${prev.kicker}`;
    }
    heroImg.src = `assets/screens/${current.img}`;
    heroImg.alt = `TriFare ${current.kicker} screen`;
    if (heroNextImg) {
      heroNextImg.src = `assets/screens/${next.img}`;
      heroNextImg.alt = `Next TriFare screen: ${next.kicker}`;
    }

    if (heroKicker) heroKicker.textContent = current.kicker;
    if (heroTitle) heroTitle.textContent = current.title;
    if (heroDesc) heroDesc.textContent = current.desc;
    $$('.carousel-dots button').forEach((b, i) => b.classList.toggle('active', i === heroSlideIndex));
    heroStage?.classList.remove('is-switching');
  }, 90);
}

if (heroImg && heroDots) {
  heroDots.innerHTML = heroSlides.map((_, i) => `<button type="button" aria-label="Show slide ${i + 1}"></button>`).join('');
  $$('.carousel-dots button').forEach((dot, i) => dot.addEventListener('click', () => setHeroSlide(i)));
  $('.carousel-btn.prev')?.addEventListener('click', () => setHeroSlide(heroSlideIndex - 1));
  $('.carousel-btn.next')?.addEventListener('click', () => setHeroSlide(heroSlideIndex + 1));

  $$('.side-phone').forEach(phone => {
    phone.addEventListener('click', () => setHeroSlide(heroSlideIndex + Number(phone.dataset.shift || 0)));
  });

  setHeroSlide(0);
  window.setInterval(() => setHeroSlide(heroSlideIndex + 1), 6200);
}

// ============================================================
// Auto Version History (GitHub Releases API)
// Populates #changelogList with the live release feed from
// github.com/FukimoMikoto/trifare-releases. On any failure the
// existing static <li> markup already in index.html is left
// untouched, acting as a graceful fallback.
// ============================================================
const CHANGELOG_REPO = 'FukimoMikoto/trifare-releases';
const CHANGELOG_API = `https://api.github.com/repos/${CHANGELOG_REPO}/releases`;
const changelogList = $('#changelogList');

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

// Minimal markdown → HTML for release notes bodies (bullets, bold, paragraphs)
function formatReleaseBody(body) {
  if (!body || !body.trim()) return '<p>No release notes provided.</p>';
  const lines = escapeHtml(body.trim()).split('\n');
  let html = '', inList = false;
  lines.forEach(line => {
    const bullet = line.match(/^[-*]\s+(.*)/);
    if (bullet) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${bullet[1]}</li>`;
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      if (line.trim()) html += `<p>${line}</p>`;
    }
  });
  if (inList) html += '</ul>';
  return html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

function formatReleaseDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function renderChangelog(releases) {
  if (!changelogList) return;
  changelogList.innerHTML = releases.map((rel, i) => {
    const version = rel.tag_name || rel.name || 'Release';
    const title = rel.name && rel.name !== rel.tag_name ? rel.name : version;
    const assets = (rel.assets || []).filter(a => a.browser_download_url);
    const assetLinks = assets.length
      ? `<p class="changelog-assets">${assets.map(a =>
          `<a href="${a.browser_download_url}" target="_blank" rel="noopener">${escapeHtml(a.name)}</a>`
        ).join(' &middot; ')}</p>`
      : '';
    return `
      <li class="changelog-item${i === 0 ? ' latest' : ''}">
        <div class="changelog-meta">
          <span class="changelog-version">${escapeHtml(version)}</span>
          ${i === 0 ? '<span class="changelog-tag">Latest</span>' : ''}
          <span class="changelog-date">${formatReleaseDate(rel.published_at)}</span>
        </div>
        <h3>${escapeHtml(title)}</h3>
        ${formatReleaseBody(rel.body)}
        ${assetLinks}
      </li>`;
  }).join('');
}

async function loadChangelog() {
  if (!changelogList) return;
  try {
    const res = await fetch(CHANGELOG_API);
    if (!res.ok) throw new Error(`GitHub API responded ${res.status}`);
    const releases = (await res.json()).filter(r => !r.draft);
    if (!releases.length) throw new Error('No published releases found');
    renderChangelog(releases);
  } catch (err) {
    // Silent, graceful fallback: the static <li> items already
    // written in index.html remain exactly as-is.
    console.warn('Changelog: using static fallback —', err.message);
  }
}

loadChangelog();