class TypeRacer {
    constructor(text) {
        Object.defineProperty(this, '_words', {
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
            currentWordIndex: state.currentWordIndex,
            currentLetterIndex: state.currentLetterIndex,
            currentWPM: state.currentWPM,
            finalWPM: state.finalWPM,
            accuracy: state.accuracy,
        })

        this.startTimer = () => state.startTime = Date.now()
        this.endTimer = () => state.endTime = Date.now()

        this.checkLetter = (key) => {
            const expectedCurrentWord = this._words[state.currentWordIndex]
            const expectedCurrentLetter = expectedCurrentWord[state.currentLetterIndex]

            if (key === ' ') {
                if (state.currentLetterIndex === 0) {
                    let out = {
                        key: key,
                        timestamp: Date.now(),
                        valid: false,
                        correct: false,
                    }
                    state.keyHistory.push(out)
                    return out // pressing space without starting the current word
                }
                state.currentWordIndex++
                state.currentLetterIndex = 0
                // TODO: check if current input word is correct and set state 
            }

            if (key === 'Backspace') {
                if (state.currentWordIndex != 0) {
                    let out = {
                        key: key,
                        timestamp: Date.now(),
                        valid: true,
                        correct: true
                    }
                    state.keyHistory.push(out)
                    state.currentLetterIndex--
                    return out
                }
                return
            }

            if (key === expectedCurrentLetter) {
                let out = {
                    key: key,
                    timestamp: Date.now(),
                    valid: true,
                    correct: true,
                }
                state.keyHistory.push(out)
                state.currentLetterIndex++
                return out
            } else {
                let out = {
                    key: key,
                    timestamp: Date.now(),
                    valid: true,
                    correct: false,
                }
                state.keyHistory.push(out)
            }
        }

        this.getWords = () => this._words
    }
}

window.onload = onPageLoad

let wordsContainer = document.getElementById('wordsContainer')
let wordDivs = wordsContainer.children

function onPageLoad() {
    game.getWords().forEach((word, idx) => {
        const wordDiv = document.createElement('div')

        Array.from(word).forEach(letter => {
            const letterSpan = document.createElement('span')
            letterSpan.textContent = letter
            wordDiv.appendChild(letterSpan)
        })

        wordsContainer.appendChild(wordDiv)
    })
}

input = document.getElementById('wordsInput')
input.addEventListener('keydown', keyPressHandler)

function keyPressHandler(event) {
    const keyInput = event.target.value.trim()
    let state = game.getState()
    let out = game.checkLetter(keyInput)

    updateHtmlWordsContainer(state, out)
    input.value = ''
}

function updateHtmlWordsContainer(state, result) {
    const targetLetterSpan = wordDivs[state.currentWordIndex].querySelectorAll('span')[state.currentLetterIndex]

    if (result === true) {
        targetLetterSpan.style.backgroundColor = 'yellow'
    } else {
        targetLetterSpan.style.backgroundColor = 'red'
    }
}

let words = "The sun dipped below the horizon, casting a warm orange glow across the tranquil lake. Birds chirped their final melodies of the day as the first stars began to twinkle in the twilight sky. A gentle breeze rustled the leaves of the tall trees lining the water's edge, creating a soothing symphony that harmonized with the soft lapping of the waves. In this serene moment, time seemed to stand still, offering a brief escape from the chaos of everyday life It was a perfect reminder of nature's quiet beauty and the peace it could bring to a restless soul."
// let words = "a sentence for testing the program."
const game = new TypeRacer(words)
