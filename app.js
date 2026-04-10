// --- Theme Toggle Setup ---
const themeToggleBtn = document.getElementById('theme-toggle');
const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

function toggleTheme() {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('color-theme', 'light');
        themeToggleLightIcon.classList.add('hidden');
        themeToggleDarkIcon.classList.remove('hidden');
        Chart.defaults.color = '#64748b'; 
        Chart.defaults.borderColor = '#e2e8f0'; 
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('color-theme', 'dark');
        themeToggleDarkIcon.classList.add('hidden');
        themeToggleLightIcon.classList.remove('hidden');
        Chart.defaults.color = '#94a3b8'; 
        Chart.defaults.borderColor = '#334155'; 
    }
    activeCharts.forEach(c => c.update());
}

if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
    themeToggleLightIcon.classList.remove('hidden');
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.borderColor = '#334155';
} else {
    themeToggleDarkIcon.classList.remove('hidden');
}
themeToggleBtn.addEventListener('click', toggleTheme);

// --- DOM Elements ---
const tabs = { 
    generator: document.getElementById('tab-generator'), 
    tester: document.getElementById('tab-tester'),
    info: document.getElementById('tab-info') 
};
const contents = { 
    generator: document.getElementById('content-generator'), 
    tester: document.getElementById('content-tester'),
    info: document.getElementById('content-info') 
};

const methodSelect = document.getElementById('method');
const lcgParamsContainer = document.getElementById('lcg-params-container');
const lcgPresetSelect = document.getElementById('lcg-preset');
const lcgAInput = document.getElementById('lcg-a'), lcgCInput = document.getElementById('lcg-c'), lcgMInput = document.getElementById('lcg-m');
const countPreset = document.getElementById('count-preset'), countCustom = document.getElementById('count-custom');
const seedInput = document.getElementById('seed');
const generateSeedBtn = document.getElementById('generate-seed');
const seedSettingsBtn = document.getElementById('seed-settings-btn');
const seedPopover = document.getElementById('seed-popover');
const autoSeedLengthInput = document.getElementById('auto-seed-length');
const generateBtn = document.getElementById('generate-btn'), btnText = document.getElementById('btn-text'), btnLoader = document.getElementById('btn-loader');
const messageBox = document.getElementById('message-box');
const downloadBtn = document.getElementById('download-btn');
const uploadBtn = document.getElementById('upload-btn'), uploadInput = document.getElementById('upload-input'), uploadModulusInput = document.getElementById('upload-modulus');
const testResultsContainer = document.getElementById('test-results-container'), testerPlaceholder = document.getElementById('tester-placeholder');

let generatedNumbers = [];
let isDataFromUpload = false;
let activeCharts = [];

const LCG_PRESETS = {
    'numerical-recipes': { a: 1664525, c: 1013904223, m: 4294967296 },
    'glibc': { a: 1103515245, c: 12345, m: 2147483648 },
    'java': { a: 25214903917, c: 11, m: 281474976710656 },
    'custom': { a: 1664525, c: 1013904223, m: 4294967296 }
};

// --- Event Listeners ---
for (const key in tabs) tabs[key].addEventListener('click', () => switchTab(key));
methodSelect.addEventListener('change', handleMethodChange);
lcgPresetSelect.addEventListener('change', handleLcgPresetChange);
countPreset.addEventListener('change', () => countCustom.classList.toggle('hidden', countPreset.value !== 'custom'));

generateSeedBtn.addEventListener('click', () => { 
    let sl = parseInt(autoSeedLengthInput.value); if(isNaN(sl)||sl<4) sl=8;
    seedInput.value = Math.floor(Math.random() * (Math.pow(10, sl) - Math.pow(10, sl-1))) + Math.pow(10, sl-1); 
});

seedSettingsBtn.addEventListener('click', () => seedPopover.classList.toggle('hidden'));
document.addEventListener('click', (e) => {
    if (!seedSettingsBtn.contains(e.target) && !seedPopover.contains(e.target)) seedPopover.classList.add('hidden');
});

generateBtn.addEventListener('click', handleGenerate);
downloadBtn.addEventListener('click', handleDownload);
uploadBtn.addEventListener('click', () => uploadInput.click());
uploadInput.addEventListener('change', handleFileUpload);

handleMethodChange(); handleLcgPresetChange();

// --- Core Helpers ---
function switchTab(activeTab) {
    for (const key in tabs) {
        const isActive = key === activeTab;
        tabs[key].classList.toggle('active', isActive);
        if (isActive) contents[key].classList.remove('hidden');
        else contents[key].classList.add('hidden');
    }
}

