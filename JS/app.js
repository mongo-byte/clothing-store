/* CLOTHING STORE DEMO: cart, product details, history, search and login demo */
(function () {
    var CART_KEY = 'clothingStoreCart';
    var PRODUCTS_KEY = 'clothingStoreProducts';
    var HISTORY_KEY = 'clothingStoreHistory';

    function readData(key, fallback) {
        try { return JSON.parse(localStorage.getItem(key)) || fallback; }
        catch (error) { return fallback; }
    }
    function saveData(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
    function money(amount) {
        return '₹' + Number(amount).toLocaleString('en-IN');
    }
    function slug(text) {
        return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    function getCardProduct(card) {
        var image = card.querySelector('img');
        var heading = card.querySelector('h3');
        var priceText = card.querySelector('p') ? card.querySelector('p').innerText : '';
        var prices = Array.from(priceText.matchAll(/₹\s*([\d,]+)/g));
        if (!image || !heading || prices.length === 0) return null;
        var imagePath = image.getAttribute('src');
        var imageName = imagePath.split('/').pop().toLowerCase().replace(/\.[^.]+$/, '');
        return {
            id: imageName + '-' + slug(heading.innerText),
            name: heading.innerText.trim(),
            price: Number(prices[prices.length - 1][1].replace(/,/g, '')),
            image: imagePath,
            description: 'Illustrative sample listing for this clothing store project.',
            fabric: 'Fabric information was not supplied for this sample product.',
            occasion: 'Everyday wear or an occasion that suits your personal style.',
            care: 'Please follow the care instructions on the real garment label.'
        };
    }
    function collectProducts() {
        var savedProducts = readData(PRODUCTS_KEY, {});
        document.querySelectorAll('.product-item').forEach(function (card) {
            var product = getCardProduct(card);
            if (product) savedProducts[product.id] = product;
        });
        saveData(PRODUCTS_KEY, savedProducts);
        return savedProducts;
    }
    function cartCount() {
        return readData(CART_KEY, []).reduce(function (total, item) { return total + item.quantity; }, 0);
    }
    function updateCartLinks() {
        var count = cartCount();
        document.querySelectorAll('header a, nav a').forEach(function (link) {
            var label = link.innerText.trim();
            if (/cart/i.test(label) || link.getAttribute('href') === 'cart.html') {
                link.href = 'cart.html';
                link.innerText = 'Cart 🛒' + (count ? ' (' + count + ')' : '');
            }
            if (/history/i.test(label) || link.getAttribute('href') === 'history.html') {
                link.href = 'history.html';
                link.innerText = 'History';
            }
        });
    }
    function addToCart(product) {
        var cart = readData(CART_KEY, []);
        var existing = cart.find(function (item) { return item.id === product.id; });
        if (existing) existing.quantity += 1;
        else cart.push({ id: product.id, quantity: 1 });
        saveData(CART_KEY, cart);
        updateCartLinks();
        alert(product.name + ' added to your cart.');
    }
    function openDetails(product) {
        var products = readData(PRODUCTS_KEY, {});
        products[product.id] = product;
        saveData(PRODUCTS_KEY, products);
        window.location.href = 'product.html?id=' + encodeURIComponent(product.id);
    }
    function makeProductCard(product, showButton) {
        var card = document.createElement('div');
        card.className = 'product-item';
        var image = document.createElement('img');
        image.src = product.image;
        image.alt = product.name;
        image.tabIndex = 0;
        image.addEventListener('click', function () { openDetails(product); });
        var name = document.createElement('h3');
        name.innerText = product.name;
        name.tabIndex = 0;
        name.addEventListener('click', function () { openDetails(product); });
        var price = document.createElement('p');
        price.innerText = money(product.price);
        card.appendChild(image);
        card.appendChild(name);
        card.appendChild(price);
        if (showButton) {
            var button = document.createElement('button');
            button.className = 'cartbutton';
            button.type = 'button';
            button.innerText = 'Add To Cart 🛒';
            button.addEventListener('click', function () { addToCart(product); });
            card.appendChild(button);
        }
        return card;
    }
    function renderRecentlyViewed() {
        if (document.getElementById('recently-viewed')) return;
        var main = document.querySelector('.cataloguemain');
        if (!main || document.body.dataset.page === 'history' || document.body.dataset.page === 'cart' || document.getElementById('product-content')) return;
        var ids = readData(HISTORY_KEY, []);
        var products = readData(PRODUCTS_KEY, {});
        var recent = ids.map(function (id) { return products[id]; }).filter(Boolean).slice(0, 5);
        if (!recent.length) return;
        var section = document.createElement('section');
        section.id = 'recently-viewed';
        var heading = document.createElement('h2');
        heading.innerText = 'Recently Viewed';
        var grid = document.createElement('div');
        grid.className = 'product-grid';
        recent.forEach(function (product) { grid.appendChild(makeProductCard(product, false)); });
        section.appendChild(heading);
        section.appendChild(grid);
        main.appendChild(section);
    }
    function renderCart() {
        var container = document.getElementById('cart-content');
        if (!container) return;
        container.innerHTML = '';
        var cart = readData(CART_KEY, []);
        var products = readData(PRODUCTS_KEY, {});
        if (!cart.length) {
            var empty = document.createElement('div');
            empty.className = 'product-item';
            empty.innerHTML = '<h3>Your cart is empty</h3><p>Pick a style you love and it will appear here.</p><a href="index.html">Continue shopping</a>';
            container.appendChild(empty);
            return;
        }
        var grid = document.createElement('div');
        grid.className = 'product-grid';
        var total = 0;
        cart.forEach(function (item) {
            var product = products[item.id];
            if (!product) return;
            total += product.price * item.quantity;
            var card = document.createElement('div');
            card.className = 'product-item';
            var image = document.createElement('img');
            image.src = product.image;
            image.alt = product.name;
            var name = document.createElement('h3');
            name.innerText = product.name;
            var unit = document.createElement('p');
            unit.innerText = 'Unit price: ' + money(product.price);
            var quantity = document.createElement('p');
            quantity.innerText = 'Quantity: ' + item.quantity;
            var subtotal = document.createElement('p');
            subtotal.innerText = 'Subtotal: ' + money(product.price * item.quantity);
            var less = document.createElement('button');
            less.className = 'cartbutton'; less.type = 'button'; less.innerText = '−';
            less.addEventListener('click', function () { changeQuantity(item.id, -1); });
            var more = document.createElement('button');
            more.className = 'cartbutton'; more.type = 'button'; more.innerText = '+';
            more.addEventListener('click', function () { changeQuantity(item.id, 1); });
            var remove = document.createElement('button');
            remove.className = 'cartbutton'; remove.type = 'button'; remove.innerText = 'Remove';
            remove.addEventListener('click', function () { removeItem(item.id); });
            [image, name, unit, quantity, subtotal, less, more, remove].forEach(function (element) { card.appendChild(element); });
            grid.appendChild(card);
        });
        var totalLine = document.createElement('h2');
        totalLine.innerText = 'Cart total: ' + money(total);
        var checkout = document.createElement('button');
        checkout.className = 'cartbutton'; checkout.type = 'button'; checkout.innerText = 'Checkout';
        checkout.addEventListener('click', function () { window.location.href = 'payment.html'; });
        container.appendChild(grid);
        container.appendChild(totalLine);
        container.appendChild(checkout);
    }
    function changeQuantity(id, amount) {
        var cart = readData(CART_KEY, []);
        var item = cart.find(function (entry) { return entry.id === id; });
        if (item) item.quantity += amount;
        saveData(CART_KEY, cart.filter(function (entry) { return entry.quantity > 0; }));
        updateCartLinks(); renderCart();
    }
    function removeItem(id) {
        saveData(CART_KEY, readData(CART_KEY, []).filter(function (item) { return item.id !== id; }));
        updateCartLinks(); renderCart();
    }
    function renderDetails() {
        var container = document.getElementById('product-content');
        if (!container) return;
        var id = new URLSearchParams(window.location.search).get('id');
        var products = readData(PRODUCTS_KEY, {});
        var product = products[id];
        if (!product) { container.innerHTML = '<div class="product-item"><h3>Product not found</h3><p>Go back to the store and choose a product.</p><a href="index.html">Continue shopping</a></div>'; return; }
        var history = readData(HISTORY_KEY, []).filter(function (savedId) { return savedId !== id; });
        history.unshift(id); saveData(HISTORY_KEY, history.slice(0, 5));
        var card = document.createElement('div'); card.className = 'product-item';
        var image = document.createElement('img'); image.src = product.image; image.alt = product.name; image.style.height = 'auto'; image.style.maxHeight = 'none'; image.style.objectFit = 'contain';
        var name = document.createElement('h2'); name.innerText = product.name;
        var price = document.createElement('h3'); price.innerText = money(product.price);
        var description = document.createElement('p'); description.innerText = product.description;
        var fabric = document.createElement('p'); fabric.innerText = 'Fabric: ' + product.fabric;
        var occasion = document.createElement('p'); occasion.innerText = 'Suitable occasions: ' + product.occasion;
        var care = document.createElement('p'); care.innerText = 'Care: ' + product.care;
        var note = document.createElement('p'); note.innerText = 'Sample information for a student project; check actual product details before purchase.';
        var button = document.createElement('button'); button.className = 'cartbutton'; button.type = 'button'; button.innerText = 'Add To Cart 🛒';
        button.addEventListener('click', function () { addToCart(product); });
        [image, name, price, description, fabric, occasion, care, note, button].forEach(function (element) { card.appendChild(element); });
        container.appendChild(card);
    }
    function renderHistory() {
        var container = document.getElementById('history-content');
        if (!container) return;
        var ids = readData(HISTORY_KEY, []);
        var products = readData(PRODUCTS_KEY, {});
        var grid = document.createElement('div'); grid.className = 'product-grid';
        ids.map(function (id) { return products[id]; }).filter(Boolean).forEach(function (product) { grid.appendChild(makeProductCard(product, false)); });
        if (!grid.children.length) container.innerHTML = '<div class="product-item"><h3>No recently viewed products yet</h3><p>Open a product to add it to your history.</p><a href="index.html">Continue shopping</a></div>';
        else container.appendChild(grid);
    }
    function normalizeSearchText(text) {
        return text.toLowerCase()
            .replace(/t[\s-]*shirts?/g, 'tshirt')
            .replace(/[^a-z0-9]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }
    function applyCatalogFilters() {
        var searchInput = document.querySelector('.search input');
        var query = normalizeSearchText(searchInput ? searchInput.value.trim() : '');
        var selectedCategory = document.querySelector('.category-filter:checked');
        var category = selectedCategory ? selectedCategory.value : 'all';
        var cards = document.querySelectorAll('.cataloguemain .product-grid .product-item');
        var visibleCount = 0;

        cards.forEach(function (card) {
            var heading = card.querySelector('h3');
            var description = card.querySelector('p');
            var searchableText = normalizeSearchText(
                (heading ? heading.innerText : '') + ' ' +
                (description ? description.innerText : '') + ' ' +
                (card.dataset.category || '')
            );
            var matchesSearch = query === '' || searchableText.includes(query);
            var matchesCategory = category === 'all' || card.dataset.category === category;
            card.hidden = !matchesSearch || !matchesCategory;
            if (!card.hidden) visibleCount += 1;
        });

        var main = document.querySelector('.cataloguemain');
        var firstGrid = main ? main.querySelector('.product-grid') : null;
        var message = document.getElementById('search-message');
        if (query && firstGrid) {
            if (!message) {
                message = document.createElement('h2');
                message.id = 'search-message';
                message.setAttribute('aria-live', 'polite');
            }
            message.innerText = visibleCount === 0
                ? 'No matching products found.'
                : visibleCount + ' matching products found';
            main.insertBefore(message, firstGrid);
        } else if (message) {
            message.remove();
        }
    }
    function setupSearch() {
        var input = document.querySelector('.search input');
        var button = document.querySelector('.search button');
        if (!input) return;

        if (button) {
            button.type = 'button';
            button.addEventListener('click', applyCatalogFilters);
        }
    }
    function setupFilters() {
        var filters = Array.from(document.querySelectorAll('.category-filter'));
        if (filters.length === 0) return;
        filters.forEach(function (filter) {
            filter.addEventListener('change', function () {
                var searchInput = document.querySelector('.search input');
                if (searchInput) searchInput.value = '';
                applyCatalogFilters();
            });
        });
        applyCatalogFilters();
    }
    function setupLogin() {
        document.querySelectorAll('.account-view').forEach(function (view) {
            var button = view.querySelector('.login-button');
            if (!button) return;
            button.addEventListener('click', function () {
                var fields = Array.from(view.querySelectorAll('.login-input'));
                var emptyField = fields.find(function (field) { return !field.value.trim(); });
                if (emptyField) { alert('Please fill in ' + (emptyField.labels[0] ? emptyField.labels[0].innerText : 'all required fields') + '.'); emptyField.focus(); return; }
                var email = view.querySelector('input[type="email"]');
                if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { alert('Please enter a valid email address.'); email.focus(); return; }
                var password = view.querySelector('#create-password');
                var confirmation = view.querySelector('#confirm-password');
                if (password && password.value !== confirmation.value) { alert('The passwords do not match.'); confirmation.focus(); return; }
                if (view.id === 'login-view') alert('Login demonstration successful. No account was checked and no password was saved.');
                else if (view.id === 'create-account-view') alert('Account form looks good. This demonstration does not create or save an account.');
                else alert('Password reset demonstration complete. No email was sent.');
            });
        });
    }
    function setupProductLinks() {
        document.querySelectorAll('.product-item').forEach(function (card) {
            var product = getCardProduct(card);
            if (!product) return;
            [card.querySelector('img'), card.querySelector('h3')].forEach(function (element) {
                if (!element) return;
                element.addEventListener('click', function () { openDetails(product); });
                element.addEventListener('keydown', function (event) { if (event.key === 'Enter') openDetails(product); });
            });
        });
    }

    var products = collectProducts();
    document.querySelectorAll('.product-item .cartbutton').forEach(function (button) {
        var card = button.closest('.product-item');
        var current = card ? getCardProduct(card) : null;
        var product = current ? (products[current.id] || current) : null;
        if (product) button.addEventListener('click', function (event) { event.preventDefault(); addToCart(product); });
    });
    setupProductLinks(); setupSearch(); setupFilters(); setupLogin();
    updateCartLinks(); renderCart(); renderDetails(); renderHistory(); renderRecentlyViewed();
    document.querySelectorAll('.hero.shop').forEach(function (button) {
        button.addEventListener('click', function () {
            var grid = document.querySelector('.cataloguemain .product-grid');
            if (grid) grid.scrollIntoView({ behavior: 'smooth' });
            else window.location.href = 'index.html';
        });
    });
}());