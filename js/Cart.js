class Cart {
    constructor(list = []) {
        this.cart = list;
    }

    addToShoppingCart({ id, name, price }) {
        const index = this.cart.findIndex(comic => comic.id == id);

        if (index == -1) {
            this.cart.push({ id, name, price, units: 1 });
        } else {
            this.cart[index].units += 1;
        }

        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    getComics() {
        return this.cart;
    }

    getCount() {
        const count = this.cart.reduce((cant, comic) => { return cant + comic.units }, 0)
        return count;
    }

    getSum() {
        return this.cart.reduce((acum, comic) => {
            return acum + comic.units * comic.price;
        }, 0).toFixed(2);
    }

    removeFromShoppingCart(id) {
        const index = this.cart.findIndex(comic => comic.id == id);

        if (index !== -1) {
            this.cart.splice(index, 1);
            localStorage.setItem('cart', JSON.stringify(this.cart));
        }
    }

    clearCart() {
        this.cart = [];
        localStorage.removeItem('cart');
    }
}