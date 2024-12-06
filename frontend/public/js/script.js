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
            correctCharCount: 0,
            incorrectCharCount: 0,
            extraCharCount: 0,
            missedCharCount: 0,
            // TODO: add missedCharCount?
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
                    state.extraCharCount--
                } else if (lastLetter.classList.contains('correct')) {
                    lastLetter.classList.remove('correct');
                    state.correctCharCount--
                } else if (lastLetter.classList.contains('incorrect')) {
                    lastLetter.classList.remove('incorrect');
                    state.incorrectCharCount--
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
                        state.extraCharCount--;
                    } else if (lettersInCurrentWord[state.currentLetterIndex - 1].classList.contains('correct')){
                        state.currentLetterIndex--;
                        lettersInCurrentWord[state.currentLetterIndex].classList.remove('correct');
                        state.correctCharCount--;
                    } else if (lettersInCurrentWord[state.currentLetterIndex - 1].classList.contains('incorrect')) {
                        state.currentLetterIndex--;
                        lettersInCurrentWord[state.currentLetterIndex].classList.remove('incorrect');
                        state.incorrectCharCount--;
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

                if (previousWordLetters[previousWordLetters.length - 1].classList.contains('correct') || previousWordLetters[previousWordLetters.length - 1].classList.contains('incorrect')) {
                    state.currentLetterIndex = previousWordLetters.length
                } else {
                    for (let i = 1; i < previousWordLetters.length; i++) {
                        if (!previousWordLetters[i].classList.contains('correct') && !previousWordLetters[i].classList.contains('incorrect') ) {
                            state.currentLetterIndex = i;
                            break;
                        }
                    }
                }

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
            if (state.currentLetterIndex === lettersInCurrentWord.length) {
                completeCurrentWord(words, currentWord, lettersInCurrentWord);
            } else if (state.currentLetterIndex != 0) {
                incompleteCurrentWord(words, currentWord, lettersInCurrentWord);
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

        const incompleteCurrentWord = (words, currentWord, lettersInCurrentWord) => {
            currentWord.classList.remove('active');
            currentWord.classList.add('incorrect', 'typed');

            const missedChars = lettersInCurrentWord.length - state.currentLetterIndex;
            state.missedCharCount += missedChars;

            if (state.currentWordIndex < state.wordsLength - 1) {
                state.currentWordIndex++;
                state.currentLetterIndex = 0;
                words[state.currentWordIndex].classList.add('active');
            } else if (state.currentWordIndex === state.wordsLength - 1) {
                endRace()
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
                    state.correctCharCount++;
                } else {
                    expectedLetter.classList.add('incorrect');
                    state.keyMistakes.push(event.key);
                    state.incorrectCharCount++
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

                state.extraCharCount++
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
            state.correctCharCount = 0
            state.incorrectCharCount = 0
            state.extraCharCount = 0
            state.missedCharCount = 0
            state.currentWPM = 0 // TODO: probably set a timer event every 1 sec that calls a calcWPM func from TypeRacer obj
            state.finalWPM = 0
            state.accuracy = 0
            document.getElementById('resultContainer').classList.add('hidden');
        }

        const endRace = () => {
            state.endTime = Date.now()
            calculateRaceMetrics();
            displayRaceResults();
        }

        const calculateRaceMetrics = () => {
            const timeTakenInMinutes = (state.endTime - state.startTime) / 60000;

            // const finalWPM = Math.round(
            //     (state.currentWordIndex + 1) / timeTakenInMinutes
            // );

            const finalWPM = Math.round(
                (state.correctCharCount / timeTakenInMinutes) / 5
            )

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
            const resultContainer = document.getElementById('resultContainer');
            const timeTaken = ((state.endTime - state.startTime) / 1000).toFixed(1);

            // Update result values
            document.getElementById('wpmResult').textContent = state.finalWPM;
            document.getElementById('accuracyResult').textContent = state.accuracy + '%';
            document.getElementById('charactersResult').textContent =
                `${state.correctCharCount}/${state.incorrectCharCount}/${state.extraCharCount}/${state.missedCharCount}`;
            document.getElementById('consistencyResult').textContent =
                Math.round((state.finalWPM / (state.finalWPM + 10)) * 100) + '%';
            document.getElementById('timeResult').textContent = timeTaken + 's';

            // Show the results container
            resultContainer.classList.remove('hidden');

            // Log results to console (optional)
            console.log('Race Completed!');
            console.log(`Time: ${timeTaken} seconds`);
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
            correctCharCount: state.correctCharCount,
            incorrectCharCount: state.incorrectCharCount,
            extraCharCount: state.extraCharCount,
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
                correctCharCount: 0,
                incorrectCharCount: 0,
                extraCharCount: 0,
                missedCharCount: 0,
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

const commonWords = [
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it',
    'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this',
    'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
    'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
    'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
    'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
    'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could',
    'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come',
    'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how',
    'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because',
    'any', 'these', 'give', 'day', 'most', 'us', 'time', 'person', 'year',
    'good', 'way', 'about', 'many', 'then', 'them', 'write', 'would', 'like',
    'so', 'these', 'her', 'long', 'make', 'thing', 'see', 'him', 'two',
    'has', 'look', 'more', 'day', 'could', 'go', 'come', 'did', 'number',
    'sound', 'most', 'people', 'over', 'know', 'water', 'than', 'call',
    'first', 'who', 'may', 'down', 'side', 'been', 'now', 'find', 'head'
];

function generateRandomText(wordCount = 30) {
    const selectedWords = [];
    for (let i = 0; i < wordCount; i++) {
        const randomIndex = Math.floor(Math.random() * commonWords.length);
        selectedWords.push(commonWords[randomIndex]);
    }
    return selectedWords.join(' ');
}

const wordCountBtns = document.querySelectorAll('.word-count-btn');
let selectedWordCount = 10;

let words = generateRandomText(selectedWordCount);
let game = new TypeRacer(words);

wordCountBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active state
        wordCountBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update selected word count
        selectedWordCount = parseInt(btn.dataset.count);

        // Generate new text and restart
        words = generateRandomText(selectedWordCount);
        game = new TypeRacer(words);
        game.startRace();
        input.value = '';
        input.focus();
        onPageLoad();
    });
});

const caret = document.createElement("div");
caret.classList.add("caret");
document.body.appendChild(caret)

startRaceButton = document.getElementById("startRaceButton")
startRaceButton.onclick = () => {
    word = generateRandomText(selectedWordCount);
    game = new TypeRacer(word);
    game.startRace()
    input.value = ''
    input.focus()
    onPageLoad()
}
