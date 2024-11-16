let words = "The sun dipped below the horizon, casting a warm orange glow across the tranquil lake. Birds chirped their final melodies of the day as the first stars began to twinkle in the twilight sky. A gentle breeze rustled the leaves of the tall trees lining the water's edge, creating a soothing symphony that harmonized with the soft lapping of the waves. In this serene moment, time seemed to stand still, offering a brief escape from the chaos of everyday life It was a perfect reminder of nature's quiet beauty and the peace it could bring to a restless soul."

const wordsArray = words.split(" ")
const htmlWordsContainer = document.getElementById('wordsContainer').textContent

let htmlWords = htmlWordsContainer.split(' ')

let wordsIndex = 0;

function checkWordInput() {
    var input = document.getElementById('wordsInput')

    console.log(wordsArray[wordsIndex])

    if (input.value === wordsArray[wordsIndex] + " ") {
        input.value = ""
        // if (wordsIndex > 0) {
        //     console.log(wordsArray[wordsIndex - 1])
        // }
        console.log(wordsArray[wordsIndex])
        wordsIndex++
    }
}
setInterval(checkWordInput, 100)

function highlightWords() {
    const input = document.getElementById('wordsInput').value;
    const content = document.getElementById('wordsContainer').innerHTML;
    const regex = new RegExp(`(${input})`, 'gi');
    const highlighted = content.replace(regex, '<span class="highlight">$1</span>');
    document.getElementById('wordsContainer').innerHTML = highlighted;
}

document.getElementById("startRaceButton").addEventListener("click", startRace);

function startRace() {
    let content = document.getElementById('wordsContainer');
    console.log("Started race!")
    wordsArray.forEach(word => {
        console.log(word)
        content.innerHTML += `<span>${word} </span>`
    });

}

document.getElementById('counterButton').addEventListener('click', function() {
    count++;
    document.getElementById('countDisplay').innerText = 'Count: ' + count;
})
