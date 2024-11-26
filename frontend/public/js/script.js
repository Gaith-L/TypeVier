class TypeRacer {
    constructor(text) {
        Object.defineProperty(this, '_wordsInternal', {
            value: Object.freeze(text.split('')),
            writable: false,
            configurable: false,
        })

        Object.defineProperty(this, '_wordsVisual', {
            value: Object.freeze(text.split(' ')),
            writable: false,
            configurable: false,
        })

        const state = {
            startTime: null,
            endTime: null,
            keyHistory: [], // includes both correct and incorrect key input
            wordHistory: [],
            keyMistakes: [], // a key mistake is a single wrong input (e: 'h', i: 'j')
            wordMistakes: [], // a word mistake is when a wrong input is typed and space is clicked to 'submit' (e: 'The', i: 'Teh')

            currentTypedWord: '',

            currentWordIndex: 0,
            currentLetterIndex: 0,

            currentWPM: 0, // TODO: probably set a timer event every 1 sec that calls a calcWPM func from TypeRacer obj
            finalWPM: 0,
            accuracy: 0,
        }

        this.getState = () => ({
            startTime: state.startTime,
            endTime: state.endTime,
            keyHistory: state.keyHistory,
            wordHistory: state.wordHistory,
            keyMistakes: state.keyMistakes,
            wordMistakes: state.wordMistakes,
            currentTypedWord: state.currentTypedWord,
            currentWordIndex: state.currentWordIndex,
            currentLetterIndex: state.currentLetterIndex,
            currentWPM: state.currentWPM,
            finalWPM: state.finalWPM,
            accuracy: state.accuracy,
        })

        this.startTimer = () => state.startTime = Date.now()
        this.endTimer = () => state.endTime = Date.now()

        this.checkLetter = (event) => {
            event.preventDefault()

            if (state.startTime === null) {
                this.startRace()
            }
            console.log(state.startTime);

            let wordsContainer = document.getElementById('wordsContainer')
            let words = wordsContainer.children

            const expectedCurrentWord = words[state.currentWordIndex]
            let lettersInCurrentWord = expectedCurrentWord.querySelectorAll('.letter')

            if (event.key === 'Backspace' && event.ctrlKey) {
                if (state.currentLetterIndex > 0) {
                    for (let i = state.currentLetterIndex; i > 0; i--) {
                        if (lettersInCurrentWord[state.currentLetterIndex - 1].classList.contains('extra')) {
                            lettersInCurrentWord[state.currentLetterIndex - 1].remove()
                            state.currentLetterIndex--
                        } else {
                            state.currentLetterIndex--
                            lettersInCurrentWord[state.currentLetterIndex].classList.remove("correct", "incorrect")
                        }
                    }
                } else if (state.currentWordIndex > 0 && !(words[state.currentWordIndex - 1].classList.contains("correct")
                    && words[state.currentWordIndex - 1].classList.contains("typed"))) {
                        words[state.currentWordIndex].classList.remove("active")

                        // Go back to previous word and change class list
                        state.currentWordIndex--
                        state.currentLetterIndex = words[state.currentWordIndex].querySelectorAll('.letter').length
                        words[state.currentWordIndex].classList.remove("typed")
                        if (words[state.currentWordIndex].classList.contains("correct")) {
                            words[state.currentWordIndex].classList.remove("correct")
                        } else if (words[state.currentWordIndex].classList.contains("incorrect")) {
                            words[state.currentWordIndex].classList.remove("incorrect")
                        }
                        words[state.currentWordIndex].classList.add("active")

                        lettersInCurrentWord = words[state.currentWordIndex].querySelectorAll('.letter')

                        for (let i = state.currentLetterIndex; i > 0; i--) {
                            if (lettersInCurrentWord[state.currentLetterIndex - 1].classList.contains('extra')) {
                                lettersInCurrentWord[state.currentLetterIndex - 1].remove()
                                state.currentLetterIndex--
                            } else {
                                state.currentLetterIndex--
                                lettersInCurrentWord[state.currentLetterIndex].classList.remove("correct", "incorrect")
                            }
                        }
                    }
            } else if (event.key === 'Backspace') {
                if (state.currentLetterIndex > 0) {
                    if (lettersInCurrentWord[state.currentLetterIndex - 1].classList.contains('extra')) {
                        lettersInCurrentWord[state.currentLetterIndex - 1].remove()
                        state.currentLetterIndex--
                    } else {
                        state.currentLetterIndex--
                        lettersInCurrentWord[state.currentLetterIndex].classList.remove("correct", "incorrect")
                    }
                } else if (state.currentWordIndex > 0 && !(words[state.currentWordIndex - 1].classList.contains("correct")
                    && words[state.currentWordIndex - 1].classList.contains("typed"))) {
                    words[state.currentWordIndex].classList.remove("active")

                    // Go back to previous word and change class list
                    state.currentWordIndex--
                    state.currentLetterIndex = words[state.currentWordIndex].querySelectorAll('.letter').length

                    words[state.currentWordIndex].classList.remove("typed")
                    if (words[state.currentWordIndex].classList.contains("correct")) {
                        words[state.currentWordIndex].classList.remove("correct")
                    } else if (words[state.currentWordIndex].classList.contains("incorrect")) {
                        words[state.currentWordIndex].classList.remove("incorrect")
                    }
                    words[state.currentWordIndex].classList.add("active")
                }
            } else if (event.key === ' ') {
                if (state.currentLetterIndex === lettersInCurrentWord.length) {
                    // Remove "active" from current typed word

                    let hasIncorrectLetter = false
                    lettersInCurrentWord.forEach(letter => {
                        if (letter.classList.contains('incorrect')) {
                            hasIncorrectLetter = true
                        }
                    })

                    if (hasIncorrectLetter) {
                        words[state.currentWordIndex].classList.remove("active")
                        words[state.currentWordIndex].classList.add("incorrect")
                        words[state.currentWordIndex].classList.add("typed")
                    } else {
                        words[state.currentWordIndex].classList.remove("active")
                        words[state.currentWordIndex].classList.add("correct")
                        words[state.currentWordIndex].classList.add("typed")
                    }

                    state.currentWordIndex++
                    state.currentLetterIndex = 0

                    // Set next word to "active"
                    words[state.currentWordIndex].classList.add("active")
                }
            } else if (event.key.length === 1) {
                if (state.currentLetterIndex < lettersInCurrentWord.length) {
                    if (event.key === lettersInCurrentWord[state.currentLetterIndex].textContent) {
                        lettersInCurrentWord[state.currentLetterIndex].classList.add('correct')
                    } else {
                        lettersInCurrentWord[state.currentLetterIndex].classList.add('incorrect')
                    }
                    state.currentLetterIndex++
                } else if (state.currentLetterIndex === lettersInCurrentWord.length) {
                    const extraKeySpan = document.createElement('span')
                    extraKeySpan.classList.add("letter")
                    extraKeySpan.classList.add("incorrect")
                    extraKeySpan.classList.add("extra")
                    extraKeySpan.textContent = event.key
                    words[state.currentWordIndex].appendChild(extraKeySpan)
                    state.currentLetterIndex++
                    words[state.currentWordIndex].offsetHeight;
                }
            }
        }

        this.updateCaret = () => {
            if (state.currentWordIndex === 0 && state.currentLetterIndex === 0) {
                caret.style.animation = "blink 1s step-end infinite"
            } else {
                caret.style.animation = ""
            }
            let wordsContainer = document.getElementById('wordsContainer')
            let words = wordsContainer.children

            const currentWord = words[state.currentWordIndex]
            const letters = currentWord.querySelectorAll(".letter")

            if (state.currentLetterIndex < letters.length) {
                const currentLetter = letters[state.currentLetterIndex]
                caret.style.top = currentLetter.getBoundingClientRect().top + "px"
                caret.style.left = currentLetter.getBoundingClientRect().left + "px"
            } else {
                const lastLetter = letters[letters.length - 1]
                caret.style.top = lastLetter.getBoundingClientRect().top + "px"
                caret.style.left = (lastLetter.getBoundingClientRect().left + lastLetter.offsetWidth) + "px"
            }
        }

        this.getWords = () => Array.from(document.querySelectorAll('.word'))
        this.getWordsVisual = () => this._wordsVisual

        this.startRace = () => {
            state.startTime = Date.now()
            state.keyHistory = [] // includes both correct and incorrect key input
            state.wordHistory = []
            state.keyMistakes = [] // a key mistake is a single wrong input (e 'h' i 'j')
            state.wordMistakes = [] // a word mistake is when a wrong input is typed and space is clicked to 'submit' (e 'The' i 'Teh')
            state.currentTypedWord = ''
            state.currentWordIndex = 0
            state.currentLetterIndex = 0
            state.currentWPM = 0 // TODO: probably set a timer event every 1 sec that calls a calcWPM func from TypeRacer obj
            state.finalWPM = 0
            state.accuracy = 0
        }
    }
}

