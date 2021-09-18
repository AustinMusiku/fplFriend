const evaluatePosition = (positionId) => {
    switch (positionId) {
        case 1:
            return 'goalkeeper'
            break;
        case 2:
            return 'defender'
            break;
        case 3:
            return 'midfielder'
            break;
        case 4:
            return 'forward'
            break;
    
        default:
            return 'n/a'
            break;
    }
}

const evaluateTeam = (teamId) => {
    switch (teamId) {
        case 1:
            return 'ars'
            break;
        case 2:
            return 'avl'
            break;
        case 3:
            return 'bre'
            break;
        case 4:
            return 'bha'
            break;
        case 5:
            return 'bur'
            break;
        case 6:
            return 'che'
            break;
        case 7:
            return 'cry'
            break;
        case 8:
            return 'eve'
            break;
        case 9:
            return 'lei'
            break;
        case 10:
            return 'lee'
            break;
        case 11:
            return 'liv'
            break;
        case 12:
            return 'mci'
            break;
        case 13:
            return 'mun'
            break;
        case 14:
            return 'new'
            break;
        case 15:
            return 'nor'
            break;
        case 16:
            return 'sou'
            break;
        case 17:
            return 'tot'
            break;
        case 18:
            return 'wat'
            break;
        case 19:
            return 'whu'
            break;
        case 20:
            return 'wol'
            break;
        default:
            return 'n/a'
            break;
    }
}

const evalutePriceChange = (priceChange) => {
    if(priceChange == 1){ return 'rise' } 
    if(priceChange == 0){ return 'equal' } 
    if(priceChange == -1){ return 'fall' } 
}
