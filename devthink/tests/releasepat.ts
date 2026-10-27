/** The one-shot walk of the release publish doctrine: the owner pat rides the release create and the publish flip.

The family artifact lanes answer the release published event, and a release the repository token creates never fires it (the github token event suppression), so the create and the flip of the release workflow ride the owner pat whenever the secret exists — the same fallback the maintenance ladder rides — and the app token keeps the lane standing when it does not. The GH013 wall refuses any workflow file through the repository token, so the walk lives in the maintenance sync the way the familylanes migration lives there: the sync renders the forms, the rung's owner pat landing carries them, and the standing checks never redden waiting for the rung (the check mode never invokes this walk). The migration is one-shot: once both markers answer the pat form, the walk reports no drift ever again. */
import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const repoRoot = resolve(process.cwd(), "..");

/* the old form of the create step env (the repository token answering the
 * release creation) and the pat form the walk renders over it. */
const createOld = [
  "      - name: Tag the bumped version and create the release",
  "        if: steps.versions.outputs.changed == 'true'",
  "        env:",
  "          GH_TOKEN: ${{ github.token }}",
  "          VERSION: ${{ steps.versions.outputs.version }}",
].join("\n");
const createNew = [
  "      - name: Tag the bumped version and create the release",
  "        if: steps.versions.outputs.changed == 'true'",
  "        env:",
  "          # the family artifact lanes ride the release published event, and a",
  "          # release the repository token creates never fires it (the github",
  "          # token event suppression), so the create rides the owner pat",
  "          # whenever the secret exists — the same fallback the maintenance",
  "          # ladder rides — and the app token keeps the lane standing when it",
  "          # does not (the release still publishes, only the family lanes of",
  "          # that release stay quiet until the next pat published one).",
  "          GH_TOKEN: ${{ secrets.OWNER_PAT || github.token }}",
  "          VERSION: ${{ steps.versions.outputs.version }}",
].join("\n");

/* the old form of the publish flip env and the pat form the walk renders. */
const flipOld = [
  "      - name: Publish the verified release",
  "        env:",
  "          GH_TOKEN: ${{ github.token }}",
  "          GITHUB_REPOSITORY: ${{ github.repository }}",
].join("\n");
const flipNew = [
  "      - name: Publish the verified release",
  "        env:",
  "          # the flip owns the published event the family artifact lanes",
  "          # answer: the repository token never fires it (the github token",
  "          # event suppression), so the flip rides the owner pat whenever",
  "          # the secret exists and the app token keeps the lane standing",
  "          # when it does not.",
  "          GH_TOKEN: ${{ secrets.OWNER_PAT || github.token }}",
  "          GITHUB_REPOSITORY: ${{ github.repository }}",
].join("\n");

/** Renders the pat publish forms over the release workflow when the old forms answer. */
export async function releasepat(mode: string) {
  if (!new Set(["check", "sync"]).has(mode)) throw new Error("Use check or sync.");
  const workflowpath = join(repoRoot, ".github/workflows/release.yml");
  const content = await readFile(workflowpath, "utf8");
  const createStatus = content.includes(createNew) ? "already" : content.includes(createOld) ? "walks" : "unmatched";
  const flipStatus = content.includes(flipNew) ? "already" : content.includes(flipOld) ? "walks" : "unmatched";
  let drift = false;
  if (mode === "sync") {
    let walked = content;
    if (createStatus === "walks") {
      walked = walked.replace(createOld, createNew);
      drift = true;
    }
    if (flipStatus === "walks") {
      walked = walked.replace(flipOld, flipNew);
      drift = true;
    }
    if (drift) await writeFile(workflowpath, walked, "utf8");
  } else if (createStatus === "walks" || flipStatus === "walks") {
    drift = true;
  }
  return { drift, create: createStatus, flip: flipStatus };
}