function showMessage(type, text) {
    messageBox.className = 'p-4 rounded-xl text-sm font-medium flex items-center mt-4 ' + 
        (type === 'error' ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900' 
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900');
    messageBox.innerHTML = `
        <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${type === 'error' ? 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'}"></path>
        </svg>
        <span>${text}</span>`;
    messageBox.classList.remove('hidden');
}

function handleMethodChange() { lcgParamsContainer.classList.toggle('hidden', methodSelect.value !== 'lcg'); }
function handleLcgPresetChange() { const p = LCG_PRESETS[lcgPresetSelect.value]; if (p) { lcgAInput.value = p.a; lcgCInput.value = p.c; lcgMInput.value = p.m; } }

function getModulus() {
    if (isDataFromUpload) {
        const manualModulus = parseFloat(uploadModulusInput.value);
        if (!isNaN(manualModulus) && manualModulus > 0) return manualModulus;
        let max = Math.max(...generatedNumbers);
        if (max <= 1.0) return 1.0;
        if (max <= 256) return 256;
        return Math.pow(2, Math.ceil(Math.log2(max))); 
    }
    const m = methodSelect.value;
    if (m === 'lcg') return parseInt(lcgMInput.value);
    if (m === 'ms') return Math.pow(10, String(seedInput.value).length);
    if (m === 'pcg32' || m === 'xorshift' || m === 'mt19937') return 4294967296; // 2**32
    return 1;
}

function clearTesterState() {
    generatedNumbers = [];
    activeCharts.forEach(chart => chart.destroy()); activeCharts = [];
    downloadBtn.disabled = true;
    testResultsContainer.innerHTML = '';
    testResultsContainer.classList.add('hidden');
    testerPlaceholder.classList.remove('hidden');
    messageBox.classList.add('hidden');
}

// --- Generators Algorithms ---
function* mt19937Generator(seed) {
    const MT = new Uint32Array(624); let index = 0; MT[0] = seed >>> 0;
    for (let i=1; i<624; i++) { let s = MT[i-1] ^ (MT[i-1] >>> 30); MT[i] = (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253 + i); MT[i] >>>= 0; }
    while(true) {
        if (index === 0) {
            for (let i=0; i<624; i++) {
                let y = (MT[i] & 0x80000000) + (MT[(i+1)%624] & 0x7fffffff);
                MT[i] = MT[(i+397)%624] ^ (y >>> 1); if (y % 2 !== 0) MT[i] ^= 0x9908b0df;
            }
        }
        let y = MT[index]; y ^= (y >>> 11); y ^= (y << 7) & 0x9d2c5680; y ^= (y << 15) & 0xefc60000; y ^= (y >>> 18);
        index = (index + 1) % 624; yield y >>> 0;
    }
}

function* pcg32Generator(seed) {
    let state = BigInt(seed) + 1442695040888963407n, inc = 1442695040888963407n | 1n;
    while(true) {
        let os = state; state = (os * 6364136223846793005n + inc) & 0xFFFFFFFFFFFFFFFFn;
        let xsh = Number(((os >> 18n) ^ os) >> 27n), rot = Number(os >> 59n);
        yield ((xsh >>> rot) | (xsh << ((-rot) & 31))) >>> 0;
    }
}

function* lcgGenerator(seed, a, c, m) { let x = seed; while (true) { x = (a * x + c) % m; yield x; } }
function* xorshiftGenerator(seed) { let x = seed || 1; while(true) { x ^= x << 13; x ^= x >> 17; x ^= x << 5; yield x >>> 0; } }
function* middleSquareGenerator(seed) {
    let n = seed; const len = String(seed).length; const seen = new Set();
    while (true) { 
        seen.add(n); 
        let sq = String(n * n).padStart(2 * len, '0'); 
        const start = Math.floor((sq.length - len) / 2); 
        n = parseInt(sq.substring(start, start + len)); 
        yield n; 
    }
}

// --- Execution Handler ---
function handleGenerate() {
    clearTesterState(); isDataFromUpload = false;
    const method = methodSelect.value, count = countPreset.value === 'custom' ? parseInt(countCustom.value) : parseInt(countPreset.value);
    let seed = parseInt(seedInput.value);

    if (isNaN(count) || count <= 0) { showMessage('error', 'Please enter a valid amount.'); return; }
    if (isNaN(seed)) { showMessage('error', 'Seed is required.'); return; }
    
    generateBtn.disabled = true; btnText.classList.add('hidden'); btnLoader.classList.remove('hidden');
    
    setTimeout(() => {
        try {
            let generator;
            if (method === 'mt19937') generator = mt19937Generator(seed);
            else if (method === 'pcg32') generator = pcg32Generator(seed);
            else if (method === 'lcg') generator = lcgGenerator(seed, parseInt(lcgAInput.value), parseInt(lcgCInput.value), parseInt(lcgMInput.value));
            else if (method === 'xorshift') generator = xorshiftGenerator(seed);
            else if (method === 'ms') generator = middleSquareGenerator(seed);

            for (let i=0; i<count; i++) generatedNumbers.push(generator.next().value);
            
            runAllTests(); showMessage('success', `Generated ${count} numbers.`); downloadBtn.disabled = false; switchTab('tester');
        } catch (e) { showMessage('error', e.message); } 
        finally { 
            generateBtn.disabled = false; btnText.classList.remove('hidden'); btnLoader.classList.add('hidden');
            // Notify MathJax to render new equations if needed
            if (window.MathJax) {
                MathJax.typesetPromise();
            }
        }
    }, 50);
}

// --- Upload & Download ---
async function handleFileUpload(event) {
    const file = event.target.files[0]; if (!file) return;
    isDataFromUpload = true; clearTesterState();
    try {
        const nums = await parseFile(file);
        if (nums.length === 0) throw new Error("No numeric structure found.");
        generatedNumbers = nums; runAllTests(); showMessage('success', `Imported ${nums.length} numbers.`); downloadBtn.disabled = false; switchTab('tester');
    } catch (e) { showMessage('error', e.message); } finally { uploadInput.value = ''; }
}

function parseFile(file) {
    return new Promise((resolve, reject) => {
        const r = new FileReader(), ext = file.name.split('.').pop().toLowerCase();
        r.onload = e => {
            try {
                let nums = [];
                if(ext === 'xlsx') {
                    const wb = XLSX.read(new Uint8Array(e.target.result), {type: 'array'});
                    nums = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {header: 1}).map(row => parseFloat(row[0])).filter(n => !isNaN(n));
                } else { nums = e.target.result.split(/\r?\n/).map(l => parseFloat(l.trim())).filter(n => !isNaN(n)); }
                resolve(nums);
            } catch { reject(new Error("Parse fail")); }
        };
        r.onerror = () => reject(new Error("Read fail"));
        ext === 'xlsx' ? r.readAsArrayBuffer(file) : r.readAsText(file);
    });
}

