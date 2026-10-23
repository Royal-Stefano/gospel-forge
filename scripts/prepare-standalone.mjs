import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const standaloneDir = path.join(projectRoot, ".next", "standalone");

if (fs.existsSync(standaloneDir)) {
  const publicSrc = path.join(projectRoot, "public");
  const publicDest = path.join(standaloneDir, "public");
  const staticSrc = path.join(projectRoot, ".next", "static");
  const staticDest = path.join(standaloneDir, ".next", "static");

  if (fs.existsSync(publicSrc)) {
    fs.cpSync(publicSrc, publicDest, { recursive: true, force: true });
  }

  if (fs.existsSync(staticSrc)) {
    fs.cpSync(staticSrc, staticDest, { recursive: true, force: true });
  }

  console.log("✔ Successfully bundled static assets into .next/standalone/");
}
