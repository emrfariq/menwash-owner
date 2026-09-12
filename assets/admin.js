/* =========================================================
   MENWASH ADMIN — shared interactions
   ========================================================= */

function openEl(id){ const el = document.getElementById(id); if(el){ el.classList.add('show'); } }
function closeEl(id){ const el = document.getElementById(id); if(el){ el.classList.remove('show'); } }

function showToast(msg){
  const t = document.getElementById('toast');
  if(!t) return;
  t.querySelector('span').textContent = msg;
  t.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=> t.classList.remove('show'), 3200);
}

function tickClock(){
  const el = document.getElementById('liveClock');
  if(!el) return;
  const d = new Date();
  const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const hh = String(d.getHours()).padStart(2,'0');
  const mm = String(d.getMinutes()).padStart(2,'0');
  const ss = String(d.getSeconds()).padStart(2,'0');
  el.querySelector('b').textContent = `${hh}:${mm}:${ss}`;
  el.querySelector('span').textContent = days[d.getDay()] + ', hari ini';
}
setInterval(tickClock, 1000);
document.addEventListener('DOMContentLoaded', tickClock);

/* Segmented pill selector generik (data-group) */
document.addEventListener('click', (e)=>{
  const seg = e.target.closest('.seg');
  if(!seg) return;
  const group = seg.dataset.group;
  document.querySelectorAll(`.seg[data-group="${group}"]`).forEach(s=> s.classList.remove('active'));
  seg.classList.add('active');
  if(typeof window.onSegChange === 'function') window.onSegChange(group, seg.dataset.value);
});

/* Wizard step generik: showStep('qa', 2) akan menampilkan #qa-step2 saja
   dari sekumpulan elemen berid qa-step1, qa-step2, dst. */
function showStep(prefix, n){
  document.querySelectorAll(`[id^="${prefix}-step"]`).forEach(el=>{
    el.style.display = (el.id === `${prefix}-step${n}`) ? 'block' : 'none';
  });
}

/* Mensimulasikan pola async nyata di balik layar:
   202 Accepted (perintah diterima) -> Worker publish ke MQTT -> ACK dari
   device -> polling/SSE Admin UI -> status akhir. Dipakai di seluruh aksi
   yang mengirim command ke mesin (aktivasi, force stop, dummy restart)
   supaya UI tidak seolah "instan". */
function simulateAsyncCommand(onDone, ms){
  setTimeout(onDone, ms || 1300);
}

document.addEventListener('click', (e)=>{
  if(e.target.classList.contains('overlay') || e.target.classList.contains('modal-overlay')){
    e.target.classList.remove('show');
  }
});

