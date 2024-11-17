// let words = "The sun dipped below the horizon, casting a warm orange glow across the tranquil lake. Birds chirped their final melodies of the day as the first stars began to twinkle in the twilight sky. A gentle breeze rustled the leaves of the tall trees lining the water's edge, creating a soothing symphony that harmonized with the soft lapping of the waves. In this serene moment, time seemed to stand still, offering a brief escape from the chaos of everyday life It was a perfect reminder of nature's quiet beauty and the peace it could bring to a restless soul."
let words = "This sentence if for testing."
const wordsArray = words.split(" ")
const wordsArrayLength = wordsArray.length

const htmlWordsContainer = document.getElementById('wordsContainer').textContent
let htmlWords = htmlWordsContainer.split(' ')

let wordsIndex = 0;

const wordsContainer = document.getElementById('wordsContainer');
const input = document.getElementById('wordsInput')

let checkWordInputIntervalId
let typingTestRunning = false

function checkWordInput() {
    console.log("checkinginput....")
    let wordSpans = wordsContainer.querySelectorAll('.word-span')
    wordSpans.forEach(span => {
        span.style.color = ''
    })

    if (wordsIndex >= wordsArrayLength) {
        clearInterval(checkWordInputIntervalId); // Stop the interval once wordsIndex exceeds array length
        typingTestRunning = false
        wordsIndex = 0
        return;
    }
    wordSpans[wordsIndex].style.color = 'yellow'
    if (input.value === wordsArray[wordsIndex] + " ") {
        input.value = ""
        console.log(wordsArray[wordsIndex])
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
    console.log("Started race!" + typingTestRunning)

    if (typingTestRunning == false) {
        wordsContainer.innerHTML = ""
        wordsArray.forEach((word, idx) => {
            // console.log(word)
            wordsContainer.innerHTML += `<span class="word-span" id="word-span-id-${idx}">${word} </span>`
        });
    }
    typingTestRunning = true

    input.focus();
    input.value = ''
    checkWordInputIntervalId = setInterval(checkWordInput, 10) // TODO: improve this by adding a listener on 'space'
}

document.getElementById('counterButton').addEventListener('click', function() {
    count++;
    document.getElementById('countDisplay').innerText = 'Count: ' + count;
})
