import { AspectRatios } from './aspectRatios.js';
import { ScramblerDiv } from './scramblerDiv.js';
import { PdfGenDiv } from './pdfGeneratorDiv.js';
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
  
  // Use div containers instead of canvas
  const imageContainer = document.getElementById('image-container');
  const problemContainer = document.getElementById('answer-grid-container');
  
  const reshuffle = document.getElementById('reshuffle');
  const generateButton = document.getElementById("generate");
  const checkBoxes = document.querySelectorAll(".check-box")
  let singlePage = false;
  let scrambler;
  let pdfGenerator = new PdfGenDiv()
  
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
    if(imageContainer.children.length > 0 && problemContainer.children.length > 0){
      scrambler.adjustForProblemCount(selectedProblemCount)
      scrambler.answers = Array.from(document.querySelectorAll(".a")).map((e) => e.value)
      scrambler.questions = Array.from(document.querySelectorAll(".q")).map((e) => e.value)
      scrambler.initialize();
    }
  });

  generateButton.addEventListener('click', (event) => {
    event.preventDefault();
    if (scrambler && pdfGenerator) {
      pdfGenerator.generate(imageContainer, problemContainer, singlePage)
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
      paintImageOnContainer(file);
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

  function paintImageOnContainer(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.src = e.target.result;

      img.onload = () => {
        _setupContainerDimensions(img, imageContainer, problemContainer)
        scrambler = _setupScrambler(img, scrambler, imageContainer, problemContainer, selectedProblemCount)
      };
    };
    reader.readAsDataURL(file);
  }
}

function _setupContainerDimensions(image, imageContainer, problemContainer) {
  // Set container dimensions instead of canvas dimensions
  imageContainer.style.width = `${image.width}px`;
  imageContainer.style.height = `${image.height}px`;
  problemContainer.style.width = `${image.width}px`;
  problemContainer.style.height = `${image.height}px`;
}

function _setupScrambler(img, scrambler, imageContainer, problemContainer, selectedProblemCount) {
  const answers = domHelper.getAllAnswers().map(e => e.value);
  const questions = domHelper.getAllQuestions().map(e => e.value);

  scrambler = new ScramblerDiv(
    img,
    imageContainer,
    problemContainer,
    selectedProblemCount,
    answers,
    questions
  );

  scrambler.initialize();
  return scrambler
}

// Helper function to check if container has content (equivalent to canvas check)
function isContainerEmpty(container) {
  return container.children.length === 0;
}