
const items = [{ "menu_item_id": 1, "quantity": 2 }];
const restaurantMenu = [
    { "id": 1, "name": "Whopper", "is_available": true }
];

// Logic from orderService.js
const itemIds = items.map(item => item.menu_item_id || item.id);
console.log('Item IDs:', itemIds);

// Logic from restaurantService.js
const validItems = restaurantMenu.filter(item =>
    itemIds.includes(item.id) && item.is_available
);
console.log('Valid Items:', validItems);

if (validItems.length !== itemIds.length) {
    console.log('ERROR: Some items unavailable');
} else {
    console.log('SUCCESS: All items valid');
}
