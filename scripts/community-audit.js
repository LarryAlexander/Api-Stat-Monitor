const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const repoOwner = 'LarryAlexander';
const repoName = 'Api-Stat-Monitor';
const token = process.env.GITHUB_TOKEN;
const isDryRun = process.env.DRY_RUN === 'true' || process.argv.includes('--dry-run') || !token;

// Helper to make GitHub API requests
async function githubRequest(endpoint) {
  if (!token) {
    console.log(`[Dry-Run] Skipping API request for: ${endpoint} (No GITHUB_TOKEN)`);
    return [];
  }
  
  const url = `https://api.github.com${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'PulseBoard-Community-Auditor',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    if (!res.ok) {
      console.error(`GitHub API error on ${endpoint}: ${res.status} ${res.statusText}`);
      return [];
    }
    return await res.json();
  } catch (err) {
    console.error(`Network error on ${endpoint}:`, err);
    return [];
  }
}

// Helper to create a GitHub Issue
async function createIssue(title, body) {
  if (isDryRun) {
    console.log("\n================ [DRY RUN - REPORT OUTPUT] ================");
    console.log(`Title: ${title}`);
    console.log(body);
    console.log("===========================================================");
    return;
  }

  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/issues`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'User-Agent': 'PulseBoard-Community-Auditor',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, body, labels: ['maintenance', 'automated-audit'] })
    });
    if (!res.ok) {
      console.error(`Failed to create issue: ${res.status} ${res.statusText}`);
    } else {
      const issue = await res.json();
      console.log(`Successfully opened audit issue: ${issue.html_url}`);
    }
  } catch (err) {
    console.error("Failed to post issue:", err);
  }
}

// Recursive file scanner for code items
function scanDirectory(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (['node_modules', '.next', '.git', 'test-results', 'playwright-report', 'out'].includes(file)) {
      continue;
    }
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      scanDirectory(filePath, fileList);
    } else {
      if (/\.(ts|tsx|js|jsx|rules|json|yml|yaml|md)$/.test(file)) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

// Audit 1: Search for TODO/FIXME comments
function auditTodos() {
  const files = [];
  scanDirectory(path.join(process.cwd(), 'app'), files);
  scanDirectory(path.join(process.cwd(), 'components'), files);
  scanDirectory(path.join(process.cwd(), 'lib'), files);
  
  const results = [];
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('TODO') || line.includes('FIXME')) {
        results.push({
          file: path.relative(process.cwd(), file),
          line: idx + 1,
          text: line.trim()
        });
      }
    });
  }
  return results;
}

// Audit 2: Validate ESLint
function auditLinter() {
  try {
    execSync('npm run lint', { stdio: 'pipe' });
    return { clean: true, output: '' };
  } catch (err) {
    return { clean: false, output: err.stdout ? err.stdout.toString() : err.message };
  }
}

// Main execution flow
async function main() {
  console.log("Starting Daily Community & Codebase Audit...");
  
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  // A. Check GitHub API for active Issues and PRs
  const issues = await githubRequest(`/repos/${repoOwner}/${repoName}/issues?state=all&since=${oneDayAgo.toISOString()}`);
  const events = await githubRequest(`/repos/${repoOwner}/${repoName}/events`);

  const activePRs = [];
  const activeIssues = [];
  let newStars = 0;
  let newForks = 0;

  // Process Issues & PRs
  issues.forEach(item => {
    const created = new Date(item.created_at);
    if (created >= oneDayAgo) {
      if (item.pull_request) {
        activePRs.push(item);
      } else {
        activeIssues.push(item);
      }
    }
  });

  // Process Events
  events.forEach(event => {
    const created = new Date(event.created_at);
    if (created >= oneDayAgo) {
      if (event.type === 'WatchEvent') newStars++;
      if (event.type === 'ForkEvent') newForks++;
    }
  });

  console.log(`Found ${activeIssues.length} new issues, ${activePRs.length} new PRs, ${newStars} stars, and ${newForks} forks.`);

  const hasActivity = activeIssues.length > 0 || activePRs.length > 0 || newStars > 0 || newForks > 0;

  if (hasActivity && !isDryRun) {
    // Compile activity report
    let body = `## Daily Community Activity Digest\n\n`;
    body += `Active occurrences in the last 24 hours:\n\n`;
    
    if (activePRs.length > 0) {
      body += `### 📂 Pull Requests\n`;
      activePRs.forEach(pr => {
        body += `- [#${pr.number}](${pr.html_url}) - ${pr.title} (by @${pr.user.login})\n`;
      });
      body += `\n`;
    }

    if (activeIssues.length > 0) {
      body += `### 🐛 Issues\n`;
      activeIssues.forEach(issue => {
        body += `- [#${issue.number}](${issue.html_url}) - ${issue.title} (by @${issue.user.login})\n`;
      });
      body += `\n`;
    }

    if (newStars > 0 || newForks > 0) {
      body += `### 📈 Repository Actions\n`;
      if (newStars > 0) body += `- ⭐ **+${newStars}** new stars\n`;
      if (newForks > 0) body += `- 🍴 **+${newForks}** new forks\n`;
    }

    console.log("Activity detected! Posting digest.");
    await createIssue(`[Daily Digest] Community Activity Report - ${new Date().toLocaleDateString()}`, body);
    return;
  }

  // B. Run Codebase Audit if no community activity
  console.log("No new community action required. Commencing codebase audit...");

  const todos = auditTodos();
  const linter = auditLinter();
  
  // Format codebase audit report
  let report = `# Automated Codebase Health Audit Report\n\n`;
  report += `> Run Date: **${new Date().toLocaleDateString()}**\n`;
  report += `> Result: **No active community alerts. Automated quality audit triggered.**\n\n`;

  // 1. Linter section
  report += `## 1. ESLint Status\n`;
  if (linter.clean) {
    report += `🟢 **ESLint passed with zero errors or warnings.**\n\n`;
  } else {
    report += `⚠️ **Linter issues found:**\n`;
    report += `\`\`\`text\n${linter.output.substring(0, 800)}\n... (truncated if long)\n\`\`\`\n\n`;
  }

  // 2. TODOs section
  report += `## 2. Codebase TODOs & FIXMEs\n`;
  if (todos.length === 0) {
    report += `🟢 **Zero active TODOs or FIXMEs found in the application code.**\n\n`;
  } else {
    report += `| File | Line | Suggestion / Note |\n`;
    report += `|---|---|---|\n`;
    todos.forEach(todo => {
      report += `| \`${todo.file}\` | ${todo.line} | \`${todo.text.replace(/\|/g, '\\|')}\` |\n`;
    });
    report += `\n`;
  }

  // 3. Automated recommendations
  report += `## 3. General Health Assessment\n`;
  let warnings = 0;
  if (!linter.clean) warnings++;
  if (todos.length > 5) warnings++;

  if (warnings === 0) {
    report += `🟢 **Excellent codebase health.** No urgent refactoring or lint corrections are suggested. Everything matches production guidelines.\n`;
  } else {
    report += `🟡 **Codebase has minor maintenance debt.** Suggest addressing the linter warnings and refactoring outstanding TODO comments outlined above.\n`;
  }

  await createIssue(`[Daily Audit] Codebase Health & Suggestions - ${new Date().toLocaleDateString()}`, report);
}

main().catch(err => {
  console.error("Audit script failed:", err);
  process.exit(1);
});
