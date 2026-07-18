# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2026-07-18

### Added
- Sort options on frontend (Default, Alphabetical A-Z, Z-A).
- Modern pulsing Skeleton Loading cards replacing the old text spinner.
- Deep linking support (URL query sync) for search, category, sort, and tag filters.
- Zero-dependency Node.js unit tests (`scripts/generate-metadata.test.js`) to validate metadata utilities.
- Automatic JS syntax checks on every pull request.
- Community template additions: `.github/CODEOWNERS`, `.github/dependabot.yml`, `.github/PULL_REQUEST_TEMPLATE.md`, and issue YAML forms (`bug_report.yml`, `feature_request.yml`, `template_submission.yml`).
- Added `SECURITY.md`, `sitemap.xml`, and `robots.txt` configuration.
- ESLint and Prettier configs (`.eslintrc.json`, `.prettierrc`).

### Fixed
- Critical XSS vulnerability in tag filtering by employing event delegation.
- Out-of-memory closure leaks on modal preview iframe height handlers.
- Escape outputs inside template rendering and category names formatting.
- PR validation logic checks allowing capital letters in usernames and checking credit files strictly for new templates only.
- Concurrency race conditions in deploy actions by locking target checkout SHA.

### Changed
- Restructured pages deploy artifact to upload a clean `_site/` build containing only public files.
- Consolidated stylesheets, clearing duplicated CSS classes and animations.
- Downgraded CI runner environments to Node 22 (LTS).
- Prioritized client-side local `marked.js` parsing to avoid GitHub API rate limiting.

## [1.1.0] - 2025-10-07

### Added
- Project website integration: https://z0zerox.github.io/Awesome-Profile-README-Templates
- Website badge in README.md header section
- Prominent website links across all documentation files
- Comprehensive Tools & Resources guide (TOOLS.md)
- Detailed Best Practices guide (BEST_PRACTICES.md) 
- Enhanced Featured Profiles section (FEATURED.md)
- Live preview functionality promotion throughout docs

### Enhanced
- README.md with website integration and improved resource section
- Template Guide with website preview links
- Documentation structure with cross-references
- User experience with easy access to live template previews

### Documentation
- Complete overhaul of minimal documentation files
- Added comprehensive tool recommendations and generators
- Detailed best practices for profile creation and maintenance
- Framework for community-featured profiles
- Enhanced navigation between documentation sections

## [1.0.0] - 2025-10-01

### Added
- Initial release of Awesome GitHub Profile README Templates
- 9 main template categories with organized folder structure
- Basic documentation structure with placeholder files
- Contributing guidelines and code of conduct
- MIT License
- Repository structure and organization

### Template Categories
- 🎨 Creative & Artistic - Artistic designs and animations
-  💻 Code-Focused - Code-heavy and development themes
- ⚡ Dynamic & Interactive - Real-time updates and interactive elements
- 🎯 Minimalistic - Clean and simple designs
- 📊 Data & Visual - Charts, graphs, and statistics
- 🎬 Media-Rich - Image and GIF heavy templates
- 🏷️ Badges & Icons - Skill badges and technology icons
- ✨ Showcase Collections - Comprehensive templates
- 🔧 Others - Experimental and unique designs

### Documentation
- Basic README.md with project overview
- CONTRIBUTING.md with contribution guidelines
- CODE_OF_CONDUCT.md for community standards
- Basic documentation folder structure

### Infrastructure
- GitHub repository setup
- Folder organization for templates
- Basic project structure

## [0.1.0] - 2025-10-01

### Added
- Initial project concept and repository creation
- Basic folder structure planning
- Initial template collection research

---

## Types of Changes
- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` in case of vulnerabilities