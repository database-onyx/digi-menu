$(document).ready(function () {
    // Array to store selected items and quantities
    let orderItems = [];

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
                ? '<img src="../../images/v.png" style="width: 15%;">' 
                : '<img src="../../images/nv.png" style="width: 15%;">';
            
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

    // Function to update orderItems array
    function updateOrder(itemId, itemNo, itemName, itemPrice, quantity) {
        // Create a unique key using itemId and itemNo to track individual dishes
        let uniqueKey = `${itemId}-${itemNo}`;
        
        let itemIndex = orderItems.findIndex(item => item.key === uniqueKey);
        
        if (quantity === 0 && itemIndex !== -1) {
            // If quantity is 0, remove the item from the order
            orderItems.splice(itemIndex, 1);
        } else if (itemIndex !== -1) {
            // If the item already exists in the order, update the quantity
            orderItems[itemIndex].quantity = quantity;
        } else {
            // If it's a new item, add it to the order
            orderItems.push({
                key: uniqueKey, // Use the unique key for tracking
                id: itemId,
                itemNo: itemNo,
                name: itemName,
                price: itemPrice,
                quantity: quantity
            });
        }

        console.log(orderItems); // For debugging, can be removed later
    }
    // Show the order popup
$('#viewOrder').click(function () {
    showOrderPopup();
});


    function showOrderPopup() {
        // Debugging: Check if this function is called
        console.log('showOrderPopup called');
        
        // Debugging: Log current order items
        console.log('Current orderItems:', orderItems);
    
        // Generate the ordered items HTML dynamically based on the updated structure
        let orderItemsContent = orderItems.map(item => {
            return `
                <div class="order-item">
                    <span>${item.name} &nbsp; (x${item.quantity})</span>
                </div>
            `;
        }).join('');
    
        // Debugging: Log the generated HTML content
        console.log('Generated orderItems HTML:', orderItemsContent);
    
        // If no items are selected, display a message
        if (orderItems.length === 0) {
            orderItemsContent = '<div>No items selected</div>';
        }
    
        // Update the #orderItems div with the generated HTML
        $('#orderItems').html(orderItemsContent);
    
        // Display the modal
        $('#orderPopup').css('display', 'block');
    }
    
    // Function to close the order popup
    function closeOrderPopup() {
        $('#orderPopup').css('display', 'none');
    }

    // Close modal if clicked outside
    window.onclick = function(event) {
        if (event.target == document.getElementById("orderPopup")) {
            document.getElementById("orderPopup").style.display = "none";
        }
    };
    

    // Category buttons event handlers
    $('#starterBtn').click(function () {
        loadMenu('STARTERS', 'all');
        $('.cat-nav').removeClass('active-line');
        $(this).addClass('active-line');
    });

    $('#foodBtn').click(function () {
        loadMenu('GRAVY', 'all');
        $('.cat-nav').removeClass('active-line');
        $(this).addClass('active-line');
    });
    
    $('#soupBtn').click(function () {
        loadMenu('SOUPS', 'all');
        $('.cat-nav').removeClass('active-line');
        $(this).addClass('active-line');
    });
    $('#tandooriBtn').click(function () {
        loadMenu('TANDOORI', 'all');
        $('.cat-nav').removeClass('active-line');
        $(this).addClass('active-line');
    }); 
    $('#seafoodBtn').click(function () {
        loadMenu('SEAFOOD', 'all');
        $('.cat-nav').removeClass('active-line');
        $(this).addClass('active-line');
    });
    $('#mainfoodBtn').click(function () {
        loadMenu('RICE-NOODLES', 'all');
        $('.cat-nav').removeClass('active-line');
        $(this).addClass('active-line');
    });
    $('#beveragesBtn').click(function () {
        loadMenu('ICE CREAMS & SOFT DRINKS', 'all');
        $('.cat-nav').removeClass('active-line');
        $(this).addClass('active-line');
    });

    // Add event listeners for Veg/Non-Veg filters
    $('#allButton').click(function () {
        loadMenu('STARTERS', 'all');
    });

    $('#vegButton').click(function () {
        loadMenu('STARTERS', 'veg');
    });

    $('#nonVegButton').click(function () {
        loadMenu('STARTERS', 'nonVeg');
    });

    // Show the order popup
    $('#viewOrder').click(function () {
        showOrderPopup();
    });

    // Default category load
    loadMenu('STARTERS', 'all');    
    
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