/* Filter Status Mesin pada Halaman Mesin (mesin.html) */
function filterMachines(status, el) {
  if (el) {
    const parent = el.closest('.chip-row');
    if (parent) {
      parent.querySelectorAll('.fchip').forEach(c => c.classList.remove('active'));
    }
    el.classList.add('active');
  }
  const cards = document.querySelectorAll('.m-card');
  cards.forEach(card => {
    if (status === 'semua' || card.dataset.status === status) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

/* Filter Siklus pada Halaman Progress (progress.html) */
function filterCycles(type, el) {
  if (el) {
    const parent = el.closest('.chip-row');
    if (parent) {
      parent.querySelectorAll('.fchip').forEach(c => c.classList.remove('active'));
    }
    el.classList.add('active');
  }
  const rows = document.querySelectorAll('.cycle-row');
  rows.forEach(row => {
    const layanan = (row.dataset.layanan || '').toLowerCase();
    const status = (row.dataset.status || '').toLowerCase();
    let match = false;
    if (type === 'semua') match = true;
    else if (type === 'cuci') match = layanan.includes('cuci saja');
    else if (type === 'kering') match = layanan.includes('kering saja');
    else if (type === 'kombo') match = layanan.includes('kombo') || layanan.includes('cuci + kering') || (row.dataset.combo && row.dataset.combo !== '');
    else if (type === 'gangguan') match = status === 'err' || status === 'gagal';

    row.style.display = match ? 'flex' : 'none';
  });
}

/* Update Grafik Tren Transaksi Multi-Periode pada Dashboard */
const chartDatasets = {
  jam: {
    title: 'Tren Transaksi per Jam',
    sub: 'Pola QRIS & Tunai sepanjang hari ini (07.00–21.00)',
    qrisLegend: '34',
    tunaiLegend: '14',
    qrisPolyline: '40,132.5 81.4,95 122.9,57.5 164.3,20 205.7,57.5 247.1,95 288.6,57.5 330,20 371.4,57.5 412.9,95 454.3,57.5 495.7,95 537.1,132.5 578.6,132.5 620,170',
    tunaiPolyline: '40,170 81.4,132.5 122.9,132.5 164.3,95 205.7,132.5 247.1,132.5 288.6,132.5 330,95 371.4,132.5 412.9,132.5 454.3,132.5 495.7,132.5 537.1,170 578.6,132.5 620,170',
    labels: ['07','09','11','13','15','17','19','21']
  },
  minggu: {
    title: 'Tren Transaksi per Minggu',
    sub: 'Total transaksi QRIS & Tunai minggu ini (Senin–Minggu)',
    qrisLegend: '210',
    tunaiLegend: '85',
    qrisPolyline: '40,140 122.9,90 205.7,60 288.6,30 371.4,45 454.3,20 620,50',
    tunaiPolyline: '40,165 122.9,140 205.7,120 288.6,100 371.4,110 454.3,85 620,115',
    labels: ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu']
  },
  bulan: {
    title: 'Tren Transaksi per Bulan',
    sub: 'Performa transaksi bulanan (Minggu 1 – Minggu 4)',
    qrisLegend: '890',
    tunaiLegend: '340',
    qrisPolyline: '40,130 205.7,75 371.4,40 620,20',
    tunaiPolyline: '40,160 205.7,130 371.4,100 620,90',
    labels: ['Mgg 1','Mgg 2','Mgg 3','Mgg 4']
  },
  tahun: {
    title: 'Tren Transaksi per Tahun',
    sub: 'Rekapitulasi tahunan per bulan (Jan–Des)',
    qrisLegend: '10.400',
    tunaiLegend: '4.100',
    qrisPolyline: '40,150 122.9,120 205.7,90 288.6,70 371.4,40 454.3,25 620,15',
    tunaiPolyline: '40,170 122.9,150 205.7,130 288.6,110 371.4,95 454.3,80 620,70',
    labels: ['Q1 (Jan-Mar)','Q2 (Apr-Jun)','Q3 (Jul-Sep)','Q4 (Okt-Des)']
  }
};

function setChartPeriod(period, el) {
  if (el) {
    const parent = el.closest('.chip-row');
    if (parent) {
      parent.querySelectorAll('.fchip').forEach(c => c.classList.remove('active'));
    }
    el.classList.add('active');
  }

  const data = chartDatasets[period];
  if (!data) return;

  const chartCard = document.getElementById('trendChartCard');
  if (!chartCard) return;

  const titleEl = chartCard.querySelector('.card-head h3');
  const subEl = chartCard.querySelector('.card-head p');
  if (titleEl) titleEl.textContent = data.title;
  if (subEl) subEl.textContent = data.sub;

  const qrisLeg = chartCard.querySelector('.lg-item-qris b');
  const tunaiLeg = chartCard.querySelector('.lg-item-tunai b');
  if (qrisLeg) qrisLeg.textContent = data.qrisLegend;
  if (tunaiLeg) tunaiLeg.textContent = data.tunaiLegend;

  const qrisLine = chartCard.querySelector('.polyline-qris');
  const tunaiLine = chartCard.querySelector('.polyline-tunai');
  if (qrisLine) qrisLine.setAttribute('points', data.qrisPolyline);
  if (tunaiLine) tunaiLine.setAttribute('points', data.tunaiPolyline);

  showToast(`Grafik diperbarui: Periode ${period.toUpperCase()}`);
}