function handleDownload() {
    if (!generatedNumbers.length) return;
    const outputFmt = document.querySelector('input[name="format"]:checked').value, ext = document.querySelector('input[name="export"]:checked').value, mod = getModulus();
    let data, headers;
    if (outputFmt === 'raw') { headers = ['Raw']; data = generatedNumbers.map(n => [n]); }
    else if (outputFmt === 'normalized') { headers = ['Normalized']; data = generatedNumbers.map(n => [n / mod]); }
    
    if(ext === 'csv') {
        const blob = new Blob([headers.join(',') + '\n' + data.map(r => r.join(',')).join('\n')], {type: 'text/csv'});
        const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `prng_output_${Date.now()}.csv`; link.click();
    } else {
        const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([headers, ...data]), "PRNG_Data");
        XLSX.writeFile(wb, `prng_output_${Date.now()}.xlsx`);
    }
}

// --- STATISTICAL ENGINE ---
function runAllTests() {
    if (generatedNumbers.length === 0) return;
    const mod = getModulus(), isFloat = mod === 1, bitLength = isFloat ? 32 : Math.max(1, Math.ceil(Math.log2(mod)));
    
    const binaryString = generatedNumbers.map(n => {
        let iv = n; if (isFloat) iv = Math.floor(n * Math.pow(2, 32)); if (iv < 0) iv = 0;
        return Math.floor(iv).toString(2).padStart(bitLength, '0');
    }).join('');
    
    const normalizedNumbers = generatedNumbers.map(n => isFloat ? n : n / mod);

    const tests = [
        { name: 'Frequency Test (Monobit)', fn: frequencyTest, input: binaryString },
        { name: 'Runs Test', fn: runsTest, input: binaryString },
        { name: 'Chi-Square Uniformity Test', fn: chiSquareTest, input: normalizedNumbers },
        { name: 'Autocorrelation Test', fn: autocorrelationTest, input: normalizedNumbers },
        { name: 'Poker Test', fn: pokerTest, input: { raw: generatedNumbers, isFloat: isFloat } }
    ];

    let html = `<div class="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-700 pb-4"><h2 class="text-xl font-bold text-slate-800 dark:text-slate-100">Statistical Audit Results</h2><span class="text-sm text-slate-500 font-medium font-mono bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">MODULUS: ${mod}</span></div>`;
    tests.forEach(test => html += createTestCard(test.name, test.fn(test.input)));
    testResultsContainer.innerHTML = html; testerPlaceholder.classList.add('hidden'); testResultsContainer.classList.remove('hidden');
    
    tests.forEach(t => { const res = t.fn(t.input); if (res.canvasId === 'chart-chi') createBarChart(normalizedNumbers); if (res.canvasId === 'chart-auto') createScatterChart(normalizedNumbers); });
}

