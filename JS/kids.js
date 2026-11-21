// KIDS SIZE SELECTOR (my own feature)
// Adds the product to the SAME cart the group's code uses (localStorage),
// but the chosen size is added to the product name and id.
// So "Blue T-shirt" size 2-3 and size 4-5 become two different cart items.

var kidsButtons = document.querySelectorAll('.kidscart');

for (var i = 0; i < kidsButtons.length; i++) {
    kidsButtons[i].onclick = function () {
        var card = this.parentElement;                       // the whole product box
        var name = card.querySelector('h3').innerText;
        var price = Number(card.querySelector('p').innerText.replace(/[^0-9]/g, '')); // "₹499" -> 499
        var image = card.querySelector('img').getAttribute('src');
        var size = card.querySelector('select').value;

        // id is unique for every product + size (image name is included because two products have the same name)
        var id = 'kids-' + (image + '-' + name + '-' + size).toLowerCase().replace(/[^a-z0-9]+/g, '-');

        // save product details (cart page reads them from here)
        var products = JSON.parse(localStorage.getItem('clothingStoreProducts')) || {};
        products[id] = {
            id: id,
            name: name + ' (Size ' + size + ')',
            price: price,
            image: image,
            description: 'Comfortable kids wear. Sample listing for this project.',
            fabric: 'Soft cotton (sample information).',
            occasion: 'Everyday wear and play time.',
            care: 'Machine wash cold.'
        };
        localStorage.setItem('clothingStoreProducts', JSON.stringify(products));

        // add to cart (or increase quantity if already there)
        var cart = JSON.parse(localStorage.getItem('clothingStoreCart')) || [];
        var found = false;
        for (var j = 0; j < cart.length; j++) {
            if (cart[j].id === id) {
                cart[j].quantity = cart[j].quantity + 1;
                found = true;
            }
        }
        if (!found) {
            cart.push({ id: id, quantity: 1 });
        }
        localStorage.setItem('clothingStoreCart', JSON.stringify(cart));

        // update the number in the navbar "Cart 🛒 (3)"
        var total = 0;
        for (var k = 0; k < cart.length; k++) {
            total = total + cart[k].quantity;
        }
        var cartLink = document.querySelector('a.Cart');
        cartLink.innerText = 'Cart 🛒 (' + total + ')';

        alert(name + ' (Size ' + size + ') added to your cart.');
    };
}
