
class Extras {

    // function to return unique values from array
    static onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    static titleCase(str) {
        return str.toLowerCase().split(' ').map((word) => word.replace(word[0], word[0]?word[0].toUpperCase():'')).join(' ');
    }
}

export default Extras;
