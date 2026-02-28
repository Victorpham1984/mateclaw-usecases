// Generic GitHub file operations (single file update via GitHub Contents API)

const OWNER = "Victorpham1984";
const REPO = "mateclaw-usecases";

function getHeaders() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN not configured");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.github.v3+json",
  };
}

export async function updateFileViaGitHub(
  filePath: string,
  content: string,
  commitMessage: string
): Promise<void> {
  const headers = getHeaders();
  const apiBase = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}`;

  // Get current SHA (or null if file doesn't exist)
  let currentSHA: string | undefined;
  const getRes = await fetch(apiBase, { headers });
  if (getRes.ok) {
    const fileData = await getRes.json();
    currentSHA = fileData.sha;
  }

  const base64Content = Buffer.from(content).toString("base64");
  const body: any = {
    message: commitMessage,
    content: base64Content,
    branch: "main",
  };
  if (currentSHA) body.sha = currentSHA;

  const putRes = await fetch(apiBase, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });

  if (!putRes.ok) {
    const error = await putRes.text();
    throw new Error(`GitHub commit failed for ${filePath}: ${putRes.status} ${error}`);
  }
}

// Update multiple files in sequence
export async function updateMultipleFilesViaGitHub(
  updates: { path: string; content: string }[],
  commitPrefix: string
): Promise<void> {
  for (const { path, content } of updates) {
    await updateFileViaGitHub(path, content, `${commitPrefix} — ${path}`);
  }
}
