
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
            row.innerHTML = `
                <span>${item}</span>
                <button class="remove-btn" onclick="removeItem(${index})">X</button>
            `;
            itemsList.appendChild(row);
        });
    }

    window.removeItem = function(index) {
        items.splice(index, 1);
        localStorage.setItem('items', JSON.stringify(items));
        renderItems();
    };

    const storedName = localStorage.getItem('userName');
    if (storedName) {
        nameModal.style.display = 'none';
        helloUser.textContent = `Bonjour ${storedName} 👋`;
        renderItems();
    }

    saveNameBtn.addEventListener('click', () => {
        const name = userNameInput.value.trim();
        if (name) {
            localStorage.setItem('userName', name);
            nameModal.style.display = 'none';
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
});
