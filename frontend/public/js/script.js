let words = "The sun dipped below the horizon, casting a warm orange glow across the tranquil lake. Birds chirped their final melodies of the day as the first stars began to twinkle in the twilight sky. A gentle breeze rustled the leaves of the tall trees lining the water's edge, creating a soothing symphony that harmonized with the soft lapping of the waves. In this serene moment, time seemed to stand still, offering a brief escape from the chaos of everyday life It was a perfect reminder of nature's quiet beauty and the peace it could bring to a restless soul."
// let words = "This sentence if for testing."

const wordsArray = words.split(" ")
const wordsArrayLength = wordsArray.length

const htmlWordsContainer = document.getElementById('wordsContainer').textContent
let htmlWords = htmlWordsContainer.split(' ')

let wordsIndex = 0;

const wordsContainer = document.getElementById('wordsContainer')
const input = document.getElementById('wordsInput')
const resultContainer = document.getElementById('resultContainer')

let checkWordInputIntervalId
let typingTestRunning = false

let timerTens = 0
let timerSeconds = 0

function checkWordInput() {
    startTimer()
    // console.log(timerSeconds + ":" + timerTens)
    let wordSpans = wordsContainer.querySelectorAll('.word-span')
    wordSpans.forEach((span, index) => {
        if (index < wordsIndex) {
            span.style.color = 'green'
        } else if (index > wordsIndex) {
            span.style.color = ''
        }
    })

    if (wordsIndex >= wordsArrayLength) {
        clearInterval(checkWordInputIntervalId); // Stop the interval once wordsIndex exceeds array length
        typingTestRunning = false
        wordsIndex = 0
        resultContainer.innerHTML = (wordsArrayLength / ((timerSeconds + 1 / timerTens) / 60)).toFixed(0)
        timerTens = 0
        timerSeconds = 0
        return;
    }
    wordSpans[wordsIndex].style.color = 'blue'
    if (input.value === wordsArray[wordsIndex] + " ") {
        input.value = ""
        wordsIndex++
    }
}

function highlightWords() {
    const input = document.getElementById('wordsInput').value;
    const content = document.getElementById('wordsContainer').innerHTML;
    const regex = new RegExp(`(${input})`, 'gi');
    const highlighted = content.replace(regex, '<span class="highlight">$1</span>');
    document.getElementById('wordsContainer').innerHTML = highlighted;
}

document.getElementById("startRaceButton").addEventListener("click", startRace);

function startRace() {
    if (typingTestRunning == false) {
        wordsContainer.innerHTML = ""
        wordsArray.forEach((word, idx) => {
            wordsContainer.innerHTML += `<span class="word-span" id="word-span-id-${idx}">${word} </span>`
        });

        input.value = ''
        checkWordInputIntervalId = setInterval(checkWordInput, 10) // TODO: improve this by adding a listener on 'space'
    }
    input.focus();
    typingTestRunning = true
}

function startTimer() {
    timerTens++

    if (timerTens > 99) {
        timerSeconds++
        timerTens = 0
    }
}
