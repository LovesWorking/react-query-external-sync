#!/usr/bin/env node

const { execSync } = require("child_process");
const https = require("https");
const fs = require("fs");

function execCommand(command) {
  try {
    return execSync(command, { encoding: "utf8" }).trim();
  } catch (error) {
    console.error(`Command failed: ${command}`);
    throw error;
  }
}

function makeGitHubRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`GitHub API error: ${res.statusCode} - ${body}`));
        }
      });
    });

    req.on("error", reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function createGitHubRelease() {
  try {
    // Get package info
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const version = packageJson.version;
    const tagName = `v${version}`;

    // Get repository info from package.json
    const repoUrl = packageJson.repository.url;
    const repoMatch = repoUrl.match(/github\.com[\/:]([^\/]+)\/([^\/\.]+)/);

    if (!repoMatch) {
      throw new Error("Could not parse GitHub repository from package.json");
    }

    const owner = repoMatch[1];
    const repo = repoMatch[2];

    // Get GitHub token from environment
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.log("⚠️  GITHUB_TOKEN not found in environment variables.");
      console.log("📝 To create GitHub releases automatically, please:");
      console.log("   1. Go to https://github.com/settings/tokens");
      console.log('   2. Create a new token with "repo" permissions');
      console.log(
        "   3. Add it to your environment: export GITHUB_TOKEN=your_token"
      );
      console.log("   4. Or add it to your ~/.zshrc or ~/.bashrc");
      console.log("\n✅ For now, you can manually create a release at:");
      console.log(
        `   https://github.com/${owner}/${repo}/releases/new?tag=${tagName}`
      );
      return;
    }

    // Get recent commits for release notes
    let releaseNotes = "";
    try {
      const lastTag = execCommand(
        'git describe --tags --abbrev=0 HEAD~1 2>/dev/null || echo ""'
      );
      const commitRange = lastTag ? `${lastTag}..HEAD` : "HEAD";
      const commits = execCommand(
        `git log ${commitRange} --pretty=format:"- %s" --no-merges`
      );
      releaseNotes = commits || "- Initial release";
    } catch (error) {
      releaseNotes = "- Package updates and improvements";
    }

    // Create the release
    const releaseData = {
      tag_name: tagName,
      target_commitish: "main",
      name: `Release ${tagName}`,
      body: `## Changes\n\n${releaseNotes}\n\n## Installation\n\n\`\`\`bash\nnpm install ${packageJson.name}@${version}\n\`\`\``,
      draft: false,
      prerelease: version.includes("-"),
    };

    const options = {
      hostname: "api.github.com",
      port: 443,
      path: `/repos/${owner}/${repo}/releases`,
      method: "POST",
      headers: {
        Authorization: `token ${token}`,
        "User-Agent": "npm-release-script",
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json",
      },
    };

    console.log(`🔄 Creating GitHub release for ${tagName}...`);
    const release = await makeGitHubRequest(options, releaseData);

    console.log(`✅ GitHub release created successfully!`);
    console.log(`🔗 Release URL: ${release.html_url}`);
  } catch (error) {
    console.error("❌ Failed to create GitHub release:", error.message);

    // Provide fallback instructions
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const version = packageJson.version;
    const tagName = `v${version}`;
    const repoUrl = packageJson.repository.url;
    const repoMatch = repoUrl.match(/github\.com[\/:]([^\/]+)\/([^\/\.]+)/);

    if (repoMatch) {
      const owner = repoMatch[1];
      const repo = repoMatch[2];
      console.log(`\n📝 You can manually create the release at:`);
      console.log(
        `   https://github.com/${owner}/${repo}/releases/new?tag=${tagName}`
      );
    }
  }
}

createGitHubRelease();
