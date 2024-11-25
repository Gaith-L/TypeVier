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
            let wordsContainer = document.getElementById('wordsContainer')
            let words = wordsContainer.children

            const expectedCurrentWord = words[state.currentWordIndex]
            const lettersInCurrentWord = expectedCurrentWord.querySelectorAll('.letter')

            if (event.key === 'Backspace') {
                event.preventDefault()

                if (state.currentLetterIndex > 0) {
                    if (lettersInCurrentWord[state.currentLetterIndex - 1].classList.contains('extra')) {
                        lettersInCurrentWord[state.currentLetterIndex - 1].remove()
                        state.currentLetterIndex--
                    } else {
                        state.currentLetterIndex--
                        lettersInCurrentWord[state.currentLetterIndex].classList.remove("correct", "incorrect")
                    }
                } else if (state.currentWordIndex > 0) {
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
                event.preventDefault()
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
            let wordsContainer = document.getElementById('wordsContainer')
            let words = wordsContainer.children

            const currentWord = words[state.currentWordIndex]
            const letters = currentWord.querySelectorAll(".letter")

            if (state.currentLetterIndex < letters.length) {
                const currentLetter = letters[state.currentLetterIndex]
                caret.style.top = currentLetter.getBoundingClientRect().top + 5 + "px"
                caret.style.left = currentLetter.getBoundingClientRect().left + "px"
            } else {
                const lastLetter = letters[letters.length - 1]
                caret.style.top = lastLetter.getBoundingClientRect().top + 5 + "px"
                caret.style.left = (lastLetter.getBoundingClientRect().left + lastLetter.offsetWidth) + "px"
            }
        }

        this.getWords = () => Array.from(document.querySelectorAll('.word'))
        this.getWordsVisual = () => this._wordsVisual
    }
}

window.onload = onPageLoad
window.onresize = onResize

input = document.getElementById('wordsInput')
input.addEventListener('keydown', keyPressHandler)

function onResize() {
    game.updateCaret()
}

function onPageLoad() {
    let wordsContainer = document.getElementById('wordsContainer')
    let wordDivs = wordsContainer.children

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


function keyPressHandler(event) {
    const isLetter = event.key.length === 1
    const isSpace = event.key === ' '
    const isBackspace = event.key === 'Backspace'

    if (!(isLetter || isSpace || isBackspace) || event.ctrlKey || event.altKey || event.metaKey) {
        return
    }

    game.checkLetter(event)
    game.updateCaret()

    input.value = ''
}

let words = "The sun dipped below the horizon, casting a warm orange glow across the tranquil lake. Birds chirped their final melodies of the day as the first stars began to twinkle in the twilight sky. A gentle breeze rustled the leaves of the tall trees lining the water's edge, creating a soothing symphony that harmonized with the soft lapping of the waves. In this serene moment, time seemed to stand still, offering a brief escape from the chaos of everyday life It was a perfect reminder of nature's quiet beauty and the peace it could bring to a restless soul."
// let words = "a sentence for testing the program."
const game = new TypeRacer(words)

const caret = document.createElement("div");
caret.classList.add("caret");
document.body.appendChild(caret)
