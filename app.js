/* ================================================================
   LogiTrack — app.js
   Supabase CRUD · Rate Card Math · Owner Dashboard · Chart.js
   ================================================================ */

/* ================================================================
   RATE CARD  (unchanged — do not alter without owner sign-off)
   ================================================================ */
const DIST_BANDS = [5, 10, 20, 30, 40, 50, 60, 70, 80, 100, 120, 150];

const LIGHT_BANDS = [
  { maxKg: 20, rates: [198, 198, 198, 216, 338, 400, 450, 495, 540, 563, 585, 607] },
  { maxKg: 40, rates: [243, 243, 243, 252, 374, 437, 486, 531, 576, 598, 620, 644] },
  { maxKg: 100, rates: [288, 288, 288, 306, 410, 472, 522, 567, 612, 635, 657, 679] },
  { maxKg: 400, rates: [324, 324, 324, 333, 445, 509, 558, 603, 648, 670, 692, 716] },
  { maxKg: 600, rates: [330, 339, 345, 367, 465, 524, 573, 616, 666, 713, 737, 760] },
  { maxKg: 800, rates: [343, 369, 385, 434, 504, 556, 602, 641, 700, 799, 824, 848] },
  { maxKg: 999, rates: [360, 406, 447, 536, 563, 604, 644, 680, 752, 899, 946, 981] },
];

const HEAVY_PER_TON_RATES = [412, 495, 528, 626, 655, 698, 742, 781, 858, 1047, 1076, 1105];
const OTO_PER_TON_RATES = [250, 333, 366, 432, 536, 565, 582, 615, 681, 811, 831, 873];

const LONG_DISTANCE_THRESHOLD = 150; // km
const LONG_DISTANCE_RATE = 23;       // R per km

// Payout markdown (e.g. 15% VAT deduction). Set to 0 for full rate.
const PAYOUT_MARKDOWN_PCT = 15;
const PAYOUT_MARKDOWN_MULT = 1 - (PAYOUT_MARKDOWN_PCT / 100); // → 0.85

function getDistIndex(km) {
  for (let i = 0; i < DIST_BANDS.length; i++) {
    if (km <= DIST_BANDS[i]) return i;
  }
  return DIST_BANDS.length - 1;
}

function isLongDistance(distKm) {
  return distKm > LONG_DISTANCE_THRESHOLD;
}

function calcPayoutValue(type, distKm, weightKg) {
  if (!distKm || !weightKg || !type) return 0;

  let raw = 0;

  // Long Distance overrides all rate card logic (any type > 150km)
  if (isLongDistance(distKm)) {
    raw = distKm * LONG_DISTANCE_RATE;
  } else {
    const di = getDistIndex(distKm);

    if (type === 'OTO') {
      raw = OTO_PER_TON_RATES[di] * (weightKg / 1000);
    } else if (weightKg > 999) {
      raw = HEAVY_PER_TON_RATES[di] * (weightKg / 1000);
    } else {
      for (const band of LIGHT_BANDS) {
        if (weightKg <= band.maxKg) { raw = band.rates[di]; break; }
      }
      if (!raw) raw = LIGHT_BANDS[LIGHT_BANDS.length - 1].rates[di];
    }
  }

  return +(raw * PAYOUT_MARKDOWN_MULT).toFixed(2);
}

/* ================================================================
   STATE & CONFIG
   ================================================================ */
let db = null;                 // Supabase client (kept off the global `supabase` lib var)
const state = { trips: [], expenses: [], ranges: [] };

const SB_URL = 'https://tudketxkenqxaqqrxuce.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1ZGtldHhrZW5xeGFxcXJ4dWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4Nzk0NTQsImV4cCI6MjA5NTQ1NTQ1NH0.r8JjNVhzMHPd1yd1MSCOemk2NYeyTcaTh0Tnpqg6TJ8';

/* ================================================================
   INIT
   ================================================================ */
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('sb-url').value = SB_URL;
  document.getElementById('sb-key').value = SB_KEY;
  setupChartDefaults();
  setupTabs();
  setTodayDate();
  initSupabase(SB_URL, SB_KEY);

  // Allow Enter key to submit login
  ['login-email', 'login-password'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') signIn();
    });
  });
});

async function initSupabase(url, key) {
  try {
    db = window.supabase.createClient(url, key);

    // Handle future sign-in / sign-out events
    db.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') { showApp(); loadAll(); }
      if (event === 'SIGNED_OUT') { showLogin(); }
    });

    // Check for an existing session on load
    const { data: { session } } = await db.auth.getSession();
    if (session) {
      showApp();
      await loadAll();
      setConnUI(true, 'Connected');
      document.getElementById('setup-banner').classList.add('hidden');
    } else {
      showLogin();
    }
  } catch (e) {
    console.error('Supabase init exception:', e);
    setConnUI(false, 'Disconnected');
    showLogin();
  }
}

