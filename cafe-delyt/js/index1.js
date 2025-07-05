$(document).ready(function () {
    // Use global orderItemsArray array to share with search.js
    if (typeof window.orderItemsArray === 'undefined') {
        window.orderItemsArray = [];
    }
    let orderItemsArray = window.orderItemsArray;

    // Function to load the menu from JSON and filter based on category and vegetarian status
    function loadMenu(category, vegFilter = 'all') {
        $.getJSON('categories/menu.json', function (data) {
            $('#menu-items').empty(); // Clear existing items

            // Filter menu items based on the selected category and veg/non-veg filters
            let filteredItems = data.filter(function (item) {
                let categoryMatch = item.category === category;

                let vegMatch = true;
                if (vegFilter === 'veg') {
                    vegMatch = item.isVeg === true;
                } else if (vegFilter === 'nonVeg') {
                    vegMatch = item.isNonVeg === true;
                }

                return categoryMatch && vegMatch;
            });

            var subcategoriesDisplayed = {}; // To keep track of displayed subcategories

            // Display filtered menu items
            filteredItems.forEach(function (item) {
                if (!subcategoriesDisplayed[item.sub]) {
                    $('#menu-items').append(`<div class="col-12 mb-2 mt-2"><h3>${item.sub}</h3></div>`);
                    subcategoriesDisplayed[item.sub] = true;
                }
                

                var vegIcon = item.isVeg 
                ? '<img src="images/v.png" style="width: 15%;">' 
                : '<img src="images/nv.png" style="width: 15%;">';
            
                var menuItem = `
                    <div class="col-6 mb-3">
                        <div class="card">
                            <div class="card-body d-flex flex-column justify-content-between" data-id="${item.id}" data-item="${item.item}" data-name="${item.name}" data-price="${item.price}">
                                <div class="text-left ${item.isVeg ? 'text-success' : 'text-danger'}">
                                    ${vegIcon}
                                </div>
                                <div>
                                    <h4 class="text-center">${item.name}</h4>
                                </div>
                                <div class="row">
                                    <div class="col-6 d-flex justify-content-center align-items-center text-success">
                                        ₹ ${item.price}
                                    </div>
                                    <div class="col-6 d-flex justify-content-center align-items-center">
                                        <button class="btn btn-light btn-sm decrement-btn">-</button>
                                        <span class="count-value">0</span>
                                        <button class="btn btn-light btn-sm increment-btn">+</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                $('#menu-items').append(menuItem); // Append the item to the menu
            });

            $('#menu-items').show(); // Show the menu section

            // Add event listeners for increment and decrement buttons
            $('.increment-btn').click(function () {
                let cardBody = $(this).closest('.card-body');
                let itemId = cardBody.data('id');
                let itemNo = cardBody.data('item'); // Get the item number
                let itemName = cardBody.data('name');
                let itemPrice = cardBody.data('price');
                let countValueElem = cardBody.find('.count-value');
                let currentCount = parseInt(countValueElem.text());
                currentCount += 1;
                countValueElem.text(currentCount);
                updateOrder(itemId, itemNo, itemName, itemPrice, currentCount); // Pass both itemId and itemNo
            });

            $('.decrement-btn').click(function () {
                let cardBody = $(this).closest('.card-body');
                let itemId = cardBody.data('id');
                let itemNo = cardBody.data('item'); // Get the item number
                let itemName = cardBody.data('name');
                let itemPrice = cardBody.data('price');
                let countValueElem = cardBody.find('.count-value');
                let currentCount = parseInt(countValueElem.text());

                if (currentCount > 0) {
                    currentCount -= 1;
                    countValueElem.text(currentCount);
                    updateOrder(itemId, itemNo, itemName, itemPrice, currentCount); // Pass both itemId and itemNo
                }
            });
        });
    }

    // Function to update orderItemsArray array
    function updateOrder(itemId, itemNo, itemName, itemPrice, quantity) {
        // Create a unique key using itemId and itemNo to track individual dishes
        let uniqueKey = `${itemId}-${itemNo}`;
        
        let itemIndex = orderItemsArray.findIndex(item => item.key === uniqueKey);
        
        if (quantity === 0 && itemIndex !== -1) {
            // If quantity is 0, remove the item from the order
            orderItemsArray.splice(itemIndex, 1);
        } else if (itemIndex !== -1) {
            // If the item already exists in the order, update the quantity
            orderItemsArray[itemIndex].quantity = quantity;
        } else {
            // If it's a new item, add it to the order
            orderItemsArray.push({
                key: uniqueKey, // Use the unique key for tracking
                id: itemId,
                itemNo: itemNo,
                name: itemName,
                price: itemPrice,
                quantity: quantity
            });
        }

        console.log(orderItemsArray); // For debugging, can be removed later
    }

    // Show the order popup
    $('#viewOrder').click(function () {
        showOrderPopup();
    });
    
    // Make showOrderPopup globally accessible
    window.showOrderPopup = showOrderPopup;

    function showOrderPopup() {
        // Debugging: Check if this function is called
        console.log('showOrderPopup called from index1.js');
        
        // Use global orderItemsArray array
        let globalOrderItems = window.orderItemsArray || orderItemsArray;
        
        // Debugging: Log current order items
        console.log('Current orderItems:', globalOrderItems);
    
        // Generate the ordered items HTML dynamically based on the updated structure
        let orderItemsContent = '';
        if (globalOrderItems && globalOrderItems.length > 0) {
            orderItemsContent = globalOrderItems.map(item => {
                return `
                    <div class="order-item">
                        <span>${item.name} &nbsp; (x${item.quantity})</span>
                    </div>
                `;
            }).join('');
        } else {
            orderItemsContent = '<div>No items selected</div>';
        }
    
        // Debugging: Log the generated HTML content
        console.log('Generated orderItems HTML:', orderItemsContent);
    
        // Update the #orderItems div with the generated HTML
        $('#orderItems').html(orderItemsContent);
    
        // Display the modal
        $('#orderPopup').css('display', 'block');
    }
    
    // Function to close the order popup
    function closeOrderPopup() {
        $('#orderPopup').css('display', 'none');
    }
    
    // Make closeOrderPopup globally accessible
    window.closeOrderPopup = closeOrderPopup;

    // Close modal if clicked outside
    window.onclick = function(event) {
        if (event.target == document.getElementById("orderPopup")) {
            document.getElementById("orderPopup").style.display = "none";
        }
    };
    
    // Category buttons event handlers
    $('#signatureBtn').click(function () {
        loadMenu('Signature', 'all');
        $('.cat-nav').removeClass('active-line');
        $(this).addClass('active-line');
    });
    $('#quickbitesBtn').click(function () {
        loadMenu('Quick Bites', 'all');
        $('.cat-nav').removeClass('active-line');
        $(this).addClass('active-line');
    });
    $('#burgerBtn').click(function () {
        loadMenu('Burger', 'all');
        $('.cat-nav').removeClass('active-line');
        $(this).addClass('active-line');
    });
    $('#sandwichBtn').click(function () {
        loadMenu('Sandwich', 'all');
        $('.cat-nav').removeClass('active-line');
        $(this).addClass('active-line');
    });
    $('#subsandwichBtn').click(function () {
        loadMenu('Sub Sandwich', 'all');
        $('.cat-nav').removeClass('active-line');
        $(this).addClass('active-line');
    });
    $('#rollswrapBtn').click(function () {
        loadMenu('Rolls & Wrap', 'all');
        $('.cat-nav').removeClass('active-line');
        $(this).addClass('active-line');
    });
    $('#pizzaBtn').click(function () {
        loadMenu('Pizza', 'all');
        $('.cat-nav').removeClass('active-line');
        $(this).addClass('active-line');
    });
    $('#maggieBtn').click(function () {
        loadMenu('Maggie', 'all');
        $('.cat-nav').removeClass('active-line');
        $(this).addClass('active-line');
    });
    $('#pastaBtn').click(function () {
        loadMenu('Pasta', 'all');
        $('.cat-nav').removeClass('active-line');
        $(this).addClass('active-line');
    });
    $('#ricebowlBtn').click(function () {
        loadMenu('Rice Bowl', 'all');
        $('.cat-nav').removeClass('active-line');
        $(this).addClass('active-line');
    });
    $('#momosBtn').click(function () {
        loadMenu('Momos', 'all');
        $('.cat-nav').removeClass('active-line');
        $(this).addClass('active-line');
    });
    $('#saladBtn').click(function () {
        loadMenu('Salad', 'all');
        $('.cat-nav').removeClass('active-line');
        $(this).addClass('active-line');
    });
    $('#nachosBtn').click(function () {
        loadMenu('Nachos', 'all');
        $('.cat-nav').removeClass('active-line');
        $(this).addClass('active-line');
    });
    $('#browniesBtn').click(function () {
        loadMenu('Brownies', 'all');
        $('.cat-nav').removeClass('active-line');
        $(this).addClass('active-line');
    });
    $('#sundaesBtn').click(function () {
        loadMenu('Sundaes', 'all');
        $('.cat-nav').removeClass('active-line');
        $(this).addClass('active-line');
    });
    $('#shakesBtn').click(function () {
        loadMenu('Shakes', 'all');
        $('.cat-nav').removeClass('active-line');
        $(this).addClass('active-line');
    });
    $('#faloodaBtn').click(function () {
        loadMenu('Falooda', 'all');
        $('.cat-nav').removeClass('active-line');
        $(this).addClass('active-line');
    });
    $('#slushesBtn').click(function () {
        loadMenu('Slushes', 'all');
        $('.cat-nav').removeClass('active-line');
        $(this).addClass('active-line');
    });
    $('#juiceBtn').click(function () {
        loadMenu('Juice', 'all');
        $('.cat-nav').removeClass('active-line');
        $(this).addClass('active-line');
    });
    $('#beveragesBtn').click(function () {
        loadMenu('Beverages', 'all');
        $('.cat-nav').removeClass('active-line');
        $(this).addClass('active-line');
    });
    $('#baobunBtn').click(function () {
        loadMenu('Bao Bun', 'all');
        $('.cat-nav').removeClass('active-line');
        $(this).addClass('active-line');
    });
    $('#quesadillasBtn').click(function () {
        loadMenu('Quesadillas', 'all');
        $('.cat-nav').removeClass('active-line');
        $(this).addClass('active-line');
    });
    $('#frenchtoastBtn').click(function () {
        loadMenu('French Toast', 'all');
        $('.cat-nav').removeClass('active-line');
        $(this).addClass('active-line');
    });
    $('#smoothiebowlBtn').click(function () {
        loadMenu('Smoothie Bowl', 'all');
        $('.cat-nav').removeClass('active-line');
        $(this).addClass('active-line');
    });
    $('#lasagnaBtn').click(function () {
        loadMenu('Lasagna', 'all');
        $('.cat-nav').removeClass('active-line');
        $(this).addClass('active-line');
    });

    // Add event listeners for Veg/Non-Veg filters
    $('#allButton').click(function () {
        loadMenu('Signature', 'all');
    });

    $('#vegButton').click(function () {
        loadMenu('Signature', 'veg');
    });

    $('#nonVegButton').click(function () {
        loadMenu('Signature', 'nonVeg');
    });

    // Default category load
    loadMenu('Signature', 'all');    
    
});

function offer() {
    // Display the modal when the offer image is clicked
    document.getElementById('imageModal').style.display = 'flex';

    // Get the close button element inside the modal
    const closeBtn = document.querySelector('#imageModal .close-btn');

    // Add click event listener to the close button
    closeBtn.addEventListener('click', function() {
        document.getElementById('imageModal').style.display = 'none';
    });
}