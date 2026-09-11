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