async function signIn() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  const btn = document.getElementById('login-btn');

  if (!email || !password) {
    errEl.textContent = 'Please enter your email and password.';
    return;
  }

  btn.textContent = 'Signing in…';
  btn.disabled = true;
  errEl.textContent = '';

  const { error } = await db.auth.signInWithPassword({ email, password });

  if (error) {
    errEl.textContent = error.message;
    btn.textContent = 'Sign In';
    btn.disabled = false;
  }
  // On success, onAuthStateChange → SIGNED_IN handles the rest
}

async function signOut() {
  await db.auth.signOut();
  // onAuthStateChange → SIGNED_OUT handles the rest
}

function showApp() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('main-app').style.display = '';
}

function showLogin() {
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('main-app').style.display = 'none';
  document.getElementById('login-error').textContent = '';
  document.getElementById('login-password').value = '';
  const btn = document.getElementById('login-btn');
  btn.textContent = 'Sign In';
  btn.disabled = false;
}

function setConnUI(connected, text) {
  const dot = document.getElementById('db-dot');
  const txt = document.getElementById('db-status-text');
  dot.classList.toggle('connected', connected);
  txt.textContent = text;
}

function saveConfig() {
  const url = document.getElementById('sb-url').value.trim();
  const key = document.getElementById('sb-key').value.trim();
  if (!url || !key) { toast('Enter both URL and Key', 'error'); return; }
  document.getElementById('setup-modal').classList.remove('open');
  initSupabase(url, key);
}

/* ================================================================
   LOAD ALL  (single source of truth, then render everything)
   ================================================================ */
async function loadAll() {
  if (!db) return;

  const [tripsRes, expRes] = await Promise.all([
    db.from('trips').select('*').order('trip_date', { ascending: false }),
    db.from('expenses').select('*').order('expense_date', { ascending: false }),
  ]);

  if (tripsRes.error) { toast('Trips load error: ' + tripsRes.error.message, 'error'); return; }
  if (expRes.error) { console.error('expenses load error', expRes.error); }

  state.trips = tripsRes.data || [];
  state.expenses = expRes.data || [];

  renderDashboard();
  loadTrips();
  loadExpenses();
  loadSavedRanges();
}

/* ================================================================
   DASHBOARD — filtering, KPIs, charts
   ================================================================ */
function currentFilter() {
  return {
    start: document.getElementById('filter-start').value || '',
    end: document.getElementById('filter-end').value || '',
    type: document.getElementById('filter-type').value || '',
    status: document.getElementById('filter-status').value || '',
  };
}

function getFiltered() {
  const f = currentFilter();
  const inRange = (d) => (!f.start || d >= f.start) && (!f.end || d <= f.end);

  const trips = state.trips.filter(t =>
    inRange(t.trip_date) &&
    (!f.type || t.trip_type === f.type) &&
    (!f.status || t.status === f.status)
  );
  const expenses = state.expenses.filter(e => inRange(e.expense_date));

  const scoped = !!(f.start || f.end || f.type || f.status);
  return { trips, expenses, scoped, f };
}

function applyFilters() {
  renderDashboard();
}

