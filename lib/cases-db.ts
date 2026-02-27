import { readFileSync, writeFileSync, copyFileSync } from "fs";
import { join } from "path";
import type { UseCase } from "./types";

const DATA_PATH = join(process.cwd(), "data", "cases.json");
const BACKUP_PATH = join(process.cwd(), "data", "cases.backup.json");

export function readCases(): UseCase[] {
  const raw = readFileSync(DATA_PATH, "utf-8");
  const data = JSON.parse(raw);
  return data.useCases || [];
}

function writeCases(cases: UseCase[]): void {
  // Backup first
  copyFileSync(DATA_PATH, BACKUP_PATH);
  const data = { useCases: cases };
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export function addCase(uc: UseCase): UseCase[] {
  const cases = readCases();
  cases.push(uc);
  writeCases(cases);
  return cases;
}

export function updateCase(id: string, updates: Partial<UseCase>): UseCase[] {
  const cases = readCases();
  const idx = cases.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error(`Case ${id} not found`);
  cases[idx] = { ...cases[idx], ...updates };
  writeCases(cases);
  return cases;
}

export function deleteCase(id: string): UseCase[] {
  let cases = readCases();
  cases = cases.filter((c) => c.id !== id);
  writeCases(cases);
  return cases;
}

export function getNextId(cases: UseCase[]): string {
  const nums = cases.map((c) => parseInt(c.id.replace("uc", ""), 10)).filter((n) => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `uc${String(max + 1).padStart(3, "0")}`;
}
