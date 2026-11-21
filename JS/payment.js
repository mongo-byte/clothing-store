/* Frontend-only checkout demonstration; no payment credentials are requested or saved. */
(function () {
    var cartKey = 'clothingStoreCart';
    var productsKey = 'clothingStoreProducts';

    function readStorage(key, fallback) {
        try { return JSON.parse(localStorage.getItem(key)) || fallback; }
        catch (error) { return fallback; }
    }
    function formatMoney(value) {
        return '₹' + Number(value).toLocaleString('en-IN');
    }

    var cart = readStorage(cartKey, []);
    var products = readStorage(productsKey, {});
    var itemsBox = document.getElementById('payment-items');
    var total = 0;
    var itemCount = 0;

    cart.forEach(function (entry) {
        var product = products[entry.id];
        if (!product || entry.quantity < 1) return;
        var lineTotal = product.price * entry.quantity;
        total += lineTotal;
        itemCount += entry.quantity;
        var row = document.createElement('div');
        row.className = 'payment-item';
        var image = document.createElement('img');
        image.src = product.image;
        image.alt = product.name;
        var details = document.createElement('div');
        var name = document.createElement('strong');
        name.innerText = product.name;
        var quantity = document.createElement('p');
        quantity.innerText = 'Qty ' + entry.quantity + ' × ' + formatMoney(product.price);
        var price = document.createElement('strong');
        price.innerText = formatMoney(lineTotal);
        details.appendChild(name);
        details.appendChild(quantity);
        row.appendChild(image);
        row.appendChild(details);
        row.appendChild(price);
        itemsBox.appendChild(row);
    });

    if (itemCount === 0) {
        document.getElementById('payment-layout').hidden = true;
        document.getElementById('payment-empty').hidden = false;
        return;
    }

    document.getElementById('payment-subtotal').innerText = formatMoney(total);
    document.getElementById('payment-total').innerText = formatMoney(total);

    document.getElementById('payment-form').addEventListener('submit', function (event) {
        event.preventDefault();
        var name = document.getElementById('payment-name');
        var email = document.getElementById('payment-email');
        var phone = document.getElementById('payment-phone');
        var address = document.getElementById('payment-address');
        var error = document.getElementById('payment-error');

        error.innerText = '';
        if (!name.value.trim() || !email.value.trim() || !phone.value.trim() || !address.value.trim()) {
            error.innerText = 'Please complete all delivery information fields.';
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
            error.innerText = 'Please enter a valid email address.';
            email.focus();
            return;
        }
        if (!/^[0-9+()\-\s]{7,20}$/.test(phone.value.trim())) {
            error.innerText = 'Please enter a valid phone number.';
            phone.focus();
            return;
        }
        var chosenMethod = document.querySelector('input[name="payment-method"]:checked');
        if (!chosenMethod) {
            error.innerText = 'Please choose a payment method.';
            return;
        }

        document.getElementById('payment-layout').hidden = true;
        document.getElementById('payment-customer').innerText = name.value.trim();
        document.getElementById('payment-success').hidden = false;
        localStorage.removeItem(cartKey);
    });
}());