function clearFilters() {
  ['filter-start', 'filter-end', 'filter-type', 'filter-status'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  renderDashboard();
}

function renderDashboard() {
  const { trips, expenses, scoped, f } = getFiltered();

  const income = sum(trips, t => t.payout);
  const expTotal = sum(expenses, e => e.amount);
  const net = income - expTotal;
  const margin = income > 0 ? (net / income) * 100 : 0;

  // scope label
  let scopeText = '(All Time)';
  if (scoped) {
    if (f.start && f.end) scopeText = `(${f.start} → ${f.end})`;
    else if (f.start) scopeText = `(from ${f.start})`;
    else if (f.end) scopeText = `(until ${f.end})`;
    else scopeText = '(Filtered)';
  }
  setText('kpi-scope', scopeText);

  // Financial KPIs
  setText('m-income', money(income));
  setText('m-income-sub', `${trips.length} trip${trips.length !== 1 ? 's' : ''}`);
  setText('m-expenses', money(expTotal));
  setText('m-net', money(net));
  setText('m-margin', `${margin.toFixed(1)}% margin`);
  setText('m-trips', trips.length);
  setText('m-avg-payout', `avg ${money(trips.length ? income / trips.length : 0)} / trip`);

  // This month (always current calendar month, full dataset)
  const mo = new Date().toISOString().slice(0, 7);
  const moIncome = sum(state.trips.filter(t => (t.trip_date || '').startsWith(mo)), t => t.payout);
  const moExp = sum(state.expenses.filter(e => (e.expense_date || '').startsWith(mo)), e => e.amount);
  setText('m-month-net', money(moIncome - moExp));
  setText('m-month-sub', `${money(moIncome)} in · ${money(moExp)} out`);

  // Trip breakdown
  setText('m-deliveries', trips.filter(t => t.trip_type === 'Delivery').length);
  setText('m-otos', trips.filter(t => t.trip_type === 'OTO').length);
  setText('m-mrts', trips.filter(t => t.trip_type === 'MrT').length);
  setText('m-longdist', trips.filter(t => isLongDistance(t.distance_km || 0)).length);
  setText('m-online', trips.filter(t => t.status === 'Online').length);
  setText('m-manual', trips.filter(t => t.status === 'Manual').length);

  // Charts
  buildIncomeExpenseChart(trips, expenses);
  buildProjectionChart(trips, expenses);
  buildExpenseCatChart(expenses);
  buildTripTypesChart(trips);
  buildDistanceChart(trips);
}

/* ================================================================
   CHARTS
   ================================================================ */
const charts = {};
const GRID = '#eef2f7';        // light grid lines
const DOUGHNUT_BORDER = '#ffffff';
const COL = {
  income: 'rgba(22,160,106,.85)',
  incomeLine: '#16a06a',
  expense: 'rgba(229,96,75,.85)',
  expenseLine: '#e5604b',
  net: '#3b6cf6',
  delivery: 'rgba(59,130,246,.85)',
  oto: 'rgba(224,151,43,.9)',
  mrt: 'rgba(229,96,75,.85)',
  local: 'rgba(59,130,246,.85)',
  long: 'rgba(224,151,43,.9)',
  fuel: 'rgba(224,151,43,.9)',
  breakages: 'rgba(229,96,75,.85)',
  repairs: 'rgba(59,130,246,.85)',
  other: 'rgba(154,167,184,.85)',
};

function setupChartDefaults() {
  if (!window.Chart) return;
  Chart.defaults.color = '#5e6b7e';
  Chart.defaults.font.family = 'Inter';
  Chart.defaults.font.size = 11;
}

// month key (YYYY-MM) → "Apr '25"
function monthLabel(key) {
  if (!key || key.length < 7) return key || '—';
  const [y, m] = key.split('-');
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${names[(+m) - 1] || m} '${y.slice(2)}`;
}

function nextMonthKey(key) {
  let [y, m] = key.split('-').map(Number);
  m += 1;
  if (m > 12) { m = 1; y += 1; }
  return `${y}-${String(m).padStart(2, '0')}`;
}

// Group income & expenses by month → { key: {income, expenses} }
function groupByMonth(trips, expenses) {
  const map = {};
  const ensure = k => (map[k] ||= { income: 0, expenses: 0 });
  trips.forEach(t => { ensure((t.trip_date || '').slice(0, 7)).income += num(t.payout); });
  expenses.forEach(e => { ensure((e.expense_date || '').slice(0, 7)).expenses += num(e.amount); });
  delete map[''];
  return map;
}

function destroy(name) {
  if (charts[name]) { charts[name].destroy(); charts[name] = null; }
}

const moneyTick = v => 'R ' + Number(v).toLocaleString('en-ZA');
const moneyTip = ctx => `${ctx.dataset.label}: ${money(ctx.parsed.y ?? ctx.parsed)}`;

function buildIncomeExpenseChart(trips, expenses) {
  const map = groupByMonth(trips, expenses);
  const labels = Object.keys(map).sort();
  const inc = labels.map(l => round2(map[l].income));
  const exp = labels.map(l => round2(map[l].expenses));
  const net = labels.map(l => round2(map[l].income - map[l].expenses));

  destroy('incExp');
  charts.incExp = new Chart(document.getElementById('chart-income-expense'), {
    type: 'bar',
    data: {
      labels: labels.map(monthLabel),
      datasets: [
        { label: 'Income', data: inc, backgroundColor: COL.income, borderRadius: 4, order: 2 },
        { label: 'Expenses', data: exp, backgroundColor: COL.expense, borderRadius: 4, order: 2 },
        { label: 'Net', data: net, type: 'line', borderColor: COL.net, backgroundColor: COL.net, tension: .3, borderWidth: 2, pointRadius: 3, order: 1 },
      ]
    },
    options: baseOptions({ money: true, legend: true })
  });
}

function buildProjectionChart(trips, expenses) {
  const map = groupByMonth(trips, expenses);
  const keys = Object.keys(map).sort();

  destroy('proj');
  const canvas = document.getElementById('chart-projection');

  if (keys.length < 1) {
    charts.proj = emptyChart(canvas, 'Add trips to see a projection');
    return;
  }

  const incomeHist = keys.map(k => round2(map[k].income));
  const expenseHist = keys.map(k => round2(map[k].expenses));

  const AHEAD = 3;
  const futureKeys = [];
  let last = keys[keys.length - 1];
  for (let i = 0; i < AHEAD; i++) { last = nextMonthKey(last); futureKeys.push(last); }
  const allKeys = [...keys, ...futureKeys];
  const n = keys.length;
  const lastIdx = n - 1;

  const incForecast = project(incomeHist, AHEAD);
  const expForecast = project(expenseHist, AHEAD);

  // actual datasets: values for history, null for future
  const incActual = [...incomeHist, ...Array(AHEAD).fill(null)];
  const expActual = [...expenseHist, ...Array(AHEAD).fill(null)];

  // projected datasets: null until last actual point (so dashed line connects), then forecast
  const incProj = allKeys.map((_, i) =>
    i < lastIdx ? null : (i === lastIdx ? incomeHist[lastIdx] : round2(incForecast[i - n])));
  const expProj = allKeys.map((_, i) =>
    i < lastIdx ? null : (i === lastIdx ? expenseHist[lastIdx] : round2(expForecast[i - n])));

  charts.proj = new Chart(canvas, {
    type: 'line',
    data: {
      labels: allKeys.map(monthLabel),
      datasets: [
        { label: 'Income', data: incActual, borderColor: COL.incomeLine, backgroundColor: 'transparent', tension: .3, borderWidth: 2, pointRadius: 3 },
        { label: 'Income (forecast)', data: incProj, borderColor: COL.incomeLine, borderDash: [5, 4], backgroundColor: 'transparent', tension: .3, borderWidth: 2, pointRadius: 2, pointStyle: 'rectRot' },
        { label: 'Expenses', data: expActual, borderColor: COL.expenseLine, backgroundColor: 'transparent', tension: .3, borderWidth: 2, pointRadius: 3 },
        { label: 'Expenses (forecast)', data: expProj, borderColor: COL.expenseLine, borderDash: [5, 4], backgroundColor: 'transparent', tension: .3, borderWidth: 2, pointRadius: 2, pointStyle: 'rectRot' },
      ]
    },
    options: baseOptions({ money: true, legend: true, spanGaps: false })
  });
}

function buildExpenseCatChart(expenses) {
  const cats = ['Fuel', 'Breakages', 'Repairs', 'Other'];
  const colByCat = { Fuel: COL.fuel, Breakages: COL.breakages, Repairs: COL.repairs, Other: COL.other };
  const totals = cats.map(c => round2(sum(expenses.filter(e => e.category === c), e => e.amount)));

  const labels = [], data = [], colors = [];
  cats.forEach((c, i) => { if (totals[i] > 0) { labels.push(c); data.push(totals[i]); colors.push(colByCat[c]); } });

  destroy('expCat');
  const canvas = document.getElementById('chart-expense-cat');
  if (!data.length) { charts.expCat = emptyChart(canvas, 'No expenses in range'); return; }

  charts.expCat = new Chart(canvas, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: DOUGHNUT_BORDER, borderWidth: 2 }] },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '58%',
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12 } },
        tooltip: { callbacks: { label: ctx => `${ctx.label}: ${money(ctx.parsed)}` } }
      }
    }
  });
}

