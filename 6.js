

document.getElementById('finishOrder').addEventListener('click', function() {
    const selectedItems = [];
    document.querySelectorAll('#menu input[type="radio"]:checked').forEach(function(radio) {
        const itemName = radio.value;
        const quantity = prompt(`Enter quantity for ${itemName}:`, "1");
        if (quantity !== null && quantity.trim() !== "") {
            selectedItems.push(`${itemName} x${quantity}`);
        } else {
            selectedItems.push(`${itemName} x1`); // Default to 1 if no quantity is entered
        }
    });

    if (selectedItems.length === 0) {
        alert("Please select at least one item.");
        return;
    }

    const message = `Orders From Table number : 6\n\n${selectedItems.join('\n')}`;
    const phoneNumber = '919600147626'; // Replace with your WhatsApp number, ensure it's without '+' sign
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    console.log(whatsappUrl); // Log the URL to check
    window.open(whatsappUrl, '_blank');
});



