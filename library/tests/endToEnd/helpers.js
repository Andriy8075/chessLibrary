function arePositionsEqual(position1, position2) {
    if (!position1 || !position2) return false;
    if (position1.length !== 8 || position2.length !== 8) return false;
    
    for (let row = 0; row < 8; row++) {
        if (position1[row].length !== 8 || position2[row].length !== 8) {
            return false;
        }
        
        for (let col = 0; col < 8; col++) {
            const piece1 = position1[row][col];
            const piece2 = position2[row][col];
            
            if (!piece1 && !piece2) continue;
            
            if (!piece1 || !piece2) return false;
            
            if (piece1.type !== piece2.type || piece1.color !== piece2.color) {
                return false;
            }
        }
    }
    
    return true;
}

module.exports = {
    arePositionsEqual
};

