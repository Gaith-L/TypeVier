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

        this.checkLetter = (event, words) => {
            const expectedCurrentWord = words[state.currentWordIndex]
            const lettersInCurrentWord = expectedCurrentWord.querySelectorAll('.letter')

            if (event.key === 'Backspace') {
                event.preventDefault()

                if (state.currentLetterIndex > 0) {
                    state.currentLetterIndex--
                    lettersInCurrentWord[state.currentLetterIndex].classList.remove("correct", "incorrect")
                } else if (state.currentWordIndex > 0) {
                    state.currentWordIndex--
                    state.currentLetterIndex = words[state.currentWordIndex].querySelectorAll('.letter').length - 1
                    words[state.currentWordIndex].querySelectorAll('.letter')[state.currentLetterIndex].classList.remove("correct", "incorrect")
                }
            } else if (event.key === ' ') {
                event.preventDefault()
                if (state.currentLetterIndex === lettersInCurrentWord.length) {
                    state.currentWordIndex++
                    state.currentLetterIndex = 0
                }
            } else if (event.key.length === 1) {
                console.log(state.currentLetterIndex);
                console.log(lettersInCurrentWord.length);
                if (state.currentLetterIndex < lettersInCurrentWord.length) {
                    if (event.key === lettersInCurrentWord[state.currentLetterIndex].textContent) {
                        lettersInCurrentWord[state.currentLetterIndex].classList.add('correct')
                    } else {
                        lettersInCurrentWord[state.currentLetterIndex].classList.add('incorrect')
                    }
                    state.currentLetterIndex++
                } else {

                }
            } else if (state.currentLetterIndex === lettersInCurrentWord.length) {
                state.currentWordIndex++
                state.currentLetterIndex = 0
            }
        }

        this.getWords = () => Array.from(document.querySelectorAll('.word'))
        this.getWordsVisual = () => this._wordsVisual
    }
}

window.onload = onPageLoad

let wordsContainer = document.getElementById('wordsContainer')
let wordDivs = wordsContainer.children

function onPageLoad() {
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

    wordDivs[0].querySelectorAll('span')[0].style.backgroundColor = 'yellow'
}

input = document.getElementById('wordsInput')
input.addEventListener('keydown', keyPressHandler)

function keyPressHandler(event) {
    const isLetter = event.key.length === 1
    const isSpace = event.key === ' '
    const isBackspace = event.key === 'Backspace'

    if (!(isLetter || isSpace || isBackspace) || event.ctrlKey || event.altKey || event.metaKey) {
        return
    }

    const out = game.checkLetter(event, wordDivs)

    input.value = ''
}

let words = "The sun dipped below the horizon, casting a warm orange glow across the tranquil lake. Birds chirped their final melodies of the day as the first stars began to twinkle in the twilight sky. A gentle breeze rustled the leaves of the tall trees lining the water's edge, creating a soothing symphony that harmonized with the soft lapping of the waves. In this serene moment, time seemed to stand still, offering a brief escape from the chaos of everyday life It was a perfect reminder of nature's quiet beauty and the peace it could bring to a restless soul."
// let words = "a sentence for testing the program."
const game = new TypeRacer(words)

const caret = document.createElement("div");
caret.classList.add("caret");