function createTestCard(name, res) {
    let badge = res.passed === 'N/A' ? `<span class="bg-slate-200 text-slate-800 py-1 px-3 rounded-full text-xs font-semibold">N/A</span>`
                : res.passed ? `<span class="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 py-1 px-3 rounded-full text-xs font-bold shadow-sm inline-flex items-center"><svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>Passed</span>` 
                : `<span class="bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300 py-1 px-3 rounded-full text-xs font-bold shadow-sm inline-flex items-center"><svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>Failed</span>`;

    let detailsHtml = '';
    for (const [k, v] of Object.entries(res.details)) detailsHtml += `<div class="grid grid-cols-1 sm:grid-cols-3 gap-2 border-b border-slate-100 dark:border-slate-700/50 pb-2 mb-2"><div class="text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-wider items-center flex">${k}</div><div class="sm:col-span-2 text-slate-800 dark:text-slate-200 text-sm font-mono break-words">${v}</div></div>`;

    return `
    <div class="bg-white dark:bg-slate-800 border-l-4 ${res.passed === 'N/A' ? 'border-slate-300' : res.passed ? 'border-emerald-500' : 'border-rose-500'} border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
        <details class="group">
            <summary class="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition">
                <div class="flex items-center"><span class="arrow transition-transform w-5 h-5 text-slate-400 mr-2"><svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg></span><span class="font-bold text-slate-700 dark:text-slate-200">${name}</span></div>
                ${badge}
            </summary>
            <div class="p-5 border-t border-slate-100 dark:border-slate-700">
                <p class="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">${res.desc}</p>
                
                <div class="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                        <span class="block text-xs uppercase font-bold text-indigo-500 mb-2">Step 1: The Null Hypothesis (H₀)</span>
                        <span class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">${res.hypothesis}</span>
                    </div>
                    <div class="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700/50">
                        <span class="block text-xs uppercase font-bold text-slate-500 mb-2">Step 2: Threshold & Goal</span>
                        <span class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-mono">${res.threshold}</span>
                    </div>
                </div>

                <div class="mb-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span class="block text-xs uppercase font-bold text-slate-500 mb-3">Step 3: Calculation Results</span>
                    ${detailsHtml}
                </div>

                <div class="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border-l-2 border-indigo-400">
                    <span class="block text-xs font-bold text-slate-500 uppercase mb-2">How it works</span>
                    <span class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">${res.method}</span>
                </div>
                ${res.canvasId ? `<div class="mt-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700"><canvas id="${res.canvasId}"></canvas></div>` : ''}
            </div>
        </details>
    </div>`;
}

// Test Implementations Mapping
function frequencyTest(binStr) {
    if (binStr.length < 100) return { passed: 'N/A', desc: "Checks proportion of 1s and 0s.", hypothesis:"Numbers are random", threshold:"-", method:"-", details: { "Reason": "Need >100 bits." } };
    let ones = 0; for(let i=0; i<binStr.length; i++) if(binStr[i] === '1') ones++;
    const prop = ones / binStr.length, passed = prop > 0.45 && prop < 0.55;
    return { 
        passed, 
        desc: "The Frequency (Monobit) test is the most fundamental test. It checks if there is roughly an equal number of zeros and ones in the binary representation of the sequence.",
        hypothesis: "The fraction of ones and zeros should be approximately equivalent (50% each), like flipping a fair coin.",
        threshold: "Passing implies the proportion of ones falls nicely within [0.45, 0.55].", 
        method: "The algorithm converts all numbers into a continuous binary string. It counts the number of '1's. If the ratio of '1's to the total bits is terribly unbalanced, the generator is flawed.",
        details: { "Observed Proportion of 1s": `${(prop * 100).toFixed(2)}%`, "Final Decision": passed ? "Fail to reject H₀ (Test Passed)" : "Reject H₀ (Test Failed)" }
    };
}

