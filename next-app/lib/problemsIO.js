// Ported from src/js/import-export-handler.js.
// Rewritten to be pure (no DOM reads for the source data) so it plugs
// into React state instead of querying `.q`/`.a` inputs directly.
// The actual file download / file read still touch the DOM & File APIs,
// but only ever run inside a click/change handler - never at render time.

export function exportProblemsToFile(problemCount, problems) {
  const problemsData = {
    problemCount,
    problems: [],
  };

  problems.forEach((problem, index) => {
    const question = problem?.question ?? "";
    const answer = problem?.answer ?? "";
    if (question || answer) {
      problemsData.problems.push({
        id: index + 1,
        question,
        answer,
      });
    }
  });

  const dataStr = JSON.stringify(problemsData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(dataBlob);
  link.download = "worksheet-problems.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

function validateImportData(data) {
  if (!data?.problemCount) {
    throw new Error("Invalid import data: missing problem count element");
  }
  if (!data?.problems || !Array.isArray(data.problems)) {
    throw new Error("Invalid import data: missing problems array");
  }
  if (data.problems.length !== data.problemCount) {
    throw new Error("Problem count and problems must match");
  }
  if (data.problems.length === 0) {
    throw new Error("Import data contains no problems");
  }
}

// Returns { problemCount, problems } where `problems` is an array of
// { question, answer } objects, positionally aligned like the legacy
// `.q-N` / `.a-N` inputs were.
export async function parseImportedProblems(file) {
  const text = await file.text();
  const importedData = JSON.parse(text);

  validateImportData(importedData);

  const problemCount = Number(importedData.problemCount);
  const problems = [];
  for (let i = 0; i < problemCount; i++) {
    const problem = importedData.problems[i] || {};
    problems.push({
      question: problem.question ?? "",
      answer: problem.answer ?? "",
    });
  }

  return { problemCount, problems };
}