window.onload = onPageLoad
let resizeTimeout;
window.addEventListener('resize', () => {
    caret.classList.add("hidden")
    game.updateCaret()

    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        caret.classList.remove("hidden")
    }, 200); // Adjust the timeout as needed
});

let wordsContainer = document.getElementById('wordsContainer')
wordsContainer.addEventListener('click', () => {
    input.style.pointerEvents = 'all';
    input.focus();
});

input = document.getElementById('wordsInput')

input.addEventListener('blur', () => {
    input.style.pointerEvents = 'none';
});

startRaceButton = document.getElementById("startRaceButton")
startRaceButton.onclick = () => {
    game.startRace()
    input.value = ''
    input.focus()
    onPageLoad()
}

function onPageLoad() {
    let wordDivs = wordsContainer.children
    wordsContainer.replaceChildren()

    game.getWordsVisual().forEach(word => {
        const wordDiv = document.createElement('div')
        wordDiv.classList.add('word');

        Array.from(word).forEach((letter, idx) => {
            const letterSpan = document.createElement('span')
            letterSpan.textContent = letter
            letterSpan.classList.add('letter');
            wordDiv.appendChild(letterSpan)
        })

        wordsContainer.appendChild(wordDiv)
    })
    game.updateCaret()
    wordDivs[0].classList.add("active")

    input.value = ''
    input.focus()
}

