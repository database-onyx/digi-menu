let menuItems = [];
// Use global orderItemsArray array to share with index1.js
if (typeof window.orderItemsArray === 'undefined') {
    window.orderItemsArray = [];
}
let orderItemsArray = window.orderItemsArray;

// Constants
const ORDER_EXPIRY_TIME = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

// Function to load menu items from an external JSON file
function loadMenuItems() {
    fetch('categories/menu.json')
        .then(response => response.json())
        .then(data => {
            menuItems = data;
            displayMenuItems(menuItems);
            // Load ordered items from localStorage on page load
            loadOrders();
        })
        .catch(error => console.error('Error fetching menu items:', error));
}

// Load menu items and orders on page load
loadMenuItems();

// Function to display menu items
function displayMenuItems(items) {
    const menuItemsContainer = document.getElementById('menu-items');
    menuItemsContainer.innerHTML = '';
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'col-6 col-md-4 mt-3';
        itemElement.innerHTML = `
            <div class="card">
                <div class="card-body d-flex flex-column justify-content-between" data-id="${item.id}" data-item="${item.item}" data-name="${item.name}" data-price="${item.price}">
                    <div class="text-left ${item.isVeg ? 'text-success' : 'text-danger'}">
                        ${item.isVeg 
                            ? '<img src="images/v.png" style="width: 15%;">' 
                            : '<img src="images/nv.png" style="width: 15%;">'}
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
        `;
        menuItemsContainer.appendChild(itemElement);

        // Add event listeners for increment and decrement buttons
        const incrementBtn = itemElement.querySelector('.increment-btn');
        const decrementBtn = itemElement.querySelector('.decrement-btn');
        const countValue = itemElement.querySelector('.count-value');

        incrementBtn.addEventListener('click', () => {
            let count = parseInt(countValue.textContent);
            count++;
            countValue.textContent = count;
            updateOrderedItems(item.id, item.item, item.name, item.price, count);
        });

        decrementBtn.addEventListener('click', () => {
            let count = parseInt(countValue.textContent);
            if (count > 0) {
                count--;
                countValue.textContent = count;
                updateOrderedItems(item.id, item.item, item.name, item.price, count);
            }
        });
        
        // Set initial count value if item exists in orderItemsArray
        const uniqueKey = `${item.id}-${item.item}`;
        const globalOrderItems = window.orderItemsArray || orderItemsArray;
        const existingOrder = globalOrderItems.find(order => order.key === uniqueKey);
        if (existingOrder) {
            countValue.textContent = existingOrder.quantity;
        }
    });
}

// Function to update or add items to the order
function updateOrderedItems(id, item, name, price, count) {
    // Use global orderItemsArray array
    let globalOrderItems = window.orderItemsArray || orderItemsArray;
    
    // Create a unique key using itemId and itemNo to track individual dishes (same as index1.js)
    let uniqueKey = `${id}-${item}`;
    
    let itemIndex = globalOrderItems.findIndex(order => order.key === uniqueKey);
    
    if (count === 0 && itemIndex !== -1) {
        // If quantity is 0, remove the item from the order
        globalOrderItems.splice(itemIndex, 1);
    } else if (itemIndex !== -1) {
        // If the item already exists in the order, update the quantity
        globalOrderItems[itemIndex].quantity = count;
    } else {
        // If it's a new item, add it to the order
        globalOrderItems.push({
            key: uniqueKey,
            id: id,
            itemNo: item,
            name: name,
            price: price,
            quantity: count
        });
    }
    
    // Update the global array
    window.orderItemsArray = globalOrderItems;
    
    console.log(globalOrderItems); // For debugging
}

// Function to display ordered items
function displayOrderedItems() {
    console.log("Displaying ordered items:");
    let totalPrice = 0;
    let html = "";

    // Use global orderItemsArray array
    let globalOrderItems = window.orderItemsArray || orderItemsArray;

    if (globalOrderItems.length === 0) {
        html = "<h4 class='mt-3'>No dishes selected</h4>";
    } else {
        globalOrderItems.forEach(item => {
            html += `<h4 class=\"mt-3\">${item.name} <span class=\"text-muted pl-5\"> x ${item.quantity}</span></h4>`;
            totalPrice += item.price * item.quantity;
        });
    }

    const orderedItemsElement = document.getElementById("orderItems");
    if (orderedItemsElement) {
        orderedItemsElement.innerHTML = html;
    } else {
        console.error("Error: No element with ID 'orderItems' found.");
    }
}

// Function to save orders to localStorage
function saveOrders() {
    const globalOrderItems = window.orderItemsArray || orderItemsArray;
    const orderData = {
        timestamp: new Date().getTime(),
        orderItems: globalOrderItems
    };
    localStorage.setItem('orderItems', JSON.stringify(orderData));
}

// Function to load orders from localStorage
function loadOrders() {
    const orderData = localStorage.getItem('orderItems');
    if (orderData) {
        const parsedOrderData = JSON.parse(orderData);
        const currentTime = new Date().getTime();
        if (currentTime - parsedOrderData.timestamp < ORDER_EXPIRY_TIME) {
            window.orderItemsArray = parsedOrderData.orderItems;
            orderItemsArray = window.orderItemsArray;
            displayOrderedItems();
        } else {
            clearOrders();
        }
    }
}

// Function to clear orders from localStorage
function clearOrders() {
    window.orderItemsArray = [];
    orderItemsArray = window.orderItemsArray;
    localStorage.removeItem('orderItems');
    displayOrderedItems();
}

// Function to search items
function searchItems() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const filteredItems = menuItems.filter(item => item.name.toLowerCase().includes(searchInput));
    displayMenuItems(filteredItems);
}

// Event listener for search input
document.getElementById('searchInput').addEventListener('input', searchItems);

// Event listener for order button
document.getElementById('viewOrder').addEventListener('click', function() {
    console.log('Order button clicked from search.js');
    console.log('Current orderItems:', window.orderItemsArray);
    showOrderPopup();
});

// Function to show order popup
function showOrderPopup() {
    console.log('showOrderPopup called from search.js');
    console.log('Global orderItems:', window.orderItemsArray);
    
    // Generate the ordered items HTML dynamically
    let orderItemsContent = '';
    if (window.orderItemsArray && window.orderItemsArray.length > 0) {
        orderItemsContent = window.orderItemsArray.map(item => {
            return `<div class=\"order-item\"><span>${item.name} &nbsp; (x${item.quantity})</span></div>`;
        }).join('');
    } else {
        orderItemsContent = '<div>No items selected</div>';
    }
    
    // Update the #orderItems div with the generated HTML
    const orderItemsElement = document.getElementById('orderItems');
    if (orderItemsElement) {
        orderItemsElement.innerHTML = orderItemsContent;
    }
    
    document.getElementById('orderPopup').style.display = 'block';
}

// Make showOrderPopup globally accessible
window.showOrderPopup = showOrderPopup;

// Function to close order popup
function closeOrderPopup() {
    document.getElementById('orderPopup').style.display = 'none';
}

// Make closeOrderPopup globally accessible
window.closeOrderPopup = closeOrderPopup;
