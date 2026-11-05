const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

// Header, barra de progreso y botón subir
const header = $('#header'), progress = $('#progress'), topBtn = $('#top');
window.addEventListener('scroll', () => {
    const y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (y / h) * 100 + '%';
    header.classList.toggle('scrolled', y > 10);
    topBtn.classList.toggle('show', y > 500);
});
topBtn.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });

// Menú móvil
$('#burger').onclick = () => $('#menu').classList.toggle('open');
$$('#menu a').forEach(a => a.onclick = () => $('#menu').classList.remove('open'));

// Revelado al hacer scroll
const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .15 });
$$('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 3) * 0.1 + 's'; io.observe(el); });

// Contadores animados
const co = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.count; let n = 0;
    const t = setInterval(() => { n += Math.max(1, Math.ceil(end / 40)); if (n >= end) { n = end; clearInterval(t); } el.textContent = n; }, 30);
    co.unobserve(el);
}));
$$('[data-count]').forEach(el => co.observe(el));

// Resalta enlace activo del menú
const links = $$('#menu a');
const so = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
$$('section[id]').forEach(s => so.observe(s));

// Calculadora de tiempo
const calc = () => {
    const m = +$('#min').value, c = +$('#cls').value, h = (m * 2 * c) / 60;
    $('#minV').textContent = m + ' min'; $('#clsV').textContent = c;
    $('#hrs').textContent = h.toFixed(1); $('#yr').textContent = Math.round(h * 48);
};
$('#min').oninput = calc; $('#cls').oninput = calc; calc();

// Pestañas de tecnología
$$('.tab').forEach(t => t.onclick = () => {
    $$('.tab').forEach(x => x.classList.remove('active'));
    $$('.panel').forEach(p => p.classList.remove('active'));
    t.classList.add('active'); $('#' + t.dataset.tab).classList.add('active');
});

// Acordeones
$$('.acc-b').forEach(b => b.onclick = () => {
    const p = b.nextElementSibling, open = b.classList.toggle('open');
    p.style.maxHeight = open ? p.scrollHeight + 'px' : 0;
});

// Carrusel de testimonios
const slides = $$('.slide'), dots = $('.dots'); let cur = 0, timer;
slides.forEach((_, i) => { const d = document.createElement('span'); d.onclick = () => { show(i); restart(); }; dots.appendChild(d); });
function show(i) {
    cur = i;
    slides.forEach((s, k) => s.classList.toggle('active', k === i));
    $$('span', dots).forEach((d, k) => d.classList.toggle('on', k === i));
}
function restart() { clearInterval(timer); timer = setInterval(() => show((cur + 1) % slides.length), 5000); }
show(0); restart();

// Formulario y alerta de éxito
const form = $('#regForm'), toast = $('#toast'), err = $('#error');
form.addEventListener('submit', e => {
    e.preventDefault();
    const n = $('#nombre'), c = $('#correo');
    const okMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.value.trim());
    [n, c].forEach(i => i.classList.remove('bad'));
    if (n.value.trim().length < 2) { n.classList.add('bad'); err.textContent = 'Ingresa tu nombre.'; return; }
    if (!okMail) { c.classList.add('bad'); err.textContent = 'Ingresa un correo válido.'; return; }
    err.textContent = '';
    $('#toastMsg').textContent = `Gracias, ${n.value.trim().split(' ')[0]}. Te escribiremos a ${c.value.trim()} con tu bono.`;
    addItem('cd_mails', { nombre: n.value.trim(), correo: c.value.trim(), fecha: new Date().toISOString() }); toast.classList.add('show'); form.reset();
    setTimeout(() => toast.classList.remove('show'), 5000);
});

// Métricas (guardadas en este navegador)
function load(k) { try { return JSON.parse(localStorage.getItem(k)) || [] } catch (e) { return [] } }
function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) { } }
function addItem(k, v) { const a = load(k); a.push(v); save(k, a); refresh() }
function refresh() {
    const v = load('cd_visits').length, m = load('cd_mails').length, f = load('cd_fb').length;
    $('#r-vis').textContent = v; $('#r-mail').textContent = m; $('#r-fb').textContent = f;
    $('#r-conv').textContent = (v ? Math.round(m / v * 100) : 0) + '%';
    $('#r-bar').style.width = Math.min(100, v * 10) + '%';
    $('#r-goal').textContent = v >= 10 ? '✅ Meta alcanzada: ' + v + ' personas.' : v + ' de 10 personas (meta mínima).';
}
try { if (!sessionStorage.getItem('cd_v')) { sessionStorage.setItem('cd_v', '1'); addItem('cd_visits', { fecha: new Date().toISOString() }) } } catch (e) { }
refresh();
$('#fbForm').addEventListener('submit', e => {
    e.preventDefault();
    const d = { pagaria: $('#f1').value, hoy: $('#f2').value, megusta: $('#f3').value.trim(), cambiaria: $('#f4').value.trim() };
    if (!d.pagaria || !d.hoy) { $('#fbErr').textContent = 'Responde al menos las dos primeras preguntas.'; return }
    $('#fbErr').textContent = ''; addItem('cd_fb', d); e.target.reset();
    $('#toastMsg').textContent = 'Gracias por tu feedback, nos ayuda a mejorar.';
    toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 4000);
});
$('#csv').onclick = () => {
    const r = load('cd_fb'), q = s => '"' + String(s).replace(/"/g, '""') + '"';
    const t = ['pagaria,hoy,megusta,cambiaria', ...r.map(x => [x.pagaria, x.hoy, x.megusta, x.cambiaria].map(q).join(','))].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([t], { type: 'text/csv' })); a.download = 'feedback.csv'; a.click();
};
$('#reset').onclick = () => { if (confirm('¿Reiniciar los contadores?')) { ['cd_visits', 'cd_mails', 'cd_fb'].forEach(k => save(k, [])); refresh() } };
// Compartir
const U = $('#url').textContent, msg = encodeURIComponent('Estoy validando Cycle Drop Express, entregas de barrio en bici. ¿Me das tu opinión? ' + U);
$('#shWa').href = 'https://wa.me/?text=' + msg;
$('#shLi').href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(U);
$('#copy').onclick = () => { try { navigator.clipboard.writeText(U) } catch (e) { } $('#copy').innerHTML = '<i class="fa-solid fa-check"></i> Copiado'; setTimeout(() => $('#copy').innerHTML = '<i class="fa-solid fa-copy"></i> Copiar', 2000) };