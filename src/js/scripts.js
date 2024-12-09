import { AspectRatios } from './aspectRatios.js';
import { Scrambler } from './scrambler.js'; // Import the updated ScramblerSR
import "../css/styles.css";
import { jsPDF } from '/node_modules/jspdf/dist/jspdf.es.js';

let selectedProblemCount = 4;
const problemSpace = document.getElementById("problem-space");
const problemCountElement = document.getElementById("problem-count");
const fileInput = document.getElementById('upload');
const imageCanvas = document.getElementById('image-canvas');
const problemCanvas = document.getElementById('answer-grid-canvas');
const reshuffle = document.getElementById('reshuffle');
const aspectRatios = new AspectRatios();
const generateButton = document.getElementById("generate");
let scrambler;

reshuffle.addEventListener('click', (event) => {
  event.preventDefault();
  if (scrambler) {
    scrambler.createPuzzleGrid()
  }
});

generateButton.addEventListener('click', (event) => {
  event.preventDefault();
  if (scrambler) {
    const doc = new jsPDF();
    doc.addImage(imageCanvas, 'JPEG', 0, 0, 148.5, 210, null, 'NONE', 0);
    doc.addImage(problemCanvas, 'JPEG', 10, 150, 130, 130, null, 'NONE', 0);
    doc.save(`${Date.now().valueOf()}.pdf`);
  }
});

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    paintImageOnCanvas(file);
  }
});

problemCountElement.addEventListener("change", (e) => {
  selectedProblemCount = e.target.value;
  generateQuestionAnswerSpace(problemSpace, selectedProblemCount);
  if (scrambler) {
    scrambler.gridManager.problemCount = selectedProblemCount;
    scrambler.gridManager.calculateGridDimensions();
    scrambler.initialize();
    scrambler.placeAnswers();
  }
});

generateOptions(problemCountElement);

generateQuestionAnswerSpace(problemSpace, selectedProblemCount);

function isPrime(n) {
  if (typeof n !== "number") {
    throw new Error("N must be a number");
  }
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) {
      return false;
    }
  }
  return true;
}

function generateOptions(select) {
  for (let i = 4; i <= 36; i++) {
    if (!isPrime(i)) {
      select.innerHTML += `<option value=${i}>${i}</option>`;
    }
  }
}

function generateQuestionAnswerSpace(problemSpace, problemCount) {
  problemSpace.innerHTML = "";
  for (let i = 1; i <= problemCount; i++) {
    problemSpace.innerHTML += `
    <span class="info-box">
      <label for="q-${i}" class="q-label">Q${i}:</label>
      <input type="text" name="q-${i}" class="q"></input>
      <label for="a-${i}" class="a-label">A${i}:</label>
      <input type="text" name="a-${i}" class="a"></input>
    </span>
    `;
  }
}

function paintImageOnCanvas(file) {
  const reader = new FileReader();

  reader.onload = function (e) {
    const img = new Image();
    img.src = e.target.result;

    img.onload = () => {
      imageCanvas.width = img.width;
      imageCanvas.height = img.height;
      problemCanvas.width = img.width;
      problemCanvas.height = img.height;

      const answers = Array.from(document.querySelectorAll(".a")).map((e) => e.value);
      const questions = Array.from(document.querySelectorAll(".q")).map((e) => e.value);

      scrambler = new Scrambler(
        img,
        imageCanvas,
        problemCanvas,
        selectedProblemCount,
        answers,
        questions
      );

      scrambler.initialize();
    };
  };

  reader.readAsDataURL(file);
}
