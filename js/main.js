const modal = new bootstrap.Modal('#modalShoppingCart', {});
const btnModalShoppingCart = document.querySelector('#btnModalShoppingCart');
const cartCount = document.querySelector('#cartCount');
const cartSum = document.querySelector('#cartSum');
const btnSearch = document.querySelector('#btnSearch');
const inputSearch = document.querySelector('#inputSearch');
const listComics = document.querySelector('#listComics');
const modalListComics = document.querySelector('#modalListComics');
const selectSortBy = document.querySelector('#selectSortBy');
const selectCategory = document.querySelector('#selectCategory');
const btnClose = document.querySelector('#btnClose');
const btnConfirm = document.querySelector('#btnConfirm');
const btnApplyFilters = document.querySelector('#btnApplyFilters');

let comics_list = [];

const listShoppingCart = JSON.parse(localStorage.getItem('cart')) || [];
const cart = new Cart(listShoppingCart);

cartCount.innerText = cart.getCount();

inputSearch.addEventListener('input', (event) => {
    const search = event.target.value;
    let filteredList = comics_list.filter((comic) => comic.name.toLowerCase().includes(search));
    filteredList = applyCurrentFilters(filteredList);

    renderComics(filteredList);
});

btnModalShoppingCart.addEventListener('click', function () {
    const list = cart.getComics();
    cartSum.innerText = cart.getSum();

    renderShoppingCart(list);

    modal.show();
})

btnClose.addEventListener('click', () => {
    modal.hide();
})

btnConfirm.addEventListener('click', () => {
    if (cart.getCount() > 0) {
        setTimeout(() => {
            Swal.fire({
                title: "Purchase successfully",
                icon: "success",
                showConfirmButton: false,
                html: "Shopping cart comics coming to you soon.",
                timer: 3000
            });
        }, 1000);
        modal.hide();
        cart.clearCart();
        updateCartInfo();
    } else {
        Swal.fire({
            title: "Error",
            text: "No comics in the shopping cart.",
            icon: "error",
            showConfirmButton: false,
            timer: 1500
        });
    }
})

const renderComics = (list) => {
    listComics.innerHTML = '';

    list.forEach(comic => {
        const bestSellerDiv = comic.popular ? '<div class="label-top shadow-sm">BEST SELLER</div>' : '';
        const lowStockDiv = comic.stock < 5 ? '<div class="label-top-low shadow-sm">LOW STOCK</div>' : '';

        listComics.innerHTML += // html
            `<div class="col">
            <div class="card">
                ${bestSellerDiv}
                ${lowStockDiv}
                <img src="${comic.img}" class="card-img-top img-card" alt="Comic called ${comic.name}" />
                <div class="card-body" id="card-body-without-padding">
                    <h5 class="card-title text">${comic.name}</h5>
                    <span class="price-hp">S/ ${comic.price.toFixed(2)}</span>
                    <div class="d-flex justify-content-center">
                        <button id="${comic.id}" type="button" class="btn btn-outline-dark btnAddComic">
                            Add to cart
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    });

    const btns = document.querySelectorAll('.btnAddComic');
    btns.forEach(btn => {
        btn.addEventListener('click', addToShoppingCart);
    });
};

const calculateDiscount = (total) => {
    let discountText = '';

    if (total > 300) {
        const discountAmount = total * 0.3;
        const discountedTotal = total - discountAmount;
        discountText = `<h6 class="text-end px-5 discount-design">30% discount : - S/ ${discountAmount.toFixed(2)}</h6>`;
        discountText += `<hr><h6 class="text-end px-5">Discounted total : S/ ${discountedTotal.toFixed(2)}</h6>`;
    } else if (total > 150) {
        const discountAmount = total * 0.15;
        const discountedTotal = total - discountAmount;
        discountText = `<h6 class="text-end px-5 discount-design">15% discount : - S/ ${discountAmount.toFixed(2)}</h6>`;
        discountText += `<hr><h6 class="text-end px-5">Discounted total : S/ ${discountedTotal.toFixed(2)}</h6>`;
    } else {
        discountText = '<h6 class="text-end px-5" style="font-size:14px">No hay descuento aplicable</h6>';
    }

    return discountText;
};

const updateCartInfo = () => {
    cartCount.innerText = cart.getCount();
    cartSum.innerText = cart.getSum();

    const total = cart.getSum();
    const discountInfo = calculateDiscount(total);

    const discountElement = document.querySelector('#discountInfo');
    discountElement.innerHTML = discountInfo;
};

const addToShoppingCart = (e) => {
    const id = e.target.id;
    const comic = comics_list.find(item => item.id == id);
    cart.addToShoppingCart(comic);
    updateCartInfo();

    Toastify({
        close: true,
        text: "Comic added to shopping cart  ",
        gravity: 'bottom',
        duration: 3000,
        style: {
            background: "linear-gradient(to right, #FF8787, #ffa16b)",
        },
    }).showToast();
}

const removeFromShoppingCart = (e) => {
    const id = e.currentTarget.getAttribute('data-id');
    cart.removeFromShoppingCart(id);
    updateCartInfo();
    renderShoppingCart(cart.getComics());
};

const renderShoppingCart = (list) => {
    modalListComics.innerHTML = '';
    list.forEach(comic => {
        modalListComics.innerHTML += // html
            `<tr>
                <td style="font-size : 14px"> ${comic.name} </td>
                <td class="text-center" style="font-size : 14px"> ${comic.units}</td>
                <td class="text-center" style="font-size : 14px">S/ ${comic.price.toFixed(2)}</td>
                <td class="text-center" style="font-size : 14px">S/ ${(comic.price * comic.units).toFixed(2)}</td>
                <td class="text-center">
                    <button class="btn btn-danger btn-sm btnRemoveComic" data-id="${comic.id}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>`
    });

    const btnsRemove = document.querySelectorAll('.btnRemoveComic');
    btnsRemove.forEach(btn => {
        btn.addEventListener('click', removeFromShoppingCart);
    });
}

