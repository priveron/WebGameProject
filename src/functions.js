export function setKeyDown(keys, event) {
    switch (event.keyCode) {
        case 90: // z
            keys.forward = true
            break
        case 81: //q
            keys.left = true
            break
        case 83: // s
            keys.backward = true
            break
        case 68: //d
            keys.right = true
            break
        case 32: //space
            keys.space = true
            break
        case 16: //shift
            keys.shift = true
            break
    }
}

export function setKeyUp(keys, event) {
    switch (event.keyCode) {
        case 90: // z
            keys.forward = false
            break
        case 81: //q
            keys.left = false
            break
        case 83: // s
            keys.backward = false
            break
        case 68: //d
            keys.right = false
            break
        case 32: //space
            keys.space = false
            break
        case 16: //shift
            keys.shift = false
            break
    }
}