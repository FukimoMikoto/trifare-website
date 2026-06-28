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


// Hero carousel: clean single-phone preview instead of blurred side devices
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
  }
];

let heroSlideIndex = 0;
const heroImg = $('#heroCarouselImage');
const heroPhone = $('.carousel-phone');
const heroKicker = $('#carouselKicker');
const heroTitle = $('#carouselTitle');
const heroDesc = $('#carouselDesc');
const heroDots = $('#heroCarouselDots');

function setHeroSlide(index) {
  if (!heroImg) return;
  heroSlideIndex = (index + heroSlides.length) % heroSlides.length;
  const slide = heroSlides[heroSlideIndex];
  heroPhone?.classList.add('switching');
  setTimeout(() => {
    heroImg.src = `assets/screens/${slide.img}`;
    heroImg.alt = `TriFare ${slide.kicker} screen`;
    if (heroKicker) heroKicker.textContent = slide.kicker;
    if (heroTitle) heroTitle.textContent = slide.title;
    if (heroDesc) heroDesc.textContent = slide.desc;
    $$('.carousel-dots button').forEach((b, i) => b.classList.toggle('active', i === heroSlideIndex));
    heroPhone?.classList.remove('switching');
  }, 120);
}

if (heroImg && heroDots) {
  heroDots.innerHTML = heroSlides.map((_, i) => `<button type="button" aria-label="Show slide ${i + 1}"></button>`).join('');
  $$('.carousel-dots button').forEach((dot, i) => dot.addEventListener('click', () => setHeroSlide(i)));
  $('.carousel-btn.prev')?.addEventListener('click', () => setHeroSlide(heroSlideIndex - 1));
  $('.carousel-btn.next')?.addEventListener('click', () => setHeroSlide(heroSlideIndex + 1));
  setHeroSlide(0);
  setInterval(() => setHeroSlide(heroSlideIndex + 1), 5200);
}
