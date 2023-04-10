function createLayerFileName(layerName, id, regenerated) {
    let newName = layerName;

    if (layerName.includes('(r)')) {
        newName = layerName.split('(r)')[0];
        return `${newName.trim()} (rx1_regenID_${id}).png`;
    }

    // Check if the string has "(regenerated)"
    if (layerName.includes('(rx')) {
        const [lName, regenerationStats] = layerName.split('(rx');
        let regenerationNumber = regenerationStats.split('_')[0];
        // Increment the number by 1 and return the updated string
        const newNumber = parseInt(regenerationNumber, 10) + 1;
        newName = lName + '(r' + 'x' + newNumber + '_regenID_' + id + ')';
        newName = `${lName}(rx${newNumber}_regenID_${id})`;
    } else {
        if (regenerated) {
            // Append "(regenerated)" to the string and return the updated string
            newName =
                layerName.replace('.png', '') + ' (rx1_regenID_' + id + ')';
        }
    }

    if (newName.includes('.png') === false) {
        newName = newName + '.png';
    }

    return newName;
}

console.log(createLayerFileName('test.png', 1, true));
console.log(createLayerFileName('test (rx1_regenID_1).png', 1, true));
console.log(createLayerFileName('test (rx2_regenID_1).png', 1, true));
console.log(createLayerFileName('test (rx3_regenID_1).png', 1, true));
console.log(createLayerFileName('layer 1', 1, true));
console.log(createLayerFileName('layer 1', 1, false));
