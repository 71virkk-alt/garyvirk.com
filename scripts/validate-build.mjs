import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const distRoot = join(repoRoot, ".site-dist");
const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function read(relativePath) {
  const absolutePath = join(distRoot, relativePath);
  assert(existsSync(absolutePath), `Missing build output: ${relativePath}`);
  return existsSync(absolutePath) ? readFileSync(absolutePath, "utf8") : "";
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = join(directory, entry.name);
    return entry.isDirectory() ? walk(absolutePath) : [absolutePath];
  });
}

assert(existsSync(distRoot), "Build directory .site-dist does not exist.");

const home = read("index.html");
const resume = read("resume.html");
const notFound = read("404.html");
const robots = read("robots.txt");
const sitemap = read("sitemap.xml");
const cname = read("CNAME").trim();

for (const [name, html] of [
  ["index.html", home],
  ["resume.html", resume],
  ["404.html", notFound]
]) {
  assert((html.match(/<h1[\s>]/g) || []).length === 1, `${name} must contain exactly one h1.`);
  assert(html.includes('lang="en"'), `${name} must declare lang="en".`);
  assert(html.includes("Skip to content"), `${name} must include a skip link.`);
  assert(!html.includes("Operator Index"), `${name} contains retired operator-console language.`);
  assert(!html.includes("Open a ticket"), `${name} contains retired ticket-console language.`);
}

for (const phrase of [
  "Gary Virk",
  "IT support that gets to the",
  "Enterprise support with an infrastructure mindset",
  "Cummins Inc.",
  "Bluum",
  "Windows Server identity troubleshooting",
  "CompTIA Network+",
  "Let’s talk about the role"
]) {
  assert(home.includes(phrase), `Homepage is missing required content: ${phrase}`);
}

assert(
  !home.includes("This case remains a draft"),
  "Draft case-study body leaked into the homepage."
);
assert(
  !existsSync(join(distRoot, "work", "windows-server-identity.html")),
  "Draft work page was emitted."
);
assert(robots.includes("Sitemap: https://garyvirk.com/sitemap.xml"), "robots.txt has no sitemap.");
assert(sitemap.includes("https://garyvirk.com/resume.html"), "sitemap.xml has no resume URL.");
assert(cname === "garyvirk.com", "CNAME must remain exactly garyvirk.com.");

if (existsSync(distRoot)) {
  const files = walk(distRoot);
  const totalBytes = files.reduce((total, file) => total + statSync(file).size, 0);
  const javascriptBytes = files
    .filter((file) => file.endsWith(".js"))
    .reduce((total, file) => total + statSync(file).size, 0);

  assert(totalBytes < 3_500_000, `Build is unexpectedly large: ${totalBytes} bytes.`);
  assert(javascriptBytes < 1_100_000, `JavaScript is unexpectedly large: ${javascriptBytes} bytes.`);

  const textFiles = files.filter((file) => /\.(html|js|css|xml|txt|json|svg)$/i.test(file));
  const combined = textFiles.map((file) => readFileSync(file, "utf8")).join("\n");
  const forbidden = ["20-elite-projects", "_reference/", "my info /"];
  for (const token of forbidden) {
    assert(!combined.includes(token), `Private or internal token leaked into the build: ${token}`);
  }
}

if (errors.length) {
  console.error("Build validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Build validation passed.");
