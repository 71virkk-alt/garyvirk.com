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
assert(existsSync(join(distRoot, ".nojekyll")), "Build output must include .nojekyll.");

const home = read("index.html");
const resume = read("resume.html");
const work = read("work.html");
const notFound = read("404.html");
const robots = read("robots.txt");
const sitemap = read("sitemap.xml");
const cname = read("CNAME").trim();

for (const [name, html] of [
  ["index.html", home],
  ["work.html", work],
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
  "Hello, I’m Gary",
  "Start a conversation",
  "Show the checks",
  "Support work in",
  "Cummins Inc.",
  "Bluum",
  "Windows endpoint readiness",
  "Network access-control change",
  "CompTIA Network+",
  "Mississauga"
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
assert(sitemap.includes("https://garyvirk.com/work.html"), "sitemap.xml has no work index URL.");
for (const slug of [
  "windows-endpoint-readiness",
  "network-access-control",
  "network-inventory-drift",
  "dhcp-failure-isolation",
  "packet-triage-library"
]) {
  const casePath = `work/${slug}.html`;
  const casePage = read(casePath);
  assert(casePage.includes("Validated result"), `${casePath} has no validated result.`);
  assert(casePage.includes("What this does not claim"), `${casePath} has no claim boundary.`);
  assert(
    sitemap.includes(`https://garyvirk.com/${casePath}`),
    `sitemap.xml has no URL for ${casePath}.`
  );
}
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

  const htmlFiles = files.filter((file) => file.endsWith(".html"));
  for (const file of htmlFiles) {
    const html = readFileSync(file, "utf8");
    const references = [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
    for (const reference of references) {
      if (
        reference.startsWith("#") ||
        reference.startsWith("mailto:") ||
        reference.startsWith("tel:") ||
        reference.startsWith("http://") ||
        reference.startsWith("https://")
      ) {
        continue;
      }
      const pathname = reference.split(/[?#]/, 1)[0];
      const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\//, "");
      assert(
        existsSync(join(distRoot, relativePath)),
        `${file.slice(distRoot.length + 1)} has a broken local reference: ${reference}`
      );
    }
  }
}

if (errors.length) {
  console.error("Build validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Build validation passed.");
