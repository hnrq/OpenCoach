import * as fs from "fs";
import * as path from "path";
import { SCHEMAS } from "../../../../packages/schemas/src/index.ts";

/**
 * OpenCoach: coach-save-session.ts
 * Validates and saves JSON data for measures, diet, training, or appointment.
 *
 * Usage:
 *   save-session <type> --date YYYY-MM-DD       # in-place validate at <type>/<type>-<date>.json
 *   save-session <type> <json_file_path>        # validate source, write to <type>/<type>-<today>.json
 *   save-session all --date YYYY-MM-DD          # validate measures + diet + training for date
 *   save-session --help
 */

type SessionType = keyof typeof SCHEMAS;
const ALL_TYPES: SessionType[] = ["measures", "diet", "training"];
const VALID_TYPES = [...ALL_TYPES, "appointment", "all"];

// ── Forbidden path guard ──────────────────────────────────────────────────────

const FORBIDDEN_SEGMENTS = [".opencode", "node_modules", "package-lock.json", "bun.lock"];

function assertSafePath(p: string) {
	const norm = path.resolve(p);
	for (const seg of FORBIDDEN_SEGMENTS) {
		if (norm.includes(path.sep + seg) || norm.includes("/" + seg)) {
			throw new Error(`Refusing to write to protected path: ${norm}`);
		}
	}
}

// ── Path resolution ───────────────────────────────────────────────────────────

function resolvePath(type: SessionType, date: string): string {
	const root = process.cwd();
	if (type === "appointment") {
		return path.join(root, "appointments", `appointment-${date}.json`);
	}
	return path.join(root, type, `${type}-${date}.json`);
}

// ── Core save logic ───────────────────────────────────────────────────────────

function saveOne(type: SessionType, sourcePath: string, targetPath: string): boolean {
	assertSafePath(targetPath);

	if (!fs.existsSync(sourcePath)) {
		console.error(`  ✗ ${type}: source file not found: ${sourcePath}`);
		console.error(
			`    Hint: run  pnpm opencoach new-session ${type} --date <YYYY-MM-DD>  to create a skeleton`,
		);
		return false;
	}

	let data: unknown;
	try {
		data = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
	} catch (err: any) {
		console.error(`  ✗ ${type}: invalid JSON — ${err.message}`);
		return false;
	}

	const result = SCHEMAS[type].safeParse(data);

	if (!result.success) {
		const issues = result.error.issues;
		console.error(`  ✗ ${type}: validation failed (${issues.length} error${issues.length !== 1 ? "s" : ""}):`);
		for (const issue of issues) {
			const fieldPath = issue.path.length > 0 ? issue.path.join(".") : "(root)";
			console.error(`      ${fieldPath}: ${issue.message}`);
		}
		return false;
	}

	// Write the original data (not result.data) to preserve any extra fields
	// the AI agent may have added beyond the schema definition.
	const targetDir = path.dirname(targetPath);
	if (!fs.existsSync(targetDir)) {
		fs.mkdirSync(targetDir, { recursive: true });
	}
	fs.writeFileSync(targetPath, JSON.stringify(data, null, 2));
	console.log(`  ✓ ${type}: saved → ${path.relative(process.cwd(), targetPath)}`);
	return true;
}

// ── Help text ─────────────────────────────────────────────────────────────────

function printHelp() {
	console.log(`
Usage: opencoach save-session <type> [options]

Types:
  measures     Anthropometric check-in data
  diet         Nutritional plan (Michaels methodology)
  training     Training session plan
  appointment  Appointment artifact (decisions + preference deltas)
  all          Save measures + diet + training in one command (requires --date)

Options:
  --date YYYY-MM-DD   Resolve path automatically as <type>/<type>-YYYY-MM-DD.json
                      (in-place validate; file must already exist)
  --help              Show this help

Examples:
  opencoach save-session measures --date 2026-04-05
  opencoach save-session diet --date 2026-04-05
  opencoach save-session all --date 2026-04-05
  opencoach save-session training /tmp/draft-training.json
  opencoach save-session appointment --date 2026-04-05

Notes:
  - Without --date, the second argument is treated as a source file path and
    the file is written to <type>/<type>-<today>.json.
  - save-session never modifies .opencode/*, node_modules, or lockfiles.
  - Run  opencoach new-session <type> --date <date>  to create a skeleton first.
`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
	const args = process.argv.slice(2);

	if (args.includes("--help") || args.includes("-h") || args.length === 0) {
		printHelp();
		process.exit(0);
	}

	const type = args[0];
	if (!VALID_TYPES.includes(type)) {
		console.error(`Error: invalid type "${type}".`);
		console.error(`Valid types: ${VALID_TYPES.join(", ")}`);
		console.error(`Run  opencoach save-session --help  for usage.`);
		process.exit(1);
	}

	const dateIdx = args.indexOf("--date");
	let date: string | null = null;
	if (dateIdx !== -1) {
		date = args[dateIdx + 1];
		if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
			console.error("Error: --date requires a value in YYYY-MM-DD format.");
			process.exit(1);
		}
	}

	const explicitPath = !date && args.length >= 2 ? args[1] : null;
	const today = new Date().toISOString().split("T")[0];

	// ── all type ──────────────────────────────────────────────────────────────
	if (type === "all") {
		if (!date) {
			console.error("Error: save-session all requires --date YYYY-MM-DD.");
			process.exit(1);
		}
		console.log(`\nSaving all session types for ${date}...\n`);
		let anyFailed = false;
		for (const t of ALL_TYPES) {
			const p = resolvePath(t, date);
			if (!saveOne(t, p, p)) anyFailed = true;
		}
		if (anyFailed) {
			console.error("\nOne or more session types failed validation. Fix the errors above and retry.");
			process.exit(1);
		}
		console.log("\nAll sessions saved successfully.");
		return;
	}

	// ── single type ───────────────────────────────────────────────────────────
	const sessionType = type as SessionType;
	let sourcePath: string;
	let targetPath: string;

	if (date) {
		const resolved = resolvePath(sessionType, date);
		sourcePath = resolved;
		targetPath = resolved;
	} else if (explicitPath) {
		sourcePath = path.resolve(explicitPath);
		targetPath = resolvePath(sessionType, today);
	} else {
		console.error("Error: provide either --date YYYY-MM-DD or a source file path.");
		console.error(`Run  opencoach save-session --help  for usage.`);
		process.exit(1);
	}

	console.log(`\nSaving ${sessionType} session...\n`);
	if (!saveOne(sessionType, sourcePath, targetPath)) process.exit(1);
}

main().catch((err) => {
	console.error(`Fatal: ${err.message}`);
	process.exit(1);
});
