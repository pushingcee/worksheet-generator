import { FILE_CONSTANTS, EVENT_NAMES } from "./utils/constants";
import * as domHelper from './domHelper.js';


const validateFunctionArgs = (additionalDeps) => {
  const missing = [];
  if (!additionalDeps?.problemCountElement) missing.push('problemCountElement');
  if (!additionalDeps?.selectedProblemCount) missing.push('selectedProblemCount');
  if (!additionalDeps?.problemSpace) missing.push('problemSpace');
  if (!additionalDeps?.imageContainer) missing.push('imageContainer');

  if (missing.length > 0) {
    throw new Error(`Missing required dependencies: ${missing.join(', ')}`);
  }
};

const emitProblemsImported = (data) => {
  console.log("emiting event ")
  document.dispatchEvent(new CustomEvent(EVENT_NAMES.PROBLEMS_IMPORTED, {
    detail: data
  }));
};

const validateImportData = (data) => {
  const {problemCount, problems } = data;
  if(!data?.problemCount){
    throw new Error('Invalid import data: missing problem count element');
  }
  if (!data?.problems || !Array.isArray(data.problems)) {
    throw new Error('Invalid import data: missing problems array');
  }
  if(data.problems.length != data?.problemCount){
    throw new Error('Problem count and problems must match');
  }
  if (data.problems.length === 0) {
    throw new Error('Import data contains no problems');
  }
};

  export const exportProblems = (selectedProblemCount) => {
    const questions = domHelper.getAllQuestions().map(input => input.value);
    const answers = domHelper.getAllAnswers().map(input => input.value);
    
    const problemsData = {
      problemCount: selectedProblemCount,
      problems: []
    };

    // Combine questions and answers into problem objects
    for (let i = 0; i < questions.length; i++) {
      if (questions[i] || answers[i]) { // Only include if there's at least a question or answer
        problemsData.problems.push({
          id: i + 1,
          question: questions[i] || '',
          answer: answers[i] || ''
        });
      }
    }

    // Create and download the JSON file
    const dataStr = JSON.stringify(problemsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'worksheet-problems.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

export const importProblems = async (file, additionalDeps) => {
  const {
    problemCountElement,
    selectedProblemCount, 
    problemSpace, 
    imageContainer, 
  } = additionalDeps;

  validateFunctionArgs(additionalDeps)

  try {
    const text = await file.text();
    const importedData = JSON.parse(text);

    validateImportData(importedData);

    const importedProblemCount = importedData.problemCount;
    
    if (importedProblemCount !== selectedProblemCount) {
      problemCountElement.value = importedProblemCount;
      domHelper.editQuestionAnswerSpace(problemSpace, Number(selectedProblemCount), Number(importedProblemCount));
    }

    importedData.problems.forEach((problem, index) => {
      domHelper.getAllQuestions()[index].value = problem.question ?? ''; 
      domHelper.getAllAnswers()[index].value = problem.answer ?? ''; 
    })

    emitProblemsImported({
        problemCount: importedProblemCount,
        problems: importedData.problems
    });
  } catch (error) {
    throw new Error('Failed to import problems', { cause: error });
  }
};