function validatePrices() {
    let minimumPrice = document.getElementById('minimumPrice').value;
    let maximumPrice = document.getElementById('maximumPrice').value;

    if (parseFloat(minimumPrice) > parseFloat(maximumPrice)) {
        document.getElementById('minimumPrice').value = document.getElementById('maximumPrice').value;
    }
}

function applyFilters() {
    const search = inputSearch.value.trim().toLowerCase();
    const sortBy = selectSortBy.value;
    const selectedCategories = Array.from(selectCategory.selectedOptions, option => option.value);
    const minimumPrice = parseFloat(document.getElementById('minimumPrice').value) || 0;
    const maximumPrice = parseFloat(document.getElementById('maximumPrice').value) || Number.MAX_VALUE;

    let filteredList = comics_list.slice();

    filteredList = filteredList.filter((comic) => comic.name.toLowerCase().includes(search));

    filteredList = filteredList.filter((comic) => {
        if (selectedCategories.includes("Uncategorized")) {
            return true;
        }
        return selectedCategories.length === 0 || selectedCategories.includes(comic.category);
    });

    filteredList = filteredList.filter((comic) => {
        return comic.price >= minimumPrice && comic.price <= maximumPrice;
    });

    switch (sortBy) {
        case "higherPrices":
            filteredList.sort((a, b) => b.price - a.price);
            break;
        case "lowerPrices":
            filteredList.sort((a, b) => a.price - b.price);
            break;
        case "bestSeller":
            filteredList = filteredList.filter((comic) => comic.popular);
            break;
        case "lowStock":
            filteredList = filteredList.filter((comic) => comic.stock < 5);
            filteredList.sort((a, b) => a.stock - b.stock);
            break;
        case "deleteSorting":
            break;
    }

    renderComics(filteredList);
}

function applyCurrentFilters(comics) {
    const sortBy = selectSortBy.value;
    const selectedCategories = Array.from(selectCategory.selectedOptions, option => option.value);
    const minimumPrice = parseFloat(document.getElementById('minimumPrice').value) || 0;
    const maximumPrice = parseFloat(document.getElementById('maximumPrice').value) || Number.MAX_VALUE;

    let filteredList = comics.filter((comic) => {
        const categoryMatches = selectedCategories.length === 0 || selectedCategories.includes(comic.category);
        const priceInRange = comic.price >= minimumPrice && comic.price <= maximumPrice;

        return categoryMatches && priceInRange;
    });

    switch (sortBy) {
        case "higherPrices":
            filteredList.sort((a, b) => b.price - a.price);
            break;
        case "lowerPrices":
            filteredList.sort((a, b) => a.price - b.price);
            break;
        case "bestSeller":
            filteredList = filteredList.filter(comic => comic.popular);
            break;
        case "lowStock":
            filteredList = filteredList.filter(comic => comic.stock < 5);
            filteredList.sort((a, b) => a.stock - b.stock);
            break;
    }

    return filteredList;
}

btnApplyFilters.addEventListener('click', function (event) {
    event.preventDefault();
    applyFilters();
});

const getComics = async () => {
    try {
        const endPoint = 'db.json';
        const resp = await fetch(endPoint);
        const json = await resp.json();
        const comics = json.comics;
        comics_list = comics;
        applyFilters();
        updateCartInfo();
        renderComics(comics);

    } catch (error) {
        Swal.fire({
            title: "Error",
            html: 'An error occurred while displaying the comics at this time. Please try again later.',
            icon: "error",
            showConfirmButton: false,
            timer: 3000
        });
        console.log(error);
    }
}

getComics();