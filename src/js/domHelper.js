export const allInputsFilledEvent = new Event("allInputsFilled");

export function createInfoBox(i){
  const infoBox = document.createElement('span');
  infoBox.className = 'info-box';

  const qLabel = document.createElement('label');
  qLabel.setAttribute('for', `q-${i}`);
  qLabel.className = 'q-label';
  qLabel.textContent = `Q${i}:`;

  const qInput = document.createElement('input');
  qInput.setAttribute('type', 'text');
  qInput.setAttribute('name', `q-${i}`);
  qInput.className = 'q';

  const aLabel = document.createElement('label');
  aLabel.setAttribute('for', `a-${i}`);
  aLabel.className = 'a-label';
  aLabel.textContent = `A${i}:`;

  const aInput = document.createElement('input');
  aInput.setAttribute('type', 'text');
  aInput.setAttribute('name', `a-${i}`);
  aInput.className = 'a';

  infoBox.appendChild(qLabel);
  infoBox.appendChild(qInput);
  infoBox.appendChild(aLabel);
  infoBox.appendChild(aInput);

  return infoBox
}

export function isCanvasEmpty(canvas) {
  const context = canvas.getContext("2d");
  const canvasData = context.getImageData(0, 0, canvas.width, canvas.height);
  return !canvasData.data.some(channel => channel !== 0);
}

export function getAllQuestions(){
  return Array.from(document.querySelectorAll(".q"))
}

export function getAllAnswers(){
  return Array.from(document.querySelectorAll(".a"))
}

export function getAllInputs(){
  let qInputs = getAllQuestions()
  let aInputs = getAllAnswers()
  return qInputs.concat(aInputs)
}

export function generateQuestionAnswerSpace(problemSpace, problemCount) {
  for (let i = 1; i <= problemCount; i++) {
    let infoBox = createInfoBox(i)
    problemSpace.appendChild(infoBox);
  }
}

export function generateOptions(select) {
  for (let i = 4; i <= 36; i++) {
    if (!isPrime(i)) {
      select.innerHTML += `<option value=${i}>${i}</option>`;
    }
  }
}

export function editQuestionAnswerSpace(problemSpace, problemCount, targetProblemCount) {
  if(targetProblemCount > problemCount){
    for (let i = problemCount + 1; i <= targetProblemCount; i++) {
      let infoBox = createInfoBox(i)
      problemSpace.appendChild(infoBox);
    }
  } else if (targetProblemCount < problemCount) {
    let excessCount = problemCount - targetProblemCount;
    while(excessCount > 0) {
      const lastChild = problemSpace.lastElementChild;
      if (lastChild) {
        problemSpace.removeChild(lastChild);
      }
      excessCount=excessCount-1;
    }
  }
  getAllInputs().forEach(input => {
    input.addEventListener("input", checkInputsAndEmitEvent);
  });
}

export function checkInputsAndEmitEvent() {
  const allFilled = getAllInputs().every(input => input.value.trim() !== "");
  if (allFilled) {
    document.dispatchEvent(allInputsFilledEvent);
  }
}

export function isPrime(n) {
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