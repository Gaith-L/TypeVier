class TypeRacer {
    #wordsInternal;
    #wordsVisual;
    #state;

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

        /* Closures */
        const state = {
            startTime: null,
            endTime: null,
            wordsLength: this._wordsVisual.length,
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

        const handleBackspace = (event, words, currentWord, lettersInCurrentWord) => {
            if (event.ctrlKey) {
                handleCtrlBackspace(words, currentWord, lettersInCurrentWord);
                return;
            }

            if (state.currentLetterIndex > 0) {
                const lastLetter = lettersInCurrentWord[state.currentLetterIndex - 1];
                if (lastLetter.classList.contains('extra')) {
                    lastLetter.remove();
                } else {
                    lastLetter.classList.remove('correct', 'incorrect');
                }
                state.currentLetterIndex--;
                state.keyHistory.pop();
            } else if (state.currentWordIndex > 0) {
                // Move to previous word if at the start of current word
                moveBackToPreviousWord(words);
            }
        }

        const handleCtrlBackspace = (words, currentWord, lettersInCurrentWord) => {
            if (state.currentLetterIndex > 0) {
                resetCurrentWord(currentWord);

                // Reset letter tracking
                for (let i = state.currentLetterIndex; i > 0; i--) {
                    if (lettersInCurrentWord[state.currentLetterIndex - 1].classList.contains('extra')) {
                        lettersInCurrentWord[state.currentLetterIndex - 1].remove();
                        state.currentLetterIndex--;
                    } else {
                        state.currentLetterIndex--;
                        lettersInCurrentWord[state.currentLetterIndex].classList.remove('correct', 'incorrect');
                    }
                }
            } else if (state.currentWordIndex > 0) {
                moveBackToPreviousWord(words);
            }
        }

        const moveBackToPreviousWord = (words) => {
            // Only move back if previous word is not typed correctly
            if (canMoveToPreviousWord(words)) {
                words[state.currentWordIndex].classList.remove('active');

                // Move to end of previous word
                state.currentWordIndex--;
                const previousWordLetters = words[state.currentWordIndex].querySelectorAll('.letter');
                state.currentLetterIndex = previousWordLetters.length;

                // Reset previous word state
                resetCurrentWord(words[state.currentWordIndex]);
                words[state.currentWordIndex].classList.add('active');
            }
        }

        const canMoveToPreviousWord = (words) => {
            return state.currentWordIndex > 0 &&
                   !(words[state.currentWordIndex - 1].classList.contains('correct') &&
                     words[state.currentWordIndex - 1].classList.contains('typed'));
        }

        const resetCurrentWord = (word) => {
            word.classList.remove('typed', 'correct', 'incorrect');
        }

        const handleSpaceKey = (words, currentWord, lettersInCurrentWord) => {
            // Only process space if all letters in current word are typed
            if (state.currentLetterIndex === lettersInCurrentWord.length) {
                completeCurrentWord(words, currentWord, lettersInCurrentWord);
            }
        }

        const completeCurrentWord = (words, currentWord, lettersInCurrentWord) => {
            const hasIncorrectLetter = !Array.from(lettersInCurrentWord).every(letter =>
                letter.classList.contains('correct')
            );

            currentWord.classList.remove('active');

            if (hasIncorrectLetter) {
                currentWord.classList.add('incorrect', 'typed');
                state.wordMistakes.push(this._wordsVisual[state.currentWordIndex]);
            } else {
                currentWord.classList.add('correct', 'typed');
            }

            // Move to next word if not the last word
            if (state.currentWordIndex < state.wordsLength - 1) {
                state.currentWordIndex++;
                state.currentLetterIndex = 0;
                words[state.currentWordIndex].classList.add('active');
            }
        }

        const handleRegularKeyPress = (event, words, currentWord, lettersInCurrentWord) => {
            if (event.key.length !== 1) return;

            // Track key press
            state.keyHistory.push(event.key);

            if (state.currentLetterIndex < lettersInCurrentWord.length) {
                const expectedLetter = lettersInCurrentWord[state.currentLetterIndex];

                if (event.key === expectedLetter.textContent) {
                    expectedLetter.classList.add('correct');
                } else {
                    expectedLetter.classList.add('incorrect');
                    state.keyMistakes.push(event.key);
                }
                state.currentLetterIndex++;
            } else if (state.currentLetterIndex > 19) {
                console.error("Word limit")
            } else {
                const extraKeySpan = document.createElement('span');
                extraKeySpan.classList.add('letter', 'incorrect', 'extra');
                extraKeySpan.textContent = event.key;
                currentWord.appendChild(extraKeySpan);
                state.currentLetterIndex++;
            }

            // Check if race is completed (last word and fully typed)
            checkRaceCompletion(words, currentWord, lettersInCurrentWord);
        }

        const checkRaceCompletion = (words, currentWord, lettersInCurrentWord) => {
            if (state.currentWordIndex === state.wordsLength - 1 &&
                state.currentLetterIndex === lettersInCurrentWord.length &&
                lettersInCurrentWord[lettersInCurrentWord.length - 1].classList.contains('correct')) {

                completeCurrentWord(words, currentWord, lettersInCurrentWord);
                endRace();
            }
        }

        this.startRace = () => {
            state.startTime = Date.now()
            state.endTime = null
            state.keyHistory = []
            state.wordHistory = []
            state.keyMistakes = []
            state.wordMistakes = []
            state.currentTypedWord = ''
            state.currentWordIndex = 0
            state.currentLetterIndex = 0
            state.currentWPM = 0 // TODO: probably set a timer event every 1 sec that calls a calcWPM func from TypeRacer obj
            state.finalWPM = 0
            state.accuracy = 0
        }

        const endRace = () => {
            state.endTime = Date.now()
            calculateRaceMetrics();
            displayRaceResults();
        }

        const calculateRaceMetrics = () => {
            const timeTakenInMinutes = (state.endTime - state.startTime) / 60000;

            const finalWPM = Math.round(
                (state.currentWordIndex + 1) / timeTakenInMinutes
            );

            // Calculate Accuracy
            const totalKeystrokes = state.keyHistory.length;
            const incorrectKeystrokes = state.keyMistakes.length;
            const accuracy = Math.max(0, Math.round(
                ((totalKeystrokes - incorrectKeystrokes) / totalKeystrokes) * 100
            ));

            state.finalWPM = finalWPM
            state.accuracy = accuracy
        }

        const displayRaceResults = () => {
            console.log('Race Completed!');
            console.log(`Time: ${((state.endTime - state.startTime) / 1000).toFixed(2)} seconds`);
            console.log(`Words Per Minute: ${state.finalWPM}`);
            console.log(`Accuracy: ${state.accuracy}%`);
            console.log(`Total Mistakes: ${state.keyMistakes.length}`);
            console.log(`Word Mistakes: ${state.wordMistakes}`);
        }

        const resetRace = () => {
            state = this.createInitialState();

            // Reset visual state of words
            const wordsContainer = document.getElementById('wordsContainer');
            if (wordsContainer) {
                Array.from(wordsContainer.children).forEach(word => {
                    word.classList.remove('active', 'typed', 'correct', 'incorrect');
                });
                wordsContainer.children[0].classList.add('active');
            }
        }

        const shouldProcessKey = (event) => {
            // Only process printable characters, backspace, and space
            return event.key.length === 1 ||
                   event.key === 'Backspace' ||
                   event.key === ' ';
        }

        /*------------------- */

        /* Public methods */

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

        this.handleKeyDown = (event) => {
            event.preventDefault();

            // Existing key processing logic
            if (!shouldProcessKey(event)) return;

            // Start the race on first keypress
            if (state.startTime === null) {
                this.startRace();
            }

            // Check if race is already completed
            if (state.endTime !== null) {
                displayRaceResults();
                return;
            }

            const wordsContainer = document.getElementById('wordsContainer');
            if (!wordsContainer) return; // TODO: Extra error handling

            const words = wordsContainer.children;
            const currentWord = words[state.currentWordIndex];
            const lettersInCurrentWord = currentWord.querySelectorAll('.letter');

            switch (event.key) {
                case 'Backspace':
                    handleBackspace(event, words, currentWord, lettersInCurrentWord);
                    break;
                case ' ':
                    handleSpaceKey(words, currentWord, lettersInCurrentWord);
                    break;
                default:
                    handleRegularKeyPress(event, words, currentWord, lettersInCurrentWord);
            }
        }

        this.updateCaret = () => {
            if (state.currentWordIndex === 0 && state.currentLetterIndex === 0) {
                caret.style.animation = "blink 1s step-end infinite";
            } else {
                caret.style.animation = "";
            }
            let wordsContainer = document.getElementById('wordsContainer');
            let words = wordsContainer.children;

            const currentWord = words[state.currentWordIndex];
            const letters = currentWord.querySelectorAll(".letter");

            if (state.currentLetterIndex < letters.length) {
                const currentLetter = letters[state.currentLetterIndex];
                caret.style.top = currentLetter.getBoundingClientRect().top + "px";
                caret.style.left = currentLetter.getBoundingClientRect().left + "px";
            } else {
                const lastLetter = letters[letters.length - 1];
                caret.style.top = lastLetter.getBoundingClientRect().top + "px";
                caret.style.left = (lastLetter.getBoundingClientRect().left + lastLetter.offsetWidth) + "px";
            }
        }


        this.createInitialState = () => {
            return {
                startTime: null,
                endTime: null,
                wordsLength: this.#wordsVisual.length,
                keyHistory: [],
                wordHistory: [],
                keyMistakes: [],
                wordMistakes: [],
                currentTypedWord: '',
                currentWordIndex: 0,
                currentLetterIndex: 0,
                currentWPM: 0,
                finalWPM: 0,
                accuracy: 0,
            };
        }

        this.getWordsVisual = () => this._wordsVisual
        this.getWordsInternal = () => this._wordsInternal
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
        game.handleKeyDown(event)
        game.updateCaret()
    } else if (event.altKey || event.metaKey) {
        return
    }
}

// let words = "The sun dipped below the horizon, casting a warm orange glow across the tranquil lake. Birds chirped their final melodies of the day as the first stars began to twinkle in the twilight sky. A gentle breeze rustled the leaves of the tall trees lining the water's edge, creating a soothing symphony that harmonized with the soft lapping of the waves. In this serene moment, time seemed to stand still, offering a brief escape from the chaos of everyday life It was a perfect reminder of nature's quiet beauty and the peace it could bring to a restless soul."
let words = "this is for testing the program."
// let words = "hastily beneath swimming delicious through banana violently eager despite melted carefully purple jumping yesterday within happily smashed above quantum briskly toward laughing sideways beneath furiously eating whenever sleepy beneath dancing smoothly around between loudly sparkling after gently during breakfast inside leaping softly because zigzagging upward while before quickly alongside mellow instantly outside nervously beyond slippery since wobbling together anxiously quietly"
const game = new TypeRacer(words)

const caret = document.createElement("div");
caret.classList.add("caret");
document.body.appendChild(caret)
