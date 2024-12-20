import { AspectRatios } from './aspectRatios.js';
import { Scrambler } from './scrambler.js';
import { PdfGen } from './pdfGenerator.js';
import * as domHelper from './domHelper.js'
import "../css/styles.css";
import "../css/reset.css"
import '@fontsource/fredoka';
import '@fontsource/nunito'; 

addEventListener("DOMContentLoaded", () => init());

function init(){
  let selectedProblemCount = 4;
  const problemSpace = document.getElementById("problem-space");
  const problemCountElement = document.getElementById("problem-count");
  const fileInput = document.getElementById('upload');
  const imageCanvas = document.getElementById('image-canvas');
  const problemCanvas = document.getElementById('answer-grid-canvas');
  const reshuffle = document.getElementById('reshuffle');
  const generateButton = document.getElementById("generate");
  const checkBoxes = document.querySelectorAll(".check-box")
  let singlePage = false;
  let scrambler;
  let pdfGenerator = new PdfGen()
  domHelper.generateOptions(problemCountElement);
  domHelper.generateQuestionAnswerSpace(problemSpace, selectedProblemCount);

  domHelper.getAllInputs().forEach(input => {
    input.addEventListener("input", domHelper.checkInputsAndEmitEvent);
  });

  reshuffle.addEventListener('click', (event) => {
    event.preventDefault();
    if (scrambler) {
      scrambler.createPuzzleGrid()
    }
  });

  document.addEventListener("allInputsFilled", () => {
    if(!domHelper.isCanvasEmpty(imageCanvas) && !domHelper.isCanvasEmpty(problemCanvas)){
      scrambler.adjustForProblemCount(selectedProblemCount)
      scrambler.answers = Array.from(document.querySelectorAll(".a")).map((e) => e.value)
      scrambler.questions = Array.from(document.querySelectorAll(".q")).map((e) => e.value)
      scrambler.initialize();
    }
  });

  generateButton.addEventListener('click', (event) => {
    event.preventDefault();
    if (scrambler && pdfGenerator) {
      pdfGenerator.generate(imageCanvas, problemCanvas, singlePage)
    }
  });

  checkBoxes.forEach(cb => {
    cb.addEventListener("change", event => {
      singlePage = event.target.checked;
    });
  });

  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      paintImageOnCanvas(file);
    }
  });

  problemCountElement.addEventListener("change", (e) => {
    let targetProblemCount = e.target.value;
    domHelper.editQuestionAnswerSpace(problemSpace, Number(selectedProblemCount), Number(targetProblemCount));
    if (scrambler && targetProblemCount < selectedProblemCount) {
      scrambler.adjustForProblemCount(targetProblemCount)
      scrambler.answers = Array.from(document.querySelectorAll(".a")).map((e) => e.value)
      scrambler.questions = Array.from(document.querySelectorAll(".q")).map((e) => e.value)
      scrambler.initialize();
    }
    selectedProblemCount = targetProblemCount
  });

  function paintImageOnCanvas(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.src = e.target.result;

      img.onload = () => {
        _setupCanvasDimensions(img, imageCanvas, problemCanvas)
        scrambler = _setupScrambler(img, scrambler, imageCanvas, problemCanvas, selectedProblemCount)
      };
    };
    reader.readAsDataURL(file);
  }
}

function _setupCanvasDimensions(image, imageCanvas, problemCanvas) {
  imageCanvas.width = image.width;
  imageCanvas.height = image.height;
  problemCanvas.width = image.width;
  problemCanvas.height = image.height;
}

function _setupScrambler(img, scrambler ,imageCanvas, problemCanvas, selectedProblemCount) {
  const answers = domHelper.getAllAnswers().map(e => e.value);
  const questions = domHelper.getAllQuestions().map(e => e.value);

  scrambler = new Scrambler(
    img,
    imageCanvas,
    problemCanvas,
    selectedProblemCount,
    answers,
    questions
  );

  scrambler.initialize();
  return scrambler
}

