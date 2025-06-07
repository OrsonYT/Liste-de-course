let items = [];
const itemsList = document.getElementById('itemsList');
const form = document.getElementById('addItemForm');
const input = document.getElementById('itemInput');
const helloUser = document.getElementById('helloUser');

// Gestion prénom utilisateur
const nameModal = document.getElementById('nameModal');
const userNameInput = document.getElementById('userNameInput');
const saveNameBtn = document.getElementById('saveNameBtn');
const appTitle = document.getElementById('appTitle');

let userName = localStorage.getItem('userName') || '';

function showNameModal() {
    nameModal.style.display = "flex";
    userNameInput.value = '';
    userNameInput.focus();
}
function hideNameModal() {
    nameModal.style.display = "none";
}
function setUserName(name) {
    userName = name;
    localStorage.setItem('userName', name);
    helloUser.textContent = `Bonjour ${userName} 👋`;
    appTitle.textContent = `${userName} - Liste de Courses`;
}

if (!userName) {
    showNameModal();
} else {
    setUserName(userName);
}

saveNameBtn.onclick = () => {
    const name = userNameInput.value.trim();
    if (name) {
        setUserName(name);
        hideNameModal();
    }
};
userNameInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') saveNameBtn.click();
});

// Ajout d'un article
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const item = input.value.trim();
    if (item && !items.includes(item)) {
        items.push(item);
        input.value = '';
        renderItems(item, true);
    }
});

// Supprimer un article avec animation
function removeItem(item) {
    const index = items.indexOf(item);
    if (index > -1) {
        items.splice(index, 1);
        const row = document.getElementById(`row-${btoa(item)}`);
        if (row) {
            row.classList.add('fade-out');
            setTimeout(() => {
                row.remove();
            }, 350);
        }
    }
}

// Affichage avec animation d'entrée
function renderItems(newItem = null, animate = false) {
    itemsList.innerHTML = '';
    for (const item of items) {
        const row = document.createElement('div');
        row.className = 'site-row';
        row.id = `row-${btoa(item)}`;
        row.innerHTML = `
            <span>${item}</span>
            <button class="remove-btn" title="Supprimer" onclick="removeItem('${item}')">X</button>
        `;
        if (animate && item === newItem) {
            row.classList.add('fade-in');
            setTimeout(() => row.classList.remove('fade-in'), 350);
        }
        itemsList.appendChild(row);
    }
}

window.removeItem = removeItem;