function runsTest(binStr) {
    if (binStr.length < 100) return { passed: 'N/A', desc: "", hypothesis:"", threshold:"", method:"", details: { "Reason": "Need >100 bits." } };
    const n = binStr.length; let ones = 0; for(let i=0; i<n; i++) if(binStr[i] === '1') ones++;
    const pi = ones / n;
    if (Math.abs(pi - 0.5) >= 2 / Math.sqrt(n)) return { passed: false, desc: "Analyzes bit oscillation.", hypothesis:"Bit cluster randomness.", threshold:"P ≥ 0.01", method:"-", details: { "Final Decision": "Failed prerequisite (proportion too imbalanced)." } };
    let V = 1; for (let i=0; i<n-1; i++) if (binStr[i] !== binStr[i+1]) V++;
    const z = Math.abs(V - (2*n*pi*(1-pi))) / (2*Math.sqrt(2*n)*pi*(1-pi)), pVal = Math.max(0, 1 - Math.erf(z / Math.SQRT2)), passed = pVal >= 0.01;
    
    return { 
        passed, 
        desc: "The Runs test checks for uninterrupted sequences of identical bits (e.g. \"111111\" or \"000000\"). If bits constantly flip (101010) or never flip (111111), the sequence isn't random.",
        hypothesis: "Bit state changes (oscillations between 0 and 1) occur at an expected, natural frequency without overly rigid patterns.",
        threshold: "P-Value ≥ 0.01 (Significance Level α = 1%)", 
        method: "The test calculates the total number of 'runs' (V). A run is an uninterrupted string of identical bits. It computes a Z-factor relative to variance to determine if the number of runs is statistically probable.",
        details: { "P-Value": pVal.toExponential(4), "Runs Detected (V)": V, "Final Decision": passed ? "Fail to reject H₀ (Test Passed)" : "Reject H₀ (Test Failed)" }
    };
}

function chiSquareTest(norm) {
    if (norm.length < 100) return { passed: 'N/A', desc: "", hypothesis:"", threshold:"", method:"", details: { "Reason": "Need >100 items." } };
    const k = 10, n = norm.length, obs = new Array(k).fill(0);
    norm.forEach(num => obs[Math.min(Math.floor(num * k), k - 1)]++);
    const exp = n / k, chi2 = obs.reduce((sum, o) => sum + Math.pow(o - exp, 2) / exp, 0), passed = chi2 <= 16.919;
    return { 
        passed, 
        desc: "The Chi-Square Uniformity Test ensures that numbers are generated evenly across all possible values, without favoring specific ranges.",
        hypothesis: "The generated values map entirely uniformly across 10 defined subdivisions (e.g., 10% fall between 0.0-0.1, 10% between 0.1-0.2).",
        threshold: "Chi² Statistic ≤ 16.919 (Degrees of freedom = 9, α = 0.05)", 
        method: "We divide the range into 10 buckets. We count how many numbers land in each bucket (observed) and compare it against a perfect even split (expected). The sum of squared differences is the Chi² stat.",
        details: { "Calculated Chi² Stat": chi2.toFixed(4), "Final Decision": passed ? "Fail to reject H₀ (Test Passed)" : "Reject H₀ (Test Failed)" }, canvasId: 'chart-chi' 
    };
}

function autocorrelationTest(norm) {
    if (norm.length < 100) return { passed: 'N/A', desc: "", hypothesis:"", threshold:"", method:"", details: { "Reason": "Need >100 items." } };
    const M = norm.length - 1; let rho = 0; for (let i = 0; i < M; i++) rho += norm[i] * norm[i + 1];
    rho = (12 / M) * rho - 3; const Z = rho / Math.sqrt((13 * M + 7) / (12 * (M + 1))), passed = Math.abs(Z) <= 1.96;
    return { 
        passed, 
        desc: "The Autocorrelation Test checks whether generating a specific number systematically influences the next generated number (e.g., a high number is always followed by a low number).",
        hypothesis: "Numbers iterate entirely independent from the preceding value. There is no correlation between $X_i$ and $X_{i+1}$.",
        threshold: "|Z| ≤ 1.96 (Confidence level of 95%)", 
        method: "The algorithm calculates the 'lag-1' multiplier (rho), which mathematically links the relation of the current number to the next number, deriving standard Pearson correlation limits.",
        details: { "Z Statistic": Z.toFixed(4), "Final Decision": passed ? "Fail to reject H₀ (Test Passed)" : "Reject H₀ (Test Failed)" }, canvasId: 'chart-auto' 
    };
}

