"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Scrambler } from "../lib/scrambler.js";
import { PdfGen } from "../lib/pdfGenerator.js";
import { getValidProblemCounts, DEFAULT_PROBLEM_COUNT } from "../lib/problemCounts.js";
import { exportProblemsToFile, parseImportedProblems } from "../lib/problemsIO.js";

const emptyProblem = () => ({ question: "", answer: "" });

function makeProblems(count) {
  return Array.from({ length: count }, emptyProblem);
}

// Grow/shrink the problems array to `count`, preserving existing
// entries (mirrors domHelper.editQuestionAnswerSpace, which appended
// blank boxes or trimmed trailing ones).
function resizeProblems(problems, count) {
  if (count === problems.length) return problems;
  if (count > problems.length) {
    return [
      ...problems,
      ...Array.from({ length: count - problems.length }, emptyProblem),
    ];
  }
  return problems.slice(0, count);
}

function commitKey(problemCount, problems) {
  return JSON.stringify({ problemCount, problems });
}

export default function WorksheetGenerator() {
  const [problemCount, setProblemCount] = useState(DEFAULT_PROBLEM_COUNT);
  const [problems, setProblems] = useState(() => makeProblems(DEFAULT_PROBLEM_COUNT));
  const [singlePage, setSinglePage] = useState(false);
  const [imageEl, setImageEl] = useState(null);

  const imageContainerRef = useRef(null);
  const problemContainerRef = useRef(null);
  const importFileInputRef = useRef(null);

  const scramblerRef = useRef(null);
  const pdfGenRef = useRef(null);
  const lastCommittedKeyRef = useRef(null);

  const validProblemCounts = useMemo(() => getValidProblemCounts(), []);

  // Replaces the custom "allInputsFilled" DOM event: derived state.
  const allFilled = useMemo(
    () =>
      problems.length === problemCount &&
      problems.every(
        (p) => p.question.trim() !== "" && p.answer.trim() !== ""
      ),
    [problems, problemCount]
  );

  // Runs the equivalent of the legacy `updateScrambler()`: rebuild the
  // grid for the given problem count and push the latest answers/questions
  // into the existing Scrambler, then redraw everything.
  const commitToScrambler = useCallback((count, problemsList) => {
    const scrambler = scramblerRef.current;
    if (!scrambler) return;

    scrambler.adjustForProblemCount(count);
    scrambler.answers = problemsList.map((p) => p.answer);
    scrambler.questions = problemsList.map((p) => p.question);
    scrambler.initialize();
    lastCommittedKeyRef.current = commitKey(count, problemsList);
  }, []);

  // Create the PdfGen instance once, client-side only.
  useEffect(() => {
    pdfGenRef.current = new PdfGen();
  }, []);

  // New image uploaded -> fresh Scrambler, regardless of whether the
  // problem inputs are filled yet (mirrors paintImageOnContainer/_setupScrambler).
  useEffect(() => {
    if (!imageEl) return;

    const container = imageContainerRef.current;
    const problemContainer = problemContainerRef.current;
    if (!container || !problemContainer) return;

    container.style.width = `${imageEl.width}px`;
    container.style.height = `${imageEl.height}px`;
    problemContainer.style.width = `${imageEl.width}px`;
    problemContainer.style.height = `${imageEl.height}px`;

    const scrambler = new Scrambler(
      imageEl,
      container,
      problemContainer,
      problemCount,
      problems.map((p) => p.answer),
      problems.map((p) => p.question)
    );
    scrambler.initialize();
    scramblerRef.current = scrambler;
    lastCommittedKeyRef.current = commitKey(problemCount, problems);
    // Intentionally scoped to `imageEl` only: read whatever problem
    // count/answers are currently set at the moment the image finishes
    // loading, same as the legacy code reading DOM input values inside
    // the FileReader/Image onload callback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageEl]);

  // Live "all inputs filled" auto-commit: on every edit, while every
  // question/answer is filled, recompute the grid (this also means a
  // fresh reshuffle on each keystroke - preserved from the legacy
  // behavior where the `allInputsFilled` event fired the same way).
  useEffect(() => {
    if (!scramblerRef.current) return;
    const key = commitKey(problemCount, problems);
    if (allFilled && key !== lastCommittedKeyRef.current) {
      commitToScrambler(problemCount, problems);
    }
  }, [problemCount, problems, allFilled, commitToScrambler]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => setImageEl(img);
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleProblemCountChange = (event) => {
    const targetCount = Number(event.target.value);
    const nextProblems = resizeProblems(problems, targetCount);
    setProblems(nextProblems);
    if (targetCount < problemCount) {
      // Shrinking commits immediately, regardless of fill state
      // (mirrors handleProblemCountChange calling updateScrambler directly).
      commitToScrambler(targetCount, nextProblems);
    }
    setProblemCount(targetCount);
  };

  const handleQuestionChange = (index, value) => {
    setProblems((prev) =>
      prev.map((p, i) => (i === index ? { ...p, question: value } : p))
    );
  };

  const handleAnswerChange = (index, value) => {
    setProblems((prev) =>
      prev.map((p, i) => (i === index ? { ...p, answer: value } : p))
    );
  };

  const handleReshuffle = (event) => {
    event.preventDefault();
    scramblerRef.current?.createPuzzleGrid();
  };

  const handleGenerate = (event) => {
    event.preventDefault();
    if (scramblerRef.current && pdfGenRef.current) {
      pdfGenRef.current.generate(
        imageContainerRef.current,
        problemContainerRef.current,
        singlePage
      );
    }
  };

  const handleExport = (event) => {
    event.preventDefault();
    exportProblemsToFile(problemCount, problems);
  };

  const handleImportClick = (event) => {
    event.preventDefault();
    importFileInputRef.current?.click();
  };

  const handleImportFile = async (event) => {
    const file = event.target.files[0];
    event.target.value = "";
    if (!file) return;

    try {
      const { problemCount: importedCount, problems: importedProblems } =
        await parseImportedProblems(file);
      setProblems(importedProblems);
      setProblemCount(importedCount);
      // Imports commit immediately regardless of fill state, same as
      // the legacy `problemsImported` event handler.
      commitToScrambler(importedCount, importedProblems);
    } catch (error) {
      console.error("Failed to import problems", error);
    }
  };

  const handleSinglePageToggle = (event) => {
    setSinglePage(event.target.checked);
  };

  return (
    <>
      <header>
        <h1>Worksheet generator - Math Test</h1>
      </header>
      <hr />
      <main>
        <p>
          This simple tool helps educators and parents create engaging
          assignments and exercises for students. Just enter your questions
          and their corresponding answers, choose an image, and print a
          customized worksheet for your students.
        </p>
        <hr />
        <h3>Worksheet properties</h3>
        <form id="worksheet-properties">
          <span>
            <label htmlFor="single">Single page</label>
            <input
              className="check-box"
              type="checkbox"
              id="single"
              checked={singlePage}
              onChange={handleSinglePageToggle}
            />
          </span>
          <span>
            <label htmlFor="upload">Image:</label>
            <input
              type="file"
              id="upload"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </span>
          <span>
            <label htmlFor="problem-count">Problem count:</label>
            <select
              name="problemCount"
              id="problem-count"
              value={problemCount}
              onChange={handleProblemCountChange}
            >
              {validProblemCounts.map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </span>
          <button type="button" id="reshuffle" onClick={handleReshuffle}>
            Re-shuffle
          </button>
          <button type="button" id="export-problems" onClick={handleExport}>
            Export Problems
          </button>
          <button type="button" id="import-problems" onClick={handleImportClick}>
            Import Problems
          </button>
          <input
            type="file"
            id="import-file"
            accept=".json"
            style={{ display: "none" }}
            ref={importFileInputRef}
            onChange={handleImportFile}
          />
          <button type="button" id="generate" onClick={handleGenerate}>
            Generate worksheet
          </button>
        </form>
        <hr />
        <h3>Problems:</h3>
        <div id="problem-space">
          {problems.map((problem, index) => (
            <span className="info-box" key={index}>
              <label htmlFor={`q-${index + 1}`} className="q-label">
                Q{index + 1}:
              </label>
              <input
                type="text"
                id={`q-${index + 1}`}
                name={`q-${index + 1}`}
                className="q"
                value={problem.question}
                onChange={(e) => handleQuestionChange(index, e.target.value)}
              />
              <label htmlFor={`a-${index + 1}`} className="a-label">
                A{index + 1}:
              </label>
              <input
                type="text"
                id={`a-${index + 1}`}
                name={`a-${index + 1}`}
                className="a"
                value={problem.answer}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
              />
            </span>
          ))}
        </div>
        <hr />
        <div
          id="container-wrapper"
          style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}
        >
          <div>
            <h4>Puzzle Image</h4>
            <div
              id="image-container"
              ref={imageContainerRef}
              style={{ border: "1px solid #ccc" }}
            ></div>
          </div>
          <div>
            <h4>Answer Grid</h4>
            <div
              id="answer-grid-container"
              ref={problemContainerRef}
              style={{ border: "1px solid #ccc" }}
            ></div>
          </div>
        </div>
      </main>
    </>
  );
}
