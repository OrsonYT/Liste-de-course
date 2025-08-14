
document.addEventListener('DOMContentLoaded', () => {
    const nameModal = document.getElementById('nameModal');
    const userNameInput = document.getElementById('userNameInput');
    const saveNameBtn = document.getElementById('saveNameBtn');
    const helloUser = document.getElementById('helloUser');
    const addItemForm = document.getElementById('addItemForm');
    const itemInput = document.getElementById('itemInput');
    const itemsList = document.getElementById('itemsList');

    let items = JSON.parse(localStorage.getItem('items')) || [];

    function renderItems() {
        itemsList.innerHTML = '';
        items.forEach((item, index) => {
            const row = document.createElement('div');
            row.className = 'site-row fade-in';
            // include favorite toggle inside each row
            const favs = JSON.parse(localStorage.getItem('favs') || '[]');
            const isFav = favs.includes(item);
            row.innerHTML = `
                <button class="fav-toggle" data-item="${encodeURIComponent(item)}" title="Favoriser">${isFav? '★' : '☆'}</button>
                <span>${item}</span>
                <button class="remove-btn" onclick="removeItem(${index})">X</button>
            `;
            itemsList.appendChild(row);
        });
    }

    // favorites modal rendering
    const favBtn = document.getElementById('favBtn');
    const favoritesModal = document.getElementById('favoritesModal');
    const favoritesList = document.getElementById('favoritesList');
    const closeFavorites = document.getElementById('closeFavorites');

    function renderFavorites() {
        const favs = JSON.parse(localStorage.getItem('favs') || '[]');
        favoritesList.innerHTML = '';
        if(favs.length === 0) {
            favoritesList.innerHTML = '<div style="color:#cbd8ee;">Aucun favori pour le moment.</div>';
            return;
        }
        favs.forEach(f => {
            const d = document.createElement('div');
            d.className = 'site-row';
            d.innerHTML = `<span>${f}</span><button class="add-btn" style="padding:6px 10px;">Ajouter</button>`;
            d.querySelector('button').addEventListener('click', ()=>{
                items.push(f); localStorage.setItem('items', JSON.stringify(items)); renderItems();
            });
            favoritesList.appendChild(d);
        });
    }

    favBtn && favBtn.addEventListener('click', ()=>{ renderFavorites(); favoritesModal.classList.add('open'); animateNavClick(favBtn); });
    closeFavorites && closeFavorites.addEventListener('click', ()=>favoritesModal.classList.remove('open'));

    // toggle favorite when clicking star in item rows (delegated)
    itemsList.addEventListener('click', (e)=>{
        const t = e.target;
        if(t.classList.contains('fav-toggle')){
            const it = decodeURIComponent(t.dataset.item || '');
            const favs = JSON.parse(localStorage.getItem('favs') || '[]');
            if(favs.includes(it)){
                const idx = favs.indexOf(it); favs.splice(idx,1);
            } else { favs.push(it); }
            localStorage.setItem('favs', JSON.stringify(favs));
            renderItems();
        }
    });

    // Settings modal
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettings = document.getElementById('closeSettings');
    const clearListBtn = document.getElementById('clearListBtn');
    const exportBtn = document.getElementById('exportBtn');

    settingsBtn && settingsBtn.addEventListener('click', ()=>{ settingsModal.classList.add('open'); animateNavClick(settingsBtn); });
    closeSettings && closeSettings.addEventListener('click', ()=> settingsModal.classList.remove('open'));

    clearListBtn && clearListBtn.addEventListener('click', ()=>{
        if(confirm('Vider la liste ?')){
            items = []; localStorage.setItem('items', JSON.stringify(items)); renderItems(); settingsModal.classList.remove('open');
        }
    });

    exportBtn && exportBtn.addEventListener('click', ()=>{
        const blob = new Blob([ (items.join('\n') || '') ], {type:'text/plain'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'liste_de_courses.txt'; a.click(); URL.revokeObjectURL(url);
    });

    // --- Price / dépenses modal ---
    const priceBtn = document.getElementById('priceBtn');
    const priceModal = document.getElementById('priceModal');
    const closePrice = document.getElementById('closePrice');
    const priceInput = document.getElementById('priceInput');
    const savePriceBtn = document.getElementById('savePriceBtn');
    const priceChart = document.getElementById('priceChart');

    function loadPrices(){
        return JSON.parse(localStorage.getItem('prices') || '[]');
    }
    function savePrices(arr){ localStorage.setItem('prices', JSON.stringify(arr)); }

    function drawChart(){
        const ctx = priceChart && priceChart.getContext && priceChart.getContext('2d');
        if(!ctx) return;
        const data = loadPrices();
        // clear
        ctx.clearRect(0,0, priceChart.width, priceChart.height);
        if(data.length === 0) return;
        // map dates and values
        const values = data.map(d=>Number(d.amount));
        const max = Math.max(...values);
        const min = Math.min(...values);
        const pad = 12;
        const w = priceChart.width - pad*2;
        const h = priceChart.height - pad*2;
        // draw grid
        ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
        for(let i=0;i<4;i++){
            const y = pad + (h/3)*i; ctx.beginPath(); ctx.moveTo(pad,y); ctx.lineTo(pad+w,y); ctx.stroke();
        }
        // line
        ctx.strokeStyle = '#58a6ff'; ctx.lineWidth = 2; ctx.beginPath();
        values.forEach((v,i)=>{
            const x = pad + (w * (i/(values.length-1||1)));
            const y = pad + h - ((v - min)/( (max-min)||1 ) * h);
            if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        });
        ctx.stroke();
        // points
        ctx.fillStyle = '#38d34a';
        values.forEach((v,i)=>{
            const x = pad + (w * (i/(values.length-1||1)));
            const y = pad + h - ((v - min)/( (max-min)||1 ) * h);
            ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2); ctx.fill();
        });
    }

    // element to show list of prices and enable deletion
    const priceListEl = document.getElementById('priceList');

    function renderPriceList(){
        const arr = loadPrices();
        if(!priceListEl) return;
        priceListEl.innerHTML = '';
        if(arr.length === 0){ priceListEl.innerHTML = '<div style="color:#cbd8ee;">Aucune dépense enregistrée.</div>'; return; }
        arr.slice().reverse().forEach((p, idx)=>{
            const globalIdx = arr.length - 1 - idx;
            const row = document.createElement('div');
            row.className = 'site-row';
            row.innerHTML = `<span>${p.date} — ${p.amount.toFixed(2)} €</span><button class="remove-price" data-idx="${globalIdx}" style="background:#e74c3c; color:#fff; padding:6px 8px; border-radius:8px;">Suppr</button>`;
            row.querySelector('button').addEventListener('click', (e)=>{
                const id = Number(e.target.dataset.idx);
                const a = loadPrices(); a.splice(id,1); savePrices(a); renderPriceList(); drawChart();
            });
            priceListEl.appendChild(row);
        });
    // keep scroll at top so newest are visible (reversed list shows newest first)
    priceListEl.scrollTo({ top: 0, behavior: 'smooth' });
    }

    priceBtn && priceBtn.addEventListener('click', ()=>{ priceModal.classList.add('open'); renderPriceList(); drawChart(); animateNavClick(priceBtn); lockBodyScroll(true); });
    closePrice && closePrice.addEventListener('click', ()=> { priceModal.classList.remove('open'); lockBodyScroll(false); });

    savePriceBtn && savePriceBtn.addEventListener('click', ()=>{
        const a = parseFloat(priceInput.value);
        if(isNaN(a)) return alert('Montant invalide');
        const d = new Date().toISOString().slice(0,10);
        const prices = loadPrices();
        prices.push({ date: d, amount: Number(a.toFixed(2)) });
    if(prices.length > 200) prices.splice(0, prices.length-200); // keep recent 200 max to avoid huge DOM
        savePrices(prices);
        priceInput.value = '';
        renderPriceList();
        drawChart();
    // ensure modal content stays scrollable and visible
    setTimeout(()=>{ if(priceListEl) priceListEl.scrollTo({ top: 0, behavior: 'smooth' }); }, 80);
    });

    window.removeItem = function(index) {
        items.splice(index, 1);
        localStorage.setItem('items', JSON.stringify(items));
        renderItems();
    };

    const storedName = localStorage.getItem('userName');
    if (storedName) {
        nameModal.classList.remove('open');
        helloUser.textContent = `Bonjour ${storedName} 👋`;
        renderItems();
    }

    saveNameBtn.addEventListener('click', () => {
        const name = userNameInput.value.trim();
        if (name) {
            localStorage.setItem('userName', name);
            nameModal.classList.remove('open');
            helloUser.textContent = `Bonjour ${name} 👋`;
        }
    });

    addItemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newItem = itemInput.value.trim();
        if (newItem) {
            items.push(newItem);
            localStorage.setItem('items', JSON.stringify(items));
            itemInput.value = '';
            renderItems();
        }
    });

    // --- Quick Add modal logic ---
    const quickAddBtn = document.getElementById('quickAddBtn');
    const quickAddModal = document.getElementById('quickAddModal');
    const closeQuickAdd = document.getElementById('closeQuickAdd');
    const quickAddInput = document.getElementById('quickAddInput');
    const quickAddConfirm = document.getElementById('quickAddConfirm');

    function openQuickAdd(prefill) {
        quickAddInput.value = prefill || '';
    quickAddModal.classList.add('open');
    setTimeout(() => quickAddInput.focus(), 120);
    }
    function closeQuickAddModal() {
    quickAddModal.classList.remove('open');
    quickAddInput.value = '';
    }

    quickAddBtn && quickAddBtn.addEventListener('click', () => openQuickAdd(''));
    closeQuickAdd && closeQuickAdd.addEventListener('click', ()=>{ closeQuickAddModal(); animateNavClick(quickAddBtn); });
    quickAddModal && quickAddModal.addEventListener('click', (e)=>{ if(e.target===quickAddModal) closeQuickAddModal(); });

    quickAddConfirm && quickAddConfirm.addEventListener('click', ()=>{
        const val = quickAddInput.value.trim();
        if(!val) return;
        // support comma-separated quick entry
        const parts = val.split(',').map(s=>s.trim()).filter(Boolean);
        parts.forEach(p=> items.push(p));
        localStorage.setItem('items', JSON.stringify(items));
        renderItems();
        closeQuickAddModal();
    });

    // --- Voice add using Web Speech API (graceful fallback) ---
    const voiceAddBtn = document.getElementById('voiceAddBtn');
    let recognition = null;
    let recognizing = false;
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRec();
        recognition.lang = 'fr-FR';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.addEventListener('result', (ev)=>{
            const text = ev.results[0][0].transcript || '';
            openQuickAdd(text);
        });
        recognition.addEventListener('end', ()=>{ recognizing = false; voiceAddBtn.classList.remove('listening'); });
    }

    voiceAddBtn && voiceAddBtn.addEventListener('click', ()=>{
        if(!recognition) {
            // fallback: open quick add and show hint
            openQuickAdd('');
            quickAddInput.placeholder = 'Votre navigateur ne supporte pas la dictée. Entrez manuellement.';
            return;
        }
        if(recognizing) { recognition.stop(); return; }
        try {
            recognition.start();
            recognizing = true;
            voiceAddBtn.classList.add('listening');
            animateNavClick(voiceAddBtn);
        } catch(e){
            console.warn('Speech start error', e);
        }
    });

    // utility: animate a nav button (adds classes then removes after animation)
    function animateNavClick(el){
        if(!el) return;
        el.classList.add('nav-click-anim','btn-anim');
        // remove btn-anim after ripple duration
        setTimeout(()=> el.classList.remove('btn-anim'), 520);
        // remove pop animation class
        setTimeout(()=> el.classList.remove('nav-click-anim'), 300);
    }

    // prevent body scroll when modal open (for mobile) and allow closing with Escape
    function lockBodyScroll(lock){
        if(lock){ document.body.style.overflow = 'hidden'; }
        else { document.body.style.overflow = ''; }
    }
    document.addEventListener('keydown', (e)=>{
        if(e.key === 'Escape'){
            // close any open modal
            [favoritesModal, settingsModal, quickAddModal, priceModal].forEach(m=>{ if(m && m.classList && m.classList.contains('open')){ m.classList.remove('open'); } });
            lockBodyScroll(false);
        }
    });
});