function pokerTest(dataObj) {
    const numbers = dataObj.raw; if (numbers.length < 50) return { passed: 'N/A', desc: "", hypothesis:"", threshold:"", method:"", details: { "Reason": "Need >50 items." } };
    const obs = [0, 0, 0];
    numbers.forEach(num => {
        let target = dataObj.isFloat ? num * 1000 : num;
        const last3 = Math.floor(Math.abs(target)) % 1000;
        const s = String(last3).padStart(3, '0'); const counts = {}; for(let char of s) counts[char] = (counts[char] || 0) + 1;
        const v = Object.values(counts); if (v.length === 3) obs[0]++; else if (v.includes(2)) obs[1]++; else obs[2]++;
    });
    const exp = [numbers.length * 0.72, numbers.length * 0.27, numbers.length * 0.01];
    let chi2 = 0; for(let i=0; i<3; i++) chi2 += Math.pow(obs[i] - exp[i], 2) / exp[i];
    const passed = chi2 <= 5.991;
    return { 
        passed, 
        desc: "The Poker Test treats sequences of numbers like a hand of poker. It checks if combinations of digits appear at theoretically correct probability rates.",
        hypothesis: "Categorical combinations (like 'Pairs' or 'Three of a kind' digits) obey true probabilistic distributions (e.g. 72% chance all digits are different).",
        threshold: "Chi² Statistic ≤ 5.991 (Degrees of freedom = 2, α = 0.05)", 
        method: "It takes the last 3 digits of each generated number and treats them as a mini poker hand. It expects ~72% to be all different, ~27% to have one pair, and ~1% to be three-of-a-kind. It then uses Chi² to measure deviation.",
        details: { "Chi² Stat": chi2.toFixed(4), "Final Decision": passed ? "Fail to reject H₀ (Test Passed)" : "Reject H₀ (Test Failed)" } 
    };
}

// Charts
Math.erf = function(x) { const a1=0.254829592, a2=-0.284496736, a3=1.421413741, a4=-1.453152027, a5=1.061405429, p=0.3275911; const sign=x<0?-1:1; x=Math.abs(x); const t=1.0/(1.0+p*x), y=1.0-(((((a5*t+a4)*t)+a3)*t+a2)*t+a1)*t*Math.exp(-x*x); return sign*y; };

function createBarChart(norm) {
    const ctx = document.getElementById('chart-chi'); if(!ctx) return;
    const k = 10, obs = new Array(k).fill(0); norm.forEach(n => obs[Math.min(Math.floor(n * k), k - 1)]++);
    const chart = new Chart(ctx, { type: 'bar', data: { labels: Array.from({length:10}, (_,i) => `0.${i}`), datasets: [{ label: 'Observed', data: obs, backgroundColor: '#6366f1', borderRadius: 4 }, { label: 'Expected', data: Array(k).fill(norm.length/k), type: 'line', borderColor: '#f43f5e', fill: false, tension: 0.1, pointRadius: 0 }] }, options: { scales: { y: { beginAtZero: true, grid: { color: 'rgba(150, 150, 150, 0.1)' } }, x: { grid: { display: false } } }, responsive:true, plugins: { legend: { position: 'bottom' } } } });
    activeCharts.push(chart);
}

function createScatterChart(norm) {
    const ctx = document.getElementById('chart-auto'); if(!ctx) return;
    const pts = []; for(let i=0; i<Math.min(norm.length-1, 1000); i++) pts.push({x: norm[i], y: norm[i+1]});
    const chart = new Chart(ctx, { type: 'scatter', data: { datasets: [{ label: 'R(i) vs R(i+1) (First 1k)', data: pts, backgroundColor: '#6366f1', pointRadius: 2, pointHoverRadius: 4 }] }, options: { scales: { x: { grid: { color: 'rgba(150, 150, 150, 0.1)' }}, y: { grid: { color: 'rgba(150, 150, 150, 0.1)' }} }, responsive:true, plugins: { legend: { display: false } } } });
    activeCharts.push(chart);
}