input.addEventListener('keydown', keyPressHandler)
function keyPressHandler(event) {
    const isLetter = event.key.length === 1 && !(event.ctrlKey || event.altKey || event.metaKey)
    const isSpace = event.key === ' '
    const isBackspace = event.key === 'Backspace'
    const isCtrlAndBackspace = (event.ctrlKey && event.key === 'Backspace')

    if (isLetter || isSpace || isBackspace || isCtrlAndBackspace) {
        console.log(event);
        game.checkLetter(event)
        game.updateCaret()
    } else if (event.altKey || event.metaKey) {
        return
    }
}

// let words = "The sun dipped below the horizon, casting a warm orange glow across the tranquil lake. Birds chirped their final melodies of the day as the first stars began to twinkle in the twilight sky. A gentle breeze rustled the leaves of the tall trees lining the water's edge, creating a soothing symphony that harmonized with the soft lapping of the waves. In this serene moment, time seemed to stand still, offering a brief escape from the chaos of everyday life It was a perfect reminder of nature's quiet beauty and the peace it could bring to a restless soul."
// let words = "a sentence for testing the program."
let words = "hastily beneath swimming delicious through banana violently eager despite melted carefully purple jumping yesterday within happily smashed above quantum briskly toward laughing sideways beneath furiously eating whenever sleepy beneath dancing smoothly around between loudly sparkling after gently during breakfast inside leaping softly because zigzagging upward while before quickly alongside mellow instantly outside nervously beyond slippery since wobbling together anxiously quietly"
const game = new TypeRacer(words)

const caret = document.createElement("div");
caret.classList.add("caret");
document.body.appendChild(caret)
