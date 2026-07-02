(function () {
    "use strict";

    var API_BASE = "http://localhost/krishloom-vastram/backend/routes/";
    var BACKEND_BASE = "http://localhost/krishloom-vastram/backend/";
    var STORE_SCRIPT_BASE = (document.currentScript && document.currentScript.src || "").replace(/assets\/js\/user-store\.js(?:\?.*)?$/, "");

    function storePageUrl(page) {
        return STORE_SCRIPT_BASE ? STORE_SCRIPT_BASE + page : page;
    }

    var LOGIN_PAGE = storePageUrl("user_login_sign.html");
    var DASHBOARD_PAGE = storePageUrl("../../User%20dashboard/user-dashboard.html");

    function parseStoredUser() {
        var user = null;
        try {
            user = JSON.parse(sessionStorage.getItem("user") || "null");
        } catch (e) {
            user = null;
        }
        return user;
    }

    function getUserId() {
        var user = parseStoredUser();
        return (user && (user.id || user.user_id)) || sessionStorage.getItem("user_id") || "";
    }

    function showMessage(message, type) {
        var snackbar = document.getElementById("globalSnackbar");
        if (!snackbar) {
            snackbar = document.createElement("div");
            snackbar.id = "globalSnackbar";
            document.body.appendChild(snackbar);
        }
        snackbar.textContent = message;
        snackbar.className = "show " + (type || "success");
        setTimeout(function () {
            snackbar.className = snackbar.className.replace("show", "").trim();
        }, 3500);
    }

    function injectStoreStyles() {
        if (document.getElementById("krishloomStoreStyles")) return;
        var style = document.createElement("style");
        style.id = "krishloomStoreStyles";
        style.textContent = [
            "#profileIconItem{display:none!important}",
            "#profileIconItem.auth-visible{display:list-item!important}",
            "#profileImg{display:none}",
            "#profileImg.has-photo{display:block!important}",
            "#profileDefaultIcon.has-photo{display:none!important}",
            "#globalSnackbar{visibility:hidden;min-width:280px;background:#333;color:#fff;text-align:left;border-radius:8px;padding:16px 20px;position:fixed;z-index:1000000;right:24px;top:24px;font-size:14px;font-weight:600;box-shadow:0 10px 30px rgba(0,0,0,.2);transition:opacity .3s ease,transform .3s ease;opacity:0;transform:translateY(-20px)}",
            "#globalSnackbar.show{visibility:visible;opacity:1;transform:translateY(0)}",
            "#globalSnackbar.success{background:#fff;color:#1e8449;border-left:6px solid #2ecc71}",
            "#globalSnackbar.error{background:#fff;color:#c0392b;border-left:6px solid #e74c3c}",
            ".wishlist-btn-top-right{position:absolute;top:12px;right:12px;z-index:10;background:rgba(255,255,255,.9);border:0;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.15);cursor:pointer;color:#333;transition:all .3s ease}",
            ".wishlist-btn-top-right:hover{background:#fff;transform:scale(1.1);color:#ff4545}",
            ".wishlist-btn-top-right svg{width:18px;height:18px;transition:fill .3s ease,stroke .3s ease,color .3s ease}",
            ".wishlist-btn-top-right.active,.wishlist a.active{color:#ff4545!important}",
            ".wishlist-btn-top-right.active svg{fill:#ff4545!important;stroke:#ff4545!important}",
            ".wishlist a.active .icon-heart,.wishlist a.active .icon{color:#ff4545!important}"
        ].join("\n");
        document.head.appendChild(style);
    }

    function requireLogin() {
        if (getUserId()) return true;
        sessionStorage.setItem("redirectAfterLogin", window.location.href);
        showMessage("Not login. Please login.", "error");
        setTimeout(function () {
            window.location.href = LOGIN_PAGE;
        }, 900);
        return false;
    }

    function requireLoginForUrl(url) {
        if (getUserId()) return true;
        sessionStorage.setItem("redirectAfterLogin", url || window.location.href);
        showMessage("Not login. Please login.", "error");
        setTimeout(function () {
            window.location.href = LOGIN_PAGE;
        }, 900);
        return false;
    }

    function apiRequest(url, method, body) {
        return fetch(url, {
            method: method || "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: body ? JSON.stringify(body) : undefined
        }).then(function (response) {
            return response.text().then(function (text) {
                var data = {};
                try {
                    data = text ? JSON.parse(text) : {};
                } catch (e) {
                    data = { status: response.ok, message: text };
                }
                if (!response.ok) {
                    throw data;
                }
                return data;
            });
        });
    }

    function normalizeItems(result) {
        if (Array.isArray(result)) return result;
        if (!result || typeof result !== "object") return [];
        if (Array.isArray(result.data)) return result.data;
        if (Array.isArray(result.cart)) return result.cart;
        if (Array.isArray(result.wishlist)) return result.wishlist;
        if (Array.isArray(result.items)) return result.items;
        return [];
    }

    function money(value) {
        var num = parseFloat(value || 0);
        if (isNaN(num)) num = 0;
        return "₹" + num.toLocaleString("en-IN", {
            minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
            maximumFractionDigits: 2
        });
    }

    function imageUrl(value) {
        if (!value) return "assets/images/product/product.jpg";
        if (/^https?:\/\//i.test(value)) return value;
        return BACKEND_BASE + String(value).split("/").map(encodeURIComponent).join("/");
    }

    function itemProductId(item) {
        return item.product_id || item.id || item.pid || item.productId;
    }

    function itemName(item) {
        return item.product_title || item.product_name || item.name || item.title || "Product";
    }

    function itemPrice(item) {
        return item.selling_price || item.price || item.product_price || item.mrp || 0;
    }

    function itemImage(item) {
        return item.main_image || item.product_image || item.image || item.image_url || "";
    }

    function findProductId(target) {
        var card = target && target.closest ? target.closest(".card-product,[data-product-id]") : null;
        if (card && card.dataset.productId) return card.dataset.productId;

        var button = target && target.closest ? target.closest("[data-product-id]") : null;
        if (button && button.dataset.productId) return button.dataset.productId;

        // Priority: Use the cart product ID (parent product for gallery items)
        if (window.krishloomCartProductId) return window.krishloomCartProductId;
        
        var params = new URLSearchParams(window.location.search);
        if (params.get("id")) return params.get("id");
        if (window.krishloomCurrentProductId) return window.krishloomCurrentProductId;

        try {
            var selected = JSON.parse(sessionStorage.getItem("selectedProduct") || "null");
            return selected && (selected.id || selected.product_id || selected.pid);
        } catch (e) {
            return "";
        }
    }

    function attachProductIdsFromApi() {
        fetch(BACKEND_BASE + "routes/productApi.php?route=getProducts")
            .then(function (response) { return response.json(); })
            .then(function (result) {
                var products = normalizeItems(result).filter(function (product) {
                    return !product.image_type || product.image_type === "main";
                });
                var seen = {};
                document.querySelectorAll(".card-product").forEach(function (card, index) {
                    if (card.dataset.productId) return;
                    var product = products[index % products.length];
                    if (!product) return;
                    card.dataset.productId = product.id;
                    card.dataset.productName = product.product_title || "";
                    seen[product.id] = true;

                    card.querySelectorAll(".product-img,.name-product,.prd_name").forEach(function (link) {
                        if (link.tagName === "A") link.href = "product-detail.html?id=" + encodeURIComponent(product.id);
                    });
                    card.querySelectorAll(".wishlist a,.product-action_remove,.btn-action-price,.tf-btn").forEach(function (el) {
                        el.dataset.productId = product.id;
                    });
                });
            })
            .catch(function (error) {
                console.warn("Unable to attach product ids", error);
            });
    }

    function addWishlist(productId) {
        if (!requireLogin()) return Promise.reject();
        return apiRequest(API_BASE + "wishlistApi.php?route=addWishlist", "POST", {
            user_id: getUserId(),
            product_id: productId
        }).then(function (result) {
            if (result && result.status === false) throw result;
            showMessage(result.message || "Added to wishlist.", "success");
            return result;
        });
    }

    function removeWishlist(productId) {
        return apiRequest(API_BASE + "wishlistApi.php?route=removeWishlist", "POST", {
            user_id: getUserId(),
            product_id: productId
        }).then(function (result) {
            if (result && result.status === false) throw result;
            return result;
        });
    }

    function getWishlistIds() {
        if (!getUserId()) return Promise.resolve([]);
        return apiRequest(API_BASE + "wishlistApi.php?route=getWishlist&user_id=" + encodeURIComponent(getUserId()))
            .then(function (result) {
                return normalizeItems(result).map(function (item) {
                    return String(itemProductId(item));
                }).filter(Boolean);
            })
            .catch(function () {
                return [];
            });
    }

    function setWishlistActive(el, active) {
        if (!el) return;
        el.classList.toggle("active", !!active);
        el.setAttribute("aria-pressed", active ? "true" : "false");
        var tooltip = el.querySelector(".tooltip");
        if (tooltip) tooltip.textContent = active ? "Remove from Wishlist" : "Add to Wishlist";
    }

    function syncWishlistButtons() {
        getWishlistIds().then(function (ids) {
            var idSet = {};
            ids.forEach(function (id) {
                idSet[id] = true;
            });
            document.querySelectorAll(".card-product [data-product-id].js-add-wishlist,.card-product .wishlist-btn-top-right,.card-product .wishlist a").forEach(function (button) {
                var productId = findProductId(button);
                setWishlistActive(button, !!idSet[String(productId)]);
            });
            document.querySelectorAll(".wishlist-count").forEach(function (count) {
                count.textContent = ids.length;
            });
        });
    }

    function scheduleWishlistSync() {
        if (!getUserId()) return;
        clearTimeout(scheduleWishlistSync.timer);
        scheduleWishlistSync.timer = setTimeout(syncWishlistButtons, 250);
    }

    function addCart(productId, quantity) {
        if (!requireLogin()) return Promise.reject();
        return apiRequest(API_BASE + "cartApi.php?route=addCart", "POST", {
            user_id: getUserId(),
            product_id: productId,
            quantity: quantity || 1
        }).then(function (result) {
            if (result && result.status === false) throw result;
            showMessage(result.message || "Added to cart.", "success");
            updateCartCount();
            return result;
        });
    }

    function updateCart(productId, quantity) {
        return apiRequest(API_BASE + "cartApi.php?route=updateQuantity", "PUT", {
            user_id: getUserId(),
            product_id: productId,
            quantity: quantity
        }).then(function (result) {
            if (result && result.status === false) throw result;
            updateCartCount();
            return result;
        });
    }

    function removeCart(productId) {
        return apiRequest(API_BASE + "cartApi.php?route=removeCart", "POST", {
            user_id: getUserId(),
            product_id: productId
        });
    }

    function renderMiniCart(items) {
        var miniCartWrap = document.querySelector("#shoppingCart .tf-mini-cart-items");
        if (!miniCartWrap) return;
        
        var bottomWrap = document.querySelector("#shoppingCart .tf-mini-cart-bottom");
        
        if (!items || !items.length) {
            miniCartWrap.innerHTML = '<div class="box-text_empty type-shop_cart">' +
                '<div class="shop-empty_top">' +
                '<span class="icon"><i class="icon-Handbag"></i></span>' +
                '<h4 class="text-emp">Your cart is empty</h4>' +
                '<p class="cl-text-2">Your cart is currently empty. Let us assist you in finding the right product</p>' +
                '</div>' +
                '<div class="shop-empty_bot">' +
                '<a href="shop-default.html" class="tf-btn animate-btn">Shopping </a>' +
                '<a href="index.html" class="tf-btn btn-stroke">Back to home </a>' +
                '</div></div>';
            if (bottomWrap) bottomWrap.style.display = 'none';
            document.querySelectorAll("#shoppingCart .tf-totals-total-value").forEach(function(el) { el.textContent = money(0); });
            return;
        }
        
        if (bottomWrap) bottomWrap.style.display = 'block';

        var subtotal = 0;
        miniCartWrap.innerHTML = items.map(function(item) {
            var productId = itemProductId(item);
            var qty = parseInt(item.quantity || item.qty || 1, 10) || 1;
            var price = parseFloat(itemPrice(item)) || 0;
            subtotal += price * qty;
            
            return '<div class="tf-mini-cart-item file-delete" data-product-id="' + productId + '">' +
                '<div class="tf-mini-cart-image">' +
                '<a href="product-detail.html?id=' + productId + '"><img loading="lazy" width="100" height="133" src="' + imageUrl(itemImage(item)) + '" alt="Image Product"></a>' +
                '</div>' +
                '<div class="tf-mini-cart-info">' +
                '<a href="product-detail.html?id=' + productId + '" class="name fw-medium link text-line-clamp-1">' + itemName(item) + '</a>' +
                '</div>' +
                '<div class="tf-mini-cart-price">' +
                '<div class="tf-btn-line-3 type-primary remove cs-pointer" data-product-id="' + productId + '"><span class="text-caption-01 fw-semibold">Remove</span></div>' +
                '<div class="fw-semibold d-flex align-items-center justify-content-between gap-4">' +
                '<span class="number">' + qty + '</span><span>x</span><span class="price tf-mini-card-price">' + money(price) + '</span>' +
                '</div></div></div>';
        }).join("");
        
        document.querySelectorAll("#shoppingCart .tf-totals-total-value").forEach(function(el) { el.textContent = money(subtotal); });
    }

    function updateCartCount() {
        if (!getUserId()) return;
        apiRequest(API_BASE + "cartApi.php?route=getCart&user_id=" + encodeURIComponent(getUserId()))
            .then(function (result) {
                var items = normalizeItems(result);
                var total = items.reduce(function (sum, item) {
                    return sum + (parseInt(item.quantity || item.qty || 1, 10) || 1);
                }, 0);
                document.querySelectorAll(".shop-cart .count,.toolbar-count").forEach(function (count) {
                    count.textContent = total;
                });
                renderMiniCart(items);
            })
            .catch(function () {});
    }

    function renderWishlistPage() {
        var wrapper = document.querySelector(".wrapper-wishlist");
        if (!wrapper) return;
        if (!requireLogin()) return;

        apiRequest(API_BASE + "wishlistApi.php?route=getWishlist&user_id=" + encodeURIComponent(getUserId()))
            .then(function (result) {
                var items = normalizeItems(result);
                if (!items.length) {
                    wrapper.innerHTML = '<div class="text-center w-100 py-5"><h5>Your wishlist is empty</h5><a class="tf-btn animate-btn mt-3" href="shop.html">Continue Shopping</a></div>';
                    return;
                }
                wrapper.innerHTML = items.map(function (item) {
                    var productId = itemProductId(item);
                    return '<div class="card-product" data-product-id="' + productId + '">'
                        + '<div class="card-product_wrapper">'
                        + '<a href="product-detail.html?id=' + productId + '" class="product-img">'
                        + '<img class="img-product" loading="lazy" width="330" height="440" src="' + imageUrl(itemImage(item)) + '" alt="Product">'
                        + '<img class="img-hover" loading="lazy" width="330" height="440" src="' + imageUrl(itemImage(item)) + '" alt="Product">'
                        + '</a>'
                        + '<button class="wishlist-btn-top-right active js-add-wishlist" data-product-id="' + productId + '" aria-label="Remove from wishlist" aria-pressed="true">'
                        + '<svg width="20" height="20" viewBox="0 0 24 24" fill="#ff4545" stroke="#ff4545" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
                        + '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>'
                        + '</svg></button>'
                        + '<div class="product-action_bot"><a href="#;" class="tf-btn btn-white small w-100 js-add-cart" data-product-id="' + productId + '">Add To Cart</a></div>'
                        + '</div>'
                        + '<div class="card-product_info">'
                        + '<a href="product-detail.html?id=' + productId + '" class="name-product lh-24 fw-medium link-underline-text">' + itemName(item) + '</a>'
                        + '<div class="price-wrap"><span class="price-new text-primary fw-semibold">' + money(itemPrice(item)) + '</span></div>'
                        + '</div></div>';
                }).join("");
            })
            .catch(function (error) {
                console.error("Wishlist load error", error);
                showMessage((error && error.message) || "Unable to load wishlist.", "error");
            });
    }

    function renderCartPage() {
        var tbody = document.querySelector(".tf-table-page-cart tbody");
        if (!tbody) return;
        if (!requireLogin()) return;

        apiRequest(API_BASE + "cartApi.php?route=getCart&user_id=" + encodeURIComponent(getUserId()))
            .then(function (result) {
                var items = normalizeItems(result);
                if (!items.length) {
                    tbody.innerHTML = '<tr><td colspan="4" class="text-center py-5"><h5>Your cart is empty</h5><a class="tf-btn animate-btn mt-3" href="shop.html">Continue Shopping</a></td></tr>';
                    updateTotals(0);
                    return;
                }
                var subtotal = 0;
                tbody.innerHTML = items.map(function (item) {
                    var productId = itemProductId(item);
                    var qty = parseInt(item.quantity || item.qty || 1, 10) || 1;
                    var price = parseFloat(itemPrice(item)) || 0;
                    subtotal += price * qty;
                    return '<tr class="tf-cart_item each-prd file-delete" data-product-id="' + productId + '">'
                        + '<td class="cart_product">'
                        + '<a href="product-detail.html?id=' + productId + '" class="img-prd"><img loading="lazy" width="100" height="133" src="' + imageUrl(itemImage(item)) + '" alt="Image"></a>'
                        + '<div class="infor-prd"><a href="product-detail.html?id=' + productId + '" class="prd_name fw-medium link lh-24">' + itemName(item) + '</a>'
                        + '<div class="cart_remove tf-btn-line-3 type-primary remove" data-product-id="' + productId + '"><span class="text-caption-01 fw-semibold">Remove</span></div></div>'
                        + '</td>'
                        + '<td class="cart_price each-price fw-semibold text-primary" data-cart-title="Price">' + money(price) + '</td>'
                        + '<td class="cart_quantity" data-cart-title="Quantity"><div class="wg-quantity">'
                        + '<button type="button" class="btn-quantity minus-quantity"><i class="icon icon-minus"></i></button>'
                        + '<input class="quantity-product" type="text" name="number" value="' + qty + '">'
                        + '<button type="button" class="btn-quantity plus-quantity"><i class="icon icon-plus"></i></button>'
                        + '</div></td>'
                        + '<td><div class="cart_total fw-semibold text-primary each-subtotal-price">' + money(price * qty) + '</div></td>'
                        + '</tr>';
                }).join("");
                updateTotals(subtotal);
                updateCartCount();
            })
            .catch(function (error) {
                console.error("Cart load error", error);
                showMessage((error && error.message) || "Unable to load cart.", "error");
            });
    }

    function updateTotals(subtotal) {
        document.querySelectorAll(".box-order-summary .subtotal .total,.each-total-price").forEach(function (el) {
            el.textContent = money(subtotal);
        });
        document.querySelectorAll(".box-order-summary .discount .total").forEach(function (el) {
            el.textContent = money(0);
        });
    }

    function initHeaderAuth() {
        var user = parseStoredUser();
        if (!user && !getUserId()) return;

        document.querySelectorAll("#desktopAuthButtons,#mobileAuthButtons,.js-user-auth-buttons").forEach(function (el) {
            el.style.setProperty("display", "none", "important");
        });
        var profileItem = document.getElementById("profileIconItem");
        if (profileItem) profileItem.classList.add("auth-visible");

        var profileFilename = (user && user.profile_image) || sessionStorage.getItem("profile_image") || "";
        if (profileFilename) {
            var img = document.getElementById("profileImg");
            var ico = document.getElementById("profileDefaultIcon");
            if (img) {
                img.src = BACKEND_BASE + "uploads/" + profileFilename + "?t=" + Date.now();
                img.classList.add("has-photo");
            }
            if (ico) ico.classList.add("has-photo");
        }
    }

    function bindActions() {
        document.addEventListener("click", function (event) {
            var headerWishlist = event.target.closest('.nav-icon-item[href$="wishlist.html"]');
            if (headerWishlist && !getUserId()) {
                event.preventDefault();
                event.stopPropagation();
                requireLoginForUrl(headerWishlist.href);
                return;
            }

            var headerCart = event.target.closest(".shop-cart");
            if (headerCart && !getUserId()) {
                event.preventDefault();
                event.stopPropagation();
                requireLoginForUrl(headerCart.href || storePageUrl("view-cart.html"));
                return;
            }

            var wishlistLink = event.target.closest(".wishlist a,.js-add-wishlist,.wishlist-btn-top-right");
            if (wishlistLink) {
                event.preventDefault();
                event.stopPropagation();
                var wishProductId = findProductId(wishlistLink);
                if (!wishProductId) return showMessage("Product is not ready yet. Please try again.", "error");
                if (wishlistLink.classList.contains("active")) {
                    removeWishlist(wishProductId).then(function () {
                        setWishlistActive(wishlistLink, false);
                        showMessage("Removed from wishlist.", "success");
                        if (wishlistLink.closest(".wrapper-wishlist")) renderWishlistPage();
                    }).catch(function (error) {
                        showMessage((error && error.message) || "Unable to remove wishlist.", "error");
                    });
                } else {
                    addWishlist(wishProductId).then(function () {
                        setWishlistActive(wishlistLink, true);
                    }).catch(function (error) {
                        if (error) showMessage(error.message || "Unable to add wishlist.", "error");
                    });
                }
                return;
            }

            var addCartLink = event.target.closest(".js-add-cart,.btn-action-price,.card-product .product-action_bot .tf-btn,.btn-action-price.tf-btn");
            if (addCartLink) {
                event.preventDefault();
                event.stopPropagation();
                var cartProductId = findProductId(addCartLink);
                var qtyInput = document.querySelector(".tf-product-total-quantity .quantity-product");
                var quantity = qtyInput ? (parseInt(qtyInput.value, 10) || 1) : 1;
                console.log('Add to Cart - Product ID:', cartProductId, 'Quantity:', quantity, 'Window ID:', window.krishloomCartProductId, 'Data ID:', addCartLink.getAttribute('data-product-id'));
                if (!cartProductId) return showMessage("Product is not ready yet. Please try again.", "error");
                addCart(cartProductId, quantity).then(function() {
                    // After adding to cart, open the shopping cart panel
                    var cartOffcanvas = document.getElementById('shoppingCart');
                    if (cartOffcanvas && window.bootstrap && window.bootstrap.Offcanvas) {
                        var offcanvas = new window.bootstrap.Offcanvas(cartOffcanvas);
                        offcanvas.show();
                    }
                }).catch(function (error) {
                    if (error) showMessage(error.message || "Unable to add cart.", "error");
                });
                return;
            }

            var removeWish = event.target.closest(".wrapper-wishlist .product-action_remove");
            if (removeWish) {
                event.preventDefault();
                removeWishlist(findProductId(removeWish)).then(renderWishlistPage).then(function () {
                    showMessage("Removed from wishlist.", "success");
                }).catch(function (error) {
                    showMessage((error && error.message) || "Unable to remove wishlist item.", "error");
                });
                return;
            }

            var removeCartBtn = event.target.closest(".tf-table-page-cart .cart_remove, #shoppingCart .remove");
            if (removeCartBtn) {
                event.preventDefault();
                removeCart(findProductId(removeCartBtn)).then(function() {
                    if (document.querySelector(".tf-table-page-cart tbody")) {
                        renderCartPage();
                    } else {
                        updateCartCount();
                    }
                }).then(function () {
                    showMessage("Removed from cart.", "success");
                }).catch(function (error) {
                    showMessage((error && error.message) || "Unable to remove cart item.", "error");
                });
                return;
            }

            var qtyBtn = event.target.closest(".tf-table-page-cart .btn-quantity");
            if (qtyBtn) {
                event.preventDefault();
                event.stopPropagation();
                var row = qtyBtn.closest("[data-product-id]");
                var input = row && row.querySelector(".quantity-product");
                if (!row || !input) return;
                var qty = parseInt(input.value, 10) || 1;
                qty = qtyBtn.classList.contains("minus-quantity") ? Math.max(1, qty - 1) : qty + 1;
                input.value = qty;
                var priceEl = row.querySelector(".each-price");
                var totalEl = row.querySelector(".each-subtotal-price");
                var price = priceEl ? parseFloat(priceEl.textContent.replace(/[^0-9.]/g, "")) || 0 : 0;
                if (totalEl) totalEl.textContent = money(price * qty);
                updateCart(row.dataset.productId, qty).then(renderCartPage).catch(function (error) {
                    showMessage((error && error.message) || "Unable to update quantity.", "error");
                });
            }
        }, true);

        document.addEventListener("change", function (event) {
            var input = event.target.closest(".tf-table-page-cart .quantity-product");
            if (!input) return;
            var row = input.closest("[data-product-id]");
            if (!row) return;
            var qty = Math.max(1, parseInt(input.value, 10) || 1);
            input.value = qty;
            updateCart(row.dataset.productId, qty).then(renderCartPage).catch(function (error) {
                showMessage((error && error.message) || "Unable to update quantity.", "error");
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        injectStoreStyles();
        initHeaderAuth();
        bindActions();
        attachProductIdsFromApi();
        updateCartCount();
        renderWishlistPage();
        renderCartPage();
if (getUserId()) {
    syncWishlistButtons();
}      
    });

    window.KrishloomStore = {
        getUserId: getUserId,
        requireLogin: requireLogin,
        addWishlist: addWishlist,
        removeWishlist: removeWishlist,
        syncWishlistButtons: syncWishlistButtons,
        addCart: addCart,
        renderWishlistPage: renderWishlistPage,
        renderCartPage: renderCartPage
    };
})();
