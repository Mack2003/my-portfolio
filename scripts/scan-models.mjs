import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { watch } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const modelsRoot = path.join(projectRoot, "public", "models");
const registryPath = path.join(
  projectRoot,
  "src",
  "components",
  "three",
  "registry",
  "generatedAssetRegistry.json",
);
const metadataPath = path.join(
  projectRoot,
  "src",
  "components",
  "three",
  "registry",
  "assetMetadata.json",
);
const supportedFormats = new Set(["glb", "gltf", "obj", "fbx"]);
const watchMode = process.argv.includes("--watch");
const checkMode = process.argv.includes("--check");

function assertSafeRelativePath(relativePath) {
  const normalized = relativePath.replaceAll("\\", "/");
  if (
    normalized.startsWith("/") ||
    normalized.split("/").some((part) => part === ".." || part === "." || part === "")
  ) {
    throw new Error(`Unsafe model path: ${relativePath}`);
  }
  return normalized;
}

function assetIdFor(relativePath) {
  const withoutExtension = relativePath.replace(/\.[^.]+$/, "");
  const id = withoutExtension
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (!id) throw new Error(`Could not create an asset ID for "${relativePath}"`);
  return id;
}

function defaultDisplayName(relativePath) {
  const basename = path.posix.basename(relativePath).replace(/\.[^.]+$/, "");
  return basename
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function findFiles(directory, relativeDirectory = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isSymbolicLink()) continue;
    const relativePath = relativeDirectory
      ? path.posix.join(relativeDirectory, entry.name)
      : entry.name;
    if (entry.isDirectory()) {
      files.push(...(await findFiles(path.join(directory, entry.name), relativePath)));
    } else if (entry.isFile()) {
      files.push(assertSafeRelativePath(relativePath));
    }
  }

  return files;
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function hashFile(filePath) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(filePath)) hash.update(chunk);
  return hash.digest("hex");
}

async function scan() {
  const [files, metadata, previousRegistry] = await Promise.all([
    findFiles(modelsRoot),
    readJson(metadataPath, {}),
    readJson(registryPath, []),
  ]);
  const supported = [];
  const unsupported = [];

  for (const relativePath of files.sort()) {
    if (path.posix.basename(relativePath).startsWith(".") && !path.posix.extname(relativePath)) {
      continue;
    }
    const extension = path.posix.extname(relativePath).slice(1).toLowerCase();
    if (!supportedFormats.has(extension)) {
      unsupported.push(relativePath);
      continue;
    }

    const id = assetIdFor(relativePath);
    const manualMetadata = metadata[id] ?? {};
    if (typeof manualMetadata !== "object" || manualMetadata === null || Array.isArray(manualMetadata)) {
      throw new Error(`Metadata for "${id}" must be a JSON object.`);
    }
    if (
      manualMetadata.displayName !== undefined &&
      (typeof manualMetadata.displayName !== "string" || !manualMetadata.displayName.trim())
    ) {
      throw new Error(`Metadata displayName for "${id}" must be a non-empty string.`);
    }
    if (
      manualMetadata.defaultWidth !== undefined &&
      (typeof manualMetadata.defaultWidth !== "number" ||
        !Number.isFinite(manualMetadata.defaultWidth) ||
        manualMetadata.defaultWidth <= 0)
    ) {
      throw new Error(`Metadata defaultWidth for "${id}" must be a positive number.`);
    }
    if (
      manualMetadata.tags !== undefined &&
      (!Array.isArray(manualMetadata.tags) ||
        !manualMetadata.tags.every((tag) => typeof tag === "string"))
    ) {
      throw new Error(`Metadata tags for "${id}" must be an array of strings.`);
    }
    supported.push({
      id,
      displayName: manualMetadata.displayName ?? defaultDisplayName(relativePath),
      path: `/models/${relativePath}`,
      relativePath,
      format: extension,
      contentHash: await hashFile(path.join(modelsRoot, relativePath)),
      metadata: manualMetadata,
      ...(manualMetadata.defaultWidth === undefined
        ? {}
        : { defaultWidth: manualMetadata.defaultWidth }),
      ...(manualMetadata.tags === undefined ? {} : { tags: manualMetadata.tags }),
    });
  }

  const duplicateIds = supported
    .map(({ id }) => id)
    .filter((id, index, ids) => ids.indexOf(id) !== index);
  if (duplicateIds.length) {
    throw new Error(`Duplicate generated asset IDs: ${[...new Set(duplicateIds)].join(", ")}`);
  }

  const previousById = new Map(previousRegistry.map((asset) => [asset.id, asset]));
  const nextById = new Map(supported.map((asset) => [asset.id, asset]));
  const added = supported.filter((asset) => !previousById.has(asset.id));
  const removed = previousRegistry.filter((asset) => !nextById.has(asset.id));
  const removedByHash = new Map(
    removed.filter((asset) => asset.contentHash).map((asset) => [asset.contentHash, asset]),
  );
  const renamed = added.flatMap((asset) => {
    const previous = removedByHash.get(asset.contentHash);
    if (!previous) return [];
    removedByHash.delete(asset.contentHash);
    return [{ from: previous.relativePath, to: asset.relativePath }];
  });
  const output = `${JSON.stringify(supported, null, 2)}\n`;
  const currentOutput = await readFile(registryPath, "utf8").catch((error) => {
    if (error.code === "ENOENT") return "";
    throw error;
  });

  if (checkMode) {
    if (currentOutput !== output) {
      throw new Error("Generated model registry is out of date. Run npm run 3d:scan.");
    }
  } else {
    await writeFile(registryPath, output, "utf8");
  }

  console.log(`Model registry ${checkMode ? "checked" : "updated"}: ${supported.length} assets.`);
  const renamedPaths = new Set(renamed.flatMap(({ from, to }) => [from, to]));
  const addedAssets = added.filter(({ relativePath }) => !renamedPaths.has(relativePath));
  const removedAssets = removed.filter(({ relativePath }) => !renamedPaths.has(relativePath));
  const changed = supported.filter((asset) => {
    const previous = previousById.get(asset.id);
    return previous && previous.contentHash && previous.contentHash !== asset.contentHash;
  });
  if (addedAssets.length) console.log(`Added: ${addedAssets.map(({ id }) => id).join(", ")}`);
  if (removedAssets.length) console.log(`Removed: ${removedAssets.map(({ id }) => id).join(", ")}`);
  if (renamed.length) {
    console.log(
      `Renamed (IDs follow paths; update metadata if needed): ${renamed
        .map(({ from, to }) => `${from} -> ${to}`)
        .join(", ")}`,
    );
  }
  if (changed.length) {
    console.log(`Changed contents: ${changed.map(({ relativePath }) => relativePath).join(", ")}`);
  }
  if (unsupported.length) {
    console.warn(`Unsupported model files (not registered): ${unsupported.join(", ")}`);
  }
  for (const staleId of Object.keys(metadata)) {
    if (!nextById.has(staleId)) {
      console.warn(`Metadata retained for missing asset "${staleId}".`);
    }
  }
}

async function run() {
  await scan();
  if (!watchMode) return;

  let timer;
  const watcher = watch(modelsRoot, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      scan().catch((error) => console.error("Model scan failed:", error));
    }, 150);
  });
  process.on("SIGINT", () => {
    clearTimeout(timer);
    watcher.close();
    process.exit(0);
  });
  console.log("Watching public/models for changes. Press Ctrl+C to stop.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
