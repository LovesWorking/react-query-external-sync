# Release Automation Scripts

This directory contains scripts to automate the release process for the react-query-external-sync package.

## Scripts

### `auto-release.js`

The main automated release script that handles the entire release workflow:

- ✅ Checks for uncommitted changes and offers to commit them
- ✅ Interactive version selection (patch/minor/major)
- ✅ Builds the package
- ✅ Bumps version and creates git tag
- ✅ Pushes changes and tags to git
- ✅ Publishes to npm
- ✅ Creates GitHub release with auto-generated release notes

**Usage:**

```bash
npm run release:auto
```

### `github-release.js`

Creates a GitHub release with auto-generated release notes based on commits since the last tag.

**Usage:**

```bash
npm run github:release
```

## Setup for GitHub Releases

To enable automatic GitHub release creation, you need to set up a GitHub token:

1. Go to https://github.com/settings/tokens
2. Create a new token with "repo" permissions
3. Add it to your environment:
   ```bash
   export GITHUB_TOKEN=your_token_here
   ```
4. Or add it to your `~/.zshrc` or `~/.bashrc` for persistence

## Available npm Scripts

- `npm run release:auto` - Interactive automated release
- `npm run release:patch` - Direct patch release
- `npm run release:minor` - Direct minor release
- `npm run release:major` - Direct major release
- `npm run github:release` - Create GitHub release only
- `npm run pre-release` - Check git status before release
