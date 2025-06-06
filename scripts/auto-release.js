#!/usr/bin/env node

const { execSync } = require("child_process");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function execCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    const output = execSync(command, { encoding: "utf8", stdio: "inherit" });
    console.log(`✅ ${description} completed`);
    return output;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function main() {
  console.log("🚀 React Query External Sync - Automated Release\n");

  // Check if there are uncommitted changes
  try {
    execSync("git diff --exit-code", { stdio: "ignore" });
    execSync("git diff --cached --exit-code", { stdio: "ignore" });
  } catch (error) {
    console.log(
      "📝 You have uncommitted changes. Let me show you what needs to be committed:\n"
    );
    execCommand("git status", "Checking git status");

    const shouldCommit = await askQuestion(
      "\n❓ Do you want to commit these changes? (y/n): "
    );
    if (shouldCommit === "y" || shouldCommit === "yes") {
      const commitMessage = await askQuestion(
        '💬 Enter commit message (or press Enter for "chore: update package"): '
      );
      const message = commitMessage || "chore: update package";
      execCommand("git add .", "Staging changes");
      execCommand(`git commit -m "${message}"`, "Committing changes");
    } else {
      console.log("❌ Please commit your changes before releasing");
      process.exit(1);
    }
  }

  console.log("\n📦 What type of release is this?");
  console.log("1. patch (2.2.0 → 2.2.1) - Bug fixes");
  console.log("2. minor (2.2.0 → 2.3.0) - New features");
  console.log("3. major (2.2.0 → 3.0.0) - Breaking changes");

  const versionType = await askQuestion(
    "\n❓ Enter your choice (1/2/3 or patch/minor/major): "
  );

  let releaseType;
  switch (versionType) {
    case "1":
    case "patch":
      releaseType = "patch";
      break;
    case "2":
    case "minor":
      releaseType = "minor";
      break;
    case "3":
    case "major":
      releaseType = "major";
      break;
    default:
      console.log("❌ Invalid choice. Defaulting to patch release.");
      releaseType = "patch";
  }

  console.log(`\n🎯 Proceeding with ${releaseType} release...\n`);

  // Confirm before proceeding
  const confirm = await askQuestion(
    `❓ Are you sure you want to release a ${releaseType} version? (y/n): `
  );
  if (confirm !== "y" && confirm !== "yes") {
    console.log("❌ Release cancelled");
    process.exit(0);
  }

  rl.close();

  // Execute the release
  console.log("\n🚀 Starting automated release process...\n");

  try {
    // Build the package
    execCommand("npm run build", "Building package");

    // Version bump (this also creates a git tag)
    execCommand(`npm version ${releaseType}`, `Bumping ${releaseType} version`);

    // Push changes and tags
    execCommand("git push", "Pushing changes to git");
    execCommand("git push --tags", "Pushing tags to git");

    // Publish to npm
    execCommand("npm publish", "Publishing to npm");

    // Create GitHub release
    execCommand("npm run github:release", "Creating GitHub release");

    console.log("\n🎉 Release completed successfully!");
    console.log("✅ Version bumped and committed");
    console.log("✅ Changes pushed to git");
    console.log("✅ Package published to npm");
    console.log("✅ GitHub release created");
  } catch (error) {
    console.error("\n❌ Release failed:", error.message);
    process.exit(1);
  }
}

main().catch(console.error);
