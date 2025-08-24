import { AspectRatios } from './aspectRatios.js';
import { Scrambler } from './scrambler.js';
import { PdfGen } from './pdfGenerator.js';
import * as domHelper from './domHelper.js'
import { importProblems, exportProblems } from './import-export-handler.js'
import "../css/styles.css";
import "../css/reset.css"
import '@fontsource/fredoka';
import '@fontsource/nunito'; 
import { EVENT_NAMES } from './utils/constants.js'
addEventListener("DOMContentLoaded", () => init());

function init(){
  let selectedProblemCount = 4;
  const problemSpace = document.getElementById("problem-space");
  const problemCountElement = document.getElementById("problem-count");
  const fileInput = document.getElementById('upload');
  
  const imageContainer = document.getElementById('image-container');
  const problemContainer = document.getElementById('answer-grid-container');
  
  const reshuffle = document.getElementById('reshuffle');
  const generateButton = document.getElementById("generate");
  const exportButton = document.getElementById("export-problems");
  const importButton = document.getElementById("import-problems");
  const importFileInput = document.getElementById("import-file");
  const checkBoxes = document.querySelectorAll(".check-box")
  let singlePage = false;
  let scrambler;
  let pdfGenerator = new PdfGen()
  
  domHelper.generateOptions(problemCountElement);
  domHelper.generateQuestionAnswerSpace(problemSpace, selectedProblemCount);

  const updateScrambler = (problemCount) => {
    if (!scrambler) return;
    
    scrambler.adjustForProblemCount(problemCount);
    scrambler.answers = Array.from(document.querySelectorAll(".a")).map((e) => e.value);
    scrambler.questions = Array.from(document.querySelectorAll(".q")).map((e) => e.value);
    scrambler.initialize();
  };

  const handleReshuffle = (event) => {
    event.preventDefault();
    if (scrambler) {
      scrambler.createPuzzleGrid();
    }
  };

  const handleAllInputsFilled = () => {
    updateScrambler(selectedProblemCount);
  };

  const handleProblemsImported = (event) => {
    const { problemCount } = event.detail;
    updateScrambler(problemCount);
    selectedProblemCount = problemCount;
    problemCountElement.value = problemCount;
  };

  const handleGenerate = (event) => {
    event.preventDefault();
    if (scrambler && pdfGenerator) {
      pdfGenerator.generate(imageContainer, problemContainer, singlePage);
    }
  };

  const handleExport = (event) => {
    event.preventDefault();
    exportProblems(selectedProblemCount);
  };

  const handleImportClick = (event) => {
    event.preventDefault();
    importFileInput.click();
  };

  const handleImportFile = async (event) => {
    const file = event.target.files[0];
    if (file) {
      await importProblems(file, {
        problemCountElement,
        selectedProblemCount,
        problemSpace,
        imageContainer
      });
    }
  };

  const handleSinglePageToggle = (event) => {
    singlePage = event.target.checked;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      paintImageOnContainer(file);
    }
  };

  const handleProblemCountChange = (e) => {
    const targetProblemCount = e.target.value;
    domHelper.editQuestionAnswerSpace(problemSpace, Number(selectedProblemCount), Number(targetProblemCount));
    if (targetProblemCount < selectedProblemCount) {
      updateScrambler(targetProblemCount);
    }
    selectedProblemCount = targetProblemCount;
  };

  domHelper.getAllInputs().forEach(input => {
    input.addEventListener("input", domHelper.checkInputsAndEmitEvent);
  });

  reshuffle.addEventListener('click', handleReshuffle);
  document.addEventListener("allInputsFilled", handleAllInputsFilled);
  document.addEventListener(EVENT_NAMES.PROBLEMS_IMPORTED, handleProblemsImported);
  generateButton.addEventListener('click', handleGenerate);
  exportButton.addEventListener('click', handleExport);
  importButton.addEventListener('click', handleImportClick);
  importFileInput.addEventListener('change', handleImportFile);
  checkBoxes.forEach(cb => cb.addEventListener("change", handleSinglePageToggle));
  fileInput.addEventListener('change', handleFileUpload);
  problemCountElement.addEventListener("change", handleProblemCountChange);

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

  scrambler = new Scrambler(
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