function buildTripTypesChart(trips) {
  const types = ['Delivery', 'OTO', 'MrT'];
  const colByType = { Delivery: COL.delivery, OTO: COL.oto, MrT: COL.mrt };
  const byMonth = {};
  trips.forEach(t => {
    const k = (t.trip_date || '').slice(0, 7);
    if (!k) return;
    byMonth[k] ||= { Delivery: 0, OTO: 0, MrT: 0 };
    if (byMonth[k][t.trip_type] !== undefined) byMonth[k][t.trip_type] += 1;
  });
  const labels = Object.keys(byMonth).sort();

  destroy('tripTypes');
  const canvas = document.getElementById('chart-trip-types');
  if (!labels.length) { charts.tripTypes = emptyChart(canvas, 'No trips in range'); return; }

  charts.tripTypes = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels.map(monthLabel),
      datasets: types.map(ty => ({
        label: ty,
        data: labels.map(l => byMonth[l][ty]),
        backgroundColor: colByType[ty],
        borderRadius: 3,
        stack: 'trips',
      }))
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12 } } },
      scales: {
        x: { stacked: true, grid: { color: GRID } },
        y: { stacked: true, beginAtZero: true, ticks: { precision: 0 }, grid: { color: GRID } }
      }
    }
  });
}

function buildDistanceChart(trips) {
  let localInc = 0, longInc = 0, localN = 0, longN = 0;
  trips.forEach(t => {
    if (isLongDistance(t.distance_km || 0)) { longInc += num(t.payout); longN++; }
    else { localInc += num(t.payout); localN++; }
  });

  destroy('dist');
  const canvas = document.getElementById('chart-distance');
  if (!trips.length) { charts.dist = emptyChart(canvas, 'No trips in range'); return; }

  charts.dist = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: [`Local (${localN})`, `Long Distance (${longN})`],
      datasets: [{ data: [round2(localInc), round2(longInc)], backgroundColor: [COL.local, COL.long], borderColor: DOUGHNUT_BORDER, borderWidth: 2 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '58%',
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12 } },
        tooltip: { callbacks: { label: ctx => `${ctx.label}: ${money(ctx.parsed)}` } }
      }
    }
  });
}

function baseOptions({ money: isMoney, legend, spanGaps } = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    spanGaps: spanGaps ?? true,
    plugins: {
      legend: { display: legend !== false, position: 'bottom', labels: { boxWidth: 12, padding: 12 } },
      tooltip: { callbacks: isMoney ? { label: moneyTip } : {} }
    },
    scales: {
      x: { grid: { color: GRID } },
      y: { beginAtZero: true, grid: { color: GRID }, ticks: isMoney ? { callback: moneyTick } : {} }
    }
  };
}

function emptyChart(canvas, msg) {
  return new Chart(canvas, {
    type: 'doughnut',
    data: { labels: [msg], datasets: [{ data: [1], backgroundColor: [GRID], borderWidth: 0 }] },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '70%',
      plugins: { legend: { display: false }, tooltip: { enabled: false } }
    }
  });
}

/* Least-squares linear forecast. Returns array of `ahead` projected values (>=0). */
function project(values, ahead) {
  const n = values.length;
  if (n === 0) return Array(ahead).fill(0);
  if (n === 1) return Array(ahead).fill(Math.max(0, values[0]));

  let sx = 0, sy = 0, sxy = 0, sxx = 0;
  for (let i = 0; i < n; i++) { sx += i; sy += values[i]; sxy += i * values[i]; sxx += i * i; }
  const denom = (n * sxx - sx * sx) || 1;
  const slope = (n * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / n;

  const out = [];
  for (let i = 0; i < ahead; i++) out.push(Math.max(0, slope * (n + i) + intercept));
  return out;
}

/* ================================================================
   ADD TRIP
   ================================================================ */
function calcPayout() {
  const type = document.getElementById('f-type').value;
  const dist = parseFloat(document.getElementById('f-distance').value) || 0;
  const weight = parseFloat(document.getElementById('f-weight').value) || 0;
  const payout = calcPayoutValue(type, dist, weight);
  document.getElementById('f-payout').value = payout > 0 ? 'R ' + payout.toFixed(2) : '';

  const badge = document.getElementById('f-longdist-badge');
  const ldText = document.getElementById('ld-text');
  if (badge && ldText) {
    const ld = isLongDistance(dist);
    badge.classList.toggle('active', ld);
    ldText.textContent = ld ? '✓ Active — R23/km' : 'Inactive (≤150km)';
  }
  return payout;
}

function onTypeChange() { calcPayout(); }

async function submitTrip() {
  if (!db) { toast('Not connected to Supabase', 'error'); return; }

  const type = document.getElementById('f-type').value;
  const status = document.getElementById('f-status').value;
  const date = document.getElementById('f-date').value;
  const dist = parseFloat(document.getElementById('f-distance').value) || 0;
  const weight = parseFloat(document.getElementById('f-weight').value) || 0;

  if (!type || !status || !date || !dist || !weight) {
    toast('Fill in all required fields (*)', 'error'); return;
  }

  const payout = calcPayout();
  const tripData = {
    trip_date: date,
    trip_type: type,
    status: status,
    invoice_number: val('f-invoice') || null,
    trip_id: val('f-tripid') || null,
    distance_km: dist,
    weight_kg: weight,
    payout: payout,
    grouped_invoices: val('f-ginvoices') || null,
    grouped_trip_ids: val('f-gtripids') || null,
    notes: val('f-notes') || null,
  };

  const { error } = await db.from('trips').insert([tripData]);
  if (error) { toast('Error saving trip: ' + error.message, 'error'); return; }

  toast('Trip saved! Payout: ' + money(payout), 'success');
  resetForm();
  await loadAll();
  switchTab('dashboard');
}

function resetForm() {
  ['f-type', 'f-status', 'f-invoice', 'f-tripid', 'f-distance', 'f-weight',
    'f-payout', 'f-ginvoices', 'f-gtripids', 'f-notes'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  setTodayDate();
  calcPayout();
}

function setTodayDate() {
  const el = document.getElementById('f-date');
  if (el) el.value = new Date().toISOString().split('T')[0];
}

/* ================================================================
   TRIPS TABLE
   ================================================================ */
async function loadTrips() {
  if (!db) return;
  const { data, error } = await db.from('trips').select('*').order('trip_date', { ascending: false });
  if (error) { toast('Trips load error: ' + error.message, 'error'); return; }
  state.trips = data || [];
  renderTripsTable(state.trips);
}

function renderTripsTable(trips) {
  const tbody = document.getElementById('trips-tbody');
  document.getElementById('trips-count').textContent =
    `${trips.length} trip${trips.length !== 1 ? 's' : ''}`;

  if (!trips.length) {
    tbody.innerHTML = `<tr><td colspan="10"><div class="empty-state"><div class="icon">📋</div><p>No trips found.</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = trips.map(t => {
    const ld = isLongDistance(t.distance_km || 0);
    const ldBadge = ld
      ? `<span class="badge badge-longdist">🛣 Long Dist</span>`
      : `<span style="color:var(--border);font-size:.7rem;">—</span>`;
    const grouped = [
      t.grouped_invoices ? `<span style="color:var(--text-dim);font-size:.7rem;">INV: ${esc(t.grouped_invoices)}</span>` : '',
      t.grouped_trip_ids ? `<span style="color:var(--text-dim);font-size:.7rem;">IDs: ${esc(t.grouped_trip_ids)}</span>` : '',
    ].filter(Boolean).join('<br>');
    return `
    <tr id="row-${t.id}"${ld ? ' class="row-longdist"' : ''}>
      <td data-label="Date"><input type="date" value="${t.trip_date}" onchange="updateTripField('${t.id}','trip_date',this.value)"></td>
      <td data-label="Type">
        <select onchange="updateTripField('${t.id}','trip_type',this.value)">
          ${['Delivery', 'OTO', 'MrT'].map(v => `<option${v === t.trip_type ? ' selected' : ''}>${v}</option>`).join('')}
        </select>
      </td>
      <td data-label="Status">
        <select onchange="updateTripField('${t.id}','status',this.value)">
          ${['Online', 'Manual'].map(v => `<option${v === t.status ? ' selected' : ''}>${v}</option>`).join('')}
        </select>
      </td>
      <td data-label="Invoice">
        <div style="font-size:.78rem">${esc(t.invoice_number) || '—'}</div>
        ${grouped ? `<div style="margin-top:3px;line-height:1.6">${grouped}</div>` : ''}
      </td>
      <td data-label="Trip ID"><input type="text" value="${esc(t.trip_id) || ''}" placeholder="—" onchange="updateTripField('${t.id}','trip_id',this.value)"></td>
      <td data-label="Distance (km)"><input type="number" value="${t.distance_km}" step="0.1" onchange="updateTripField('${t.id}','distance_km',this.value)"></td>
      <td data-label="Weight (kg)"><input type="number" value="${t.weight_kg}" step="0.1" onchange="updateTripField('${t.id}','weight_kg',this.value)"></td>
      <td data-label="Long Dist">${ldBadge}</td>
      <td data-label="Payout" class="payout-cell">${money(t.payout)}</td>
      <td class="cell-actions"><button class="btn btn-danger" style="padding:4px 10px;font-size:.68rem;" onclick="deleteTrip('${t.id}')">Delete</button></td>
    </tr>`;
  }).join('');
}

async function updateTripField(tripId, field, value) {
  if (!db) return;

  const payload = { [field]: value };

  // Re-calculate payout when distance/weight/type changes
  if (field === 'distance_km' || field === 'weight_kg' || field === 'trip_type') {
    const trip = state.trips.find(t => String(t.id) === String(tripId));
    if (trip) {
      const merged = { ...trip, [field]: value };
      const newPayout = calcPayoutValue(
        merged.trip_type,
        parseFloat(merged.distance_km) || 0,
        parseFloat(merged.weight_kg) || 0
      );
      payload.payout = newPayout;
    }
  }

  const { error } = await db.from('trips').update(payload).eq('id', tripId);
  if (error) { toast('Update failed: ' + error.message, 'error'); return; }
  toast('Updated!', 'success');
  await loadAll();
}

async function deleteTrip(tripId) {
  if (!db) return;
  if (!confirm('Delete this trip?')) return;
  const { error } = await db.from('trips').delete().eq('id', tripId);
  if (error) { toast('Delete failed: ' + error.message, 'error'); return; }
  toast('Trip deleted', 'success');
  await loadAll();
}

/* ================================================================
   EXPENSES TABLE
   ================================================================ */
async function loadExpenses() {
  if (!db) return;
  const { data, error } = await db.from('expenses').select('*').order('expense_date', { ascending: false });
  if (error) { toast('Expenses load error: ' + error.message, 'error'); return; }
  state.expenses = data || [];
  renderExpensesTable(state.expenses);
}

function renderExpensesTable(rows) {
  const tbody = document.getElementById('expenses-tbody');
  document.getElementById('expenses-count').textContent =
    `${rows.length} expense${rows.length !== 1 ? 's' : ''}`;

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="icon">💸</div><p>No expenses found.</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(e => `
    <tr>
      <td data-label="Date"><input type="date" value="${e.expense_date}" onchange="updateExpenseField('${e.id}','expense_date',this.value)"></td>
      <td data-label="Category">
        <select onchange="updateExpenseField('${e.id}','category',this.value)">
          ${['Fuel', 'Breakages', 'Repairs', 'Other'].map(c => `<option${c === e.category ? ' selected' : ''}>${c}</option>`).join('')}
        </select>
      </td>
      <td data-label="Amount" style="color:var(--accent2)">
        <input type="number" value="${e.amount}" step="0.01" style="max-width:120px" onchange="updateExpenseField('${e.id}','amount',this.value)">
      </td>
      <td data-label="Description"><input type="text" value="${esc(e.description) || ''}" placeholder="—" onchange="updateExpenseField('${e.id}','description',this.value)"></td>
      <td class="cell-actions"><button class="btn btn-danger" style="padding:4px 10px;font-size:.68rem;" onclick="deleteExpense('${e.id}')">Delete</button></td>
    </tr>`).join('');
}

async function updateExpenseField(id, field, value) {
  if (!db) return;
  const { error } = await db.from('expenses').update({ [field]: value }).eq('id', id);
  if (error) { toast('Update failed: ' + error.message, 'error'); return; }
  toast('Updated!', 'success');
  await loadAll();
}

async function deleteExpense(id) {
  if (!db) return;
  if (!confirm('Delete this expense?')) return;
  const { error } = await db.from('expenses').delete().eq('id', id);
  if (error) { toast('Delete failed: ' + error.message, 'error'); return; }
  toast('Expense deleted', 'success');
  await loadAll();
}

/* ── Inline add-expense form ── */
function toggleExpenseForm() {
  const form = document.getElementById('expense-add-form');
  const isHidden = form.style.display === 'none' || form.style.display === '';
  form.style.display = isHidden ? 'block' : 'none';
  if (isHidden) {
    document.getElementById('ne-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('ne-amount').value = '';
    document.getElementById('ne-desc').value = '';
  }
}

async function saveStandaloneExpense() {
  if (!db) { toast('Not connected', 'error'); return; }
  const date = document.getElementById('ne-date').value;
  const cat = document.getElementById('ne-cat').value;
  const amount = parseFloat(document.getElementById('ne-amount').value) || 0;
  const desc = val('ne-desc') || null;
  if (!date || !amount) { toast('Enter date and amount', 'error'); return; }

  const { error } = await db.from('expenses').insert([{ expense_date: date, category: cat, amount, description: desc }]);
  if (error) { toast('Save failed: ' + error.message, 'error'); return; }

  toast('Expense saved!', 'success');
  document.getElementById('expense-add-form').style.display = 'none';
  await loadAll();
}

/* ================================================================
   EXCEL EXPORT  (SheetJS)
   ================================================================ */
function exportTripsExcel() {
  if (!state.trips.length) { toast('No trips to export', 'error'); return; }
  const rows = state.trips.map(t => ({
    Date: t.trip_date || '',
    Type: t.trip_type || '',
    Status: t.status || '',
    'Invoice #': t.invoice_number || '',
    'Trip ID': t.trip_id || '',
    'Distance (km)': num(t.distance_km),
    'Weight (kg)': num(t.weight_kg),
    'Long Distance': isLongDistance(t.distance_km || 0) ? 'Yes' : 'No',
    'Payout (R)': round2(t.payout),
    'Grouped Invoices': t.grouped_invoices || '',
    'Grouped Trip IDs': t.grouped_trip_ids || '',
    Notes: t.notes || '',
  }));
  exportSheet(rows, 'Trips', 'logitrack-trips', { 'Payout (R)': true });
}

function exportExpensesExcel() {
  if (!state.expenses.length) { toast('No expenses to export', 'error'); return; }
  const rows = state.expenses.map(e => ({
    Date: e.expense_date || '',
    Category: e.category || '',
    'Amount (R)': round2(e.amount),
    Description: e.description || '',
  }));
  exportSheet(rows, 'Expenses', 'logitrack-expenses', { 'Amount (R)': true });
}

// rows: array of flat objects; totalCols: {colName:true} to append a TOTAL row
function exportSheet(rows, sheetName, filePrefix, totalCols = {}) {
  if (!window.XLSX) { toast('Excel library not loaded — check your connection', 'error'); return; }

  const cols = Object.keys(rows[0]);

  // Append a totals row for currency columns
  if (Object.keys(totalCols).length) {
    const totalRow = {};
    cols.forEach((c, i) => {
      if (totalCols[c]) totalRow[c] = round2(rows.reduce((s, r) => s + num(r[c]), 0));
      else totalRow[c] = i === 0 ? 'TOTAL' : '';
    });
    rows = [...rows, totalRow];
  }

  const ws = XLSX.utils.json_to_sheet(rows, { header: cols });

  // Auto column widths
  ws['!cols'] = cols.map(c => ({
    wch: Math.min(48, Math.max(c.length + 2, ...rows.map(r => String(r[c] ?? '').length + 2)))
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${filePrefix}-${stamp}.xlsx`);
  toast(`Exported ${rows.length - (Object.keys(totalCols).length ? 1 : 0)} ${sheetName.toLowerCase()} to Excel`, 'success');
}

/* ================================================================
   SAVED RANGES
   ================================================================ */
async function loadSavedRanges() {
  if (!db) return;
  const { data } = await db.from('saved_date_ranges').select('*').order('created_at');
  state.ranges = data || [];
  renderSavedRanges(state.ranges);
}

function renderSavedRanges(ranges) {
  const container = document.getElementById('saved-ranges-list');
  if (!ranges.length) {
    container.innerHTML = `<span style="color:var(--text-dim);font-size:.75rem;">No saved ranges yet.</span>`;
    return;
  }
  container.innerHTML = ranges.map(r => `
    <button class="range-item" id="chip-${r.id}" onclick="applyRange('${r.start_date}','${r.end_date}','${r.id}')">
      <span class="ri-main">
        <span class="ri-label">${esc(r.label)}</span>
        <span class="ri-dates">${r.start_date} → ${r.end_date}</span>
      </span>
      <span class="ri-del" title="Delete range" onclick="deleteRange(event,'${r.id}')">🗑</span>
    </button>`).join('');
}

async function deleteRange(e, id) {
  e.stopPropagation();
  if (!db) return;
  await db.from('saved_date_ranges').delete().eq('id', id);
  loadSavedRanges();
}

function openRangesModal() {
  document.getElementById('ranges-modal').classList.add('open');
}

function closeRangesModal() {
  document.getElementById('ranges-modal').classList.remove('open');
}

function applyRange(start, end, id) {
  document.getElementById('filter-start').value = start;
  document.getElementById('filter-end').value = end;
  document.querySelectorAll('.range-item').forEach(c => c.classList.remove('active'));
  document.getElementById('chip-' + id)?.classList.add('active');
  closeRangesModal();
  renderDashboard();
}

function openSaveRangeModal() {
  closeRangesModal();
  document.getElementById('range-start').value = document.getElementById('filter-start').value || '';
  document.getElementById('range-end').value = document.getElementById('filter-end').value || '';
  document.getElementById('save-range-modal').classList.add('open');
}

function closeSaveRangeModal() {
  document.getElementById('save-range-modal').classList.remove('open');
}

async function saveRange() {
  if (!db) { toast('Not connected', 'error'); return; }
  const label = document.getElementById('range-label').value.trim();
  const start = document.getElementById('range-start').value;
  const end = document.getElementById('range-end').value;
  if (!label || !start || !end) { toast('Fill in all fields', 'error'); return; }
  const { error } = await db.from('saved_date_ranges').insert([{ label, start_date: start, end_date: end }]);
  if (error) { toast('Save failed: ' + error.message, 'error'); return; }
  toast('Date range saved!', 'success');
  closeSaveRangeModal();
  document.getElementById('range-label').value = '';
  loadSavedRanges();
}

/* ================================================================
   TABS
   ================================================================ */
function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + tab));
  if (tab === 'dashboard') renderDashboard();
  if (tab === 'trips-list') renderTripsTable(state.trips);
  if (tab === 'expenses-list') renderExpensesTable(state.expenses);
}

/* ================================================================
   TOAST + HELPERS
   ================================================================ */
let toastTimer = null;
function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  const dot = document.getElementById('toast-dot');
  const txt = document.getElementById('toast-msg');
  txt.textContent = msg;
  el.className = 'show ' + type;
  dot.className = 'toast-dot ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = ''; }, 3500);
}

function num(v) { return Number(v) || 0; }
function round2(v) { return +(Number(v) || 0).toFixed(2); }
function sum(arr, fn) { return arr.reduce((s, x) => s + num(fn(x)), 0); }
function val(id) { return document.getElementById(id)?.value.trim() || ''; }
function setText(id, v) { const el = document.getElementById(id); if (el) el.textContent = v; }
function money(v) {
  return 'R ' + Number(v || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function esc(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
