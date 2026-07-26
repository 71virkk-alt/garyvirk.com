import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync
} from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const distRoot = join(repoRoot, ".site-dist");
const generatedAssets = join(repoRoot, "assets", "build");
const publicFiles = [
  ".nojekyll",
  "index.html",
  "resume.html",
  "404.html",
  "robots.txt",
  "sitemap.xml",
  "favicon.svg",
  "site.webmanifest"
];

if (!existsSync(distRoot)) {
  throw new Error("No .site-dist build found. Run pnpm build and pnpm validate first.");
}

const builtCname = readFileSync(join(distRoot, "CNAME"), "utf8").trim();
const rootCname = readFileSync(join(repoRoot, "CNAME"), "utf8").trim();
if (builtCname !== "garyvirk.com" || rootCname !== "garyvirk.com") {
  throw new Error("CNAME safety check failed. Expected garyvirk.com in source and root.");
}

for (const relativePath of publicFiles) {
  const source = join(distRoot, relativePath);
  if (!existsSync(source)) {
    throw new Error(`Expected build output is missing: ${relativePath}`);
  }
  cpSync(source, join(repoRoot, basename(relativePath)));
}

rmSync(generatedAssets, { recursive: true, force: true });
mkdirSync(generatedAssets, { recursive: true });
cpSync(join(distRoot, "assets", "build"), generatedAssets, { recursive: true });

console.log("Published allowlisted build output to the GitHub Pages root.");
