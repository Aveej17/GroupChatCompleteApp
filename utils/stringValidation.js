
function isStringValid(string){
    if(string == undefined || string.length === 0){
        return true;
    }
    return false;
}

module.exports = isStringValid;