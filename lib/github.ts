import type { UseCase } from "./types";

const OWNER = "Victorpham1984";
const REPO = "mateclaw-usecases";
const FILE_PATH = "data/cases.json";

export async function updateCasesViaGitHub(
  cases: UseCase[],
  commitMessage: string
): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN not configured");

  const apiBase = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.github.v3+json",
  };

  // 1. Get current file SHA
  const getRes = await fetch(apiBase, { headers });
  if (!getRes.ok) {
    throw new Error(`GitHub GET failed: ${getRes.status} ${await getRes.text()}`);
  }
  const fileData = await getRes.json();
  const currentSHA = fileData.sha;

  // 2. Update file via GitHub API (commit + push in one call)
  const newContent = JSON.stringify({ useCases: cases }, null, 2);
  const base64Content = Buffer.from(newContent).toString("base64");

  const putRes = await fetch(apiBase, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message: commitMessage,
      content: base64Content,
      sha: currentSHA,
      branch: "main",
    }),
  });

  if (!putRes.ok) {
    const error = await putRes.text();
    throw new Error(`GitHub commit failed: ${putRes.status} ${error}`);
  }
}
