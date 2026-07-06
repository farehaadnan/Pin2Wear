// feed.js — dynamically renders pins from data/pins.json

const feed = document.getElementById('feed');
const pills = document.querySelectorAll('.pill');

let allPins = [];
let activeCategory = 'All';

// ── Load pins from JSON ──────────────────────────────────────────
fetch('pins.json')
  .then(res => res.json())
  .then(data => {
    allPins = data;
    renderFeed(allPins);
  })
  .catch(err => {
    console.error('Could not load pins.json:', err);
    feed.innerHTML = '<p style="color:#999; padding:20px;">Could not load feed.</p>';
  });


// ── Render feed ──────────────────────────────────────────────────
function renderFeed(pins) {
  feed.innerHTML = '';

  if (pins.length === 0) {
    feed.innerHTML = '<p style="color:#999; padding:20px;">No items found.</p>';
    return;
  }

  pins.forEach(pin => {
    const card = createCard(pin);
    feed.appendChild(card);
  });
}


// ── Build a single pin card ──────────────────────────────────────
function createCard(pin) {
  const div = document.createElement('div');
  div.className = 'pin';

  div.innerHTML = `
    <img src="${pin.image}" alt="${pin.label}" loading="lazy" />
    <div class="pin-overlay">
      <button class="pin-save" onclick="savePin(event, ${pin.id})">Save</button>
      <div class="pin-bottom">
        <span class="pin-title">${pin.label}</span>
        <a href="tryon.html?item=${encodeURIComponent(pin.image)}&label=${encodeURIComponent(pin.label)}&category=${encodeURIComponent(pin.category)}">
          <button class="pin-try">✨ Try on</button>
        </a>
      </div>
    </div>
    <div class="pin-info">
      <span class="pin-label">${pin.label}</span>
      <div class="pin-sub">${pin.sub}</div>
    </div>
  `;

  return div;
}


// ── Category filter ──────────────────────────────────────────────
pills.forEach(pill => {
  pill.addEventListener('click', () => {
    pills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');

    activeCategory = pill.textContent.trim();

    if (activeCategory === 'All') {
      renderFeed(allPins);
    } else {
      const filtered = allPins.filter(p => p.category === activeCategory);
      renderFeed(filtered);
    }
  });
});


// ── Save / heart a pin ───────────────────────────────────────────
function savePin(event, id) {
  event.preventDefault();
  event.stopPropagation();

  const btn = event.target;

  const isSaved = btn.classList.toggle('saved');
  btn.textContent = isSaved ? '✓ Saved' : 'Save';

  let saved = JSON.parse(localStorage.getItem('savedPins') || '[]');
  if (isSaved) {
    if (!saved.includes(id)) saved.push(id);
  } else {
    saved = saved.filter(s => s !== id);
  }
  localStorage.setItem('savedPins', JSON.stringify(saved));
}


// ── Restore saved state on load ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Runs after feed renders — handled inside renderFeed via re-check
});


// ── Search filter ────────────────────────────────────────────────
const searchInput = document.querySelector('.topbar input');

searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();

  if (query === '') {
    if (activeCategory === 'All') {
      renderFeed(allPins);
    } else {
      renderFeed(allPins.filter(p => p.category === activeCategory));
    }
    return;
  }

  const filtered = allPins.filter(p =>
    p.label.toLowerCase().includes(query) ||
    p.sub.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query)
  );

  renderFeed(filtered);
});