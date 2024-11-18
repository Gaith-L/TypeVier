class TypeRacer {
    constructor(text) {
        Object.defineProperty(this, '_words', {
            value: Object.freeze(text.split(' ')),
            writable: false,
            configurable: false,
        })

        const state = {
            gameStarted: false,
        }

        this.getState = () => state
        this.setState = () => {
            if (!state.gameStarted) {
                state.gameStarted = true
                this.setStartTime()
            }
        }

        const metrics = {
            startTime: null,
            typedWords: [],
            currentWordIndex: 0,
            mistakes: 0
        }

        let lastKeyPressTime = Date.now()
        const minTimeBetweenKeysMs = 30

        this.getProgress = () => ({
            wordsTyped: metrics.currentWordIndex,
            totalWords: this._words.length,
            mistakes: metrics.mistakes,
            isComplete: metrics.currentWordIndex === this._words.length
        })

        this.getCurrentWord = () => {
            if ((metrics.currentWordIndex + 1) <= this._words.length) {
                return this._words[metrics.currentWordIndex]
            } else {
                return ''
            }
        }
        this.getWords = () => this._words


        this.setStartTime = () => {
            metrics.startTime = Date.now()
        }

        this.checkWord = (typedWord) => {
            const currentTime = Date.now()
            const timeDiff = currentTime - lastKeyPressTime

            if (timeDiff < minTimeBetweenKeysMs) {
                this.handleCheating()
                return false
            }

            lastKeyPressTime = currentTime // TODO: (fix) not checking for individual key presses yet

            if (!metrics.startTime && metrics.currentWordIndex === 0) {
                metrics.startTime = Date.now()
            }

            if (typedWord === this.getCurrentWord()) {
                metrics.typedWords.push({
                    word: typedWord,
                    timestamp: Date.now()
                })
                metrics.currentWordIndex++
                return true
            } else {
                metrics.mistakes++
                return false
            }
        }

        this.getWPM = () => {
            if (!metrics.startTime || metrics.typedWords.length === 0) return 0

            const timeElapsed = (Date.now() - metrics.startTime) / 1000 / 60 // in minutes
            const wordCount = metrics.typedWords.length

            // Calculate WPM based on actual timestamps of typed words
            return Math.round(wordCount / timeElapsed)
        }

        this.handleCheating = () => {
            // Reset progress or implement other anti-cheat measures
            metrics.currentWordIndex = 0
            metrics.typedWords = []
            metrics.startTime = null
            metrics.mistakes = 0
            console.log("abnormality detected")
            // emit an event or call a callback
        }

        this.restartRace = () => {
            state.gameStarted = false
            metrics.startTime = null
            metrics.currentWordIndex = 0
            metrics.typedWords = []
            updateUI(game.getProgress(), game.getCurrentWord(), game.getWPM())
        }
    }
}

let words = "The sun dipped below the horizon, casting a warm orange glow across the tranquil lake. Birds chirped their final melodies of the day as the first stars began to twinkle in the twilight sky. A gentle breeze rustled the leaves of the tall trees lining the water's edge, creating a soothing symphony that harmonized with the soft lapping of the waves. In this serene moment, time seemed to stand still, offering a brief escape from the chaos of everyday life It was a perfect reminder of nature's quiet beauty and the peace it could bring to a restless soul."
// let words = "a sentence for testing the program."

const game = new TypeRacer(words)

const button = document.getElementById('startRaceButton');

// Add an event listener to handle the click event
button.addEventListener('click', game.restartRace)
function onPageLoad() {
    const wordsContainer = document.getElementById('wordsContainer')
    wordsContainer.innerHTML = ''
    game.getWords().forEach((word, idx) => {
        wordsContainer.innerHTML += `<span class="word-span" id="word-span-id-${idx}">${word}</span>`
    })
    updateUI(game.getProgress(), game.getCurrentWord(), game.getWPM())
    input.focus()
}

window.onload = onPageLoad

function handleTyping(event) {
    game.setState()

    const typedWord = event.target.value.trim()

    if (event.key === ' ' || event.key === 'Enter') {
        if (game.checkWord(typedWord)) {
            event.preventDefault();

            updateUI(game.getProgress(), game.getCurrentWord(), game.getWPM())
        }
        // TODO: update UI to handle mistakes
    }
}

const input = document.getElementById('wordsInput')
input.addEventListener('keydown', handleTyping)

function updateUI(progress, currentWord, wpm) {
    let wordSpans = wordsContainer.querySelectorAll('.word-span')
    let wpmContainer = document.getElementById('wpmContainer')
    let currentWordContainer = document.getElementById('currentWordContainer')

    if (game.getState().gameStarted === false) {
        wordSpans[0].style.background = 'gray'
    } else {
        wordSpans[0].style.background = ''
    }

    wordSpans.forEach((span, index) => {
        if (index < progress.wordsTyped) {
            span.style.color = 'green'
            span.style.background = ''
        } else if (index > progress.wordsTyped) {
            span.style.color = ''
            span.style.background = ''
        } else {
            span.style.color = ''
            span.style.background = 'rgb(233, 240, 53)'
        }
    })

    wpmContainer.innerHTML = "WPM: " + wpm
    currentWordContainer.innerHTML = "Current word: " + currentWord
    input.value = ''
    input.focus()
}
