# Git Commit Guide for WDUPMS Frontend

## Initial Setup

### 1. Initialize Git (if not already done)
```bash
cd frontend
git init
```

### 2. Create .gitignore
Already created with Next.js defaults. Includes:
- node_modules/
- .next/
- .env*.local
- build files

## Recommended Commit Strategy

### Step 1: Initial Project Setup
```bash
git add package.json package-lock.json tsconfig.json next.config.ts
git add tailwind.config.ts postcss.config.mjs eslint.config.mjs
git commit -m "chore: initialize Next.js project with TypeScript and Tailwind CSS"
```

### Step 2: Core Library Files
```bash
git add lib/types.ts lib/api.ts lib/auth.ts lib/utils.ts
git commit -m "feat: add core library files (types, API client, auth utilities)"
```

### Step 3: UI Components
```bash
git add components/ui/
git commit -m "feat: add reusable UI components (Button, Input, Select, Table, Card, Badge)"
```

### Step 4: Layout Components
```bash
git add components/layout/
git commit -m "feat: add layout components (Header, Sidebar, DashboardLayout)"
```

### Step 5: Authentication
```bash
git add app/login/ app/page.tsx app/layout.tsx app/globals.css
git commit -m "feat: implement authentication system with login page"
```

### Step 6: Dashboard
```bash
git add app/dashboard/
git commit -m "feat: add dashboard with statistics and recent activities"
```

### Step 7: Asset Management
```bash
git add app/assets/
git commit -m "feat: implement asset management (list, register, view)"
```

### Step 8: Transfer Management
```bash
git add app/transfers/
git commit -m "feat: add transfer management with approval workflow"
```

### Step 9: Reports
```bash
git add app/reports/
git commit -m "feat: implement reporting system with filters"
```

### Step 10: Remaining Pages
```bash
git add app/assignments/ app/returns/ app/requests/ app/users/
git commit -m "feat: add placeholder pages for assignments, returns, requests, and users"
```

### Step 11: Documentation
```bash
git add README.md SETUP.md COMMIT_GUIDE.md .env.local
git commit -m "docs: add comprehensive documentation and setup guides"
```

## Alternative: Single Commit Approach

If you prefer to commit everything at once:

```bash
git add .
git commit -m "feat: complete WDUPMS frontend implementation

- Next.js 15 with TypeScript and Tailwind CSS
- Role-based authentication system
- Asset management (CRUD operations)
- Transfer workflow with approvals
- Dashboard with statistics
- Reporting system
- Reusable UI components
- Responsive layout with sidebar navigation
- API client for backend integration
- Comprehensive documentation"
```

## Conventional Commit Types

Use these prefixes for clear commit history:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## Example Commit Messages

```bash
# Good commit messages
git commit -m "feat: add asset search functionality"
git commit -m "fix: resolve authentication token expiration issue"
git commit -m "docs: update API integration guide"
git commit -m "style: format code with Prettier"
git commit -m "refactor: optimize dashboard data fetching"

# Bad commit messages (avoid these)
git commit -m "update"
git commit -m "fix stuff"
git commit -m "changes"
```

## Pushing to GitHub

### First Time Setup
```bash
# Create repository on GitHub first, then:
git remote add origin https://github.com/yourusername/property-management-system.git
git branch -M main
git push -u origin main
```

### Subsequent Pushes
```bash
git push origin main
```

## Branch Strategy (Recommended for Team)

### Main Branches
- `main` - Production-ready code
- `develop` - Development branch

### Feature Branches
```bash
# Create feature branch
git checkout -b feature/asset-assignment
# Work on feature
git add .
git commit -m "feat: implement asset assignment workflow"
# Push feature branch
git push origin feature/asset-assignment
# Create pull request on GitHub
```

### Example Workflow
```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/notification-system

# Make changes
git add .
git commit -m "feat: add notification center"

# Push and create PR
git push origin feature/notification-system
```

## Checking Status Before Commit

```bash
# See what files changed
git status

# See specific changes
git diff

# See staged changes
git diff --staged
```

## Undoing Changes

```bash
# Unstage file
git reset HEAD filename

# Discard changes in working directory
git checkout -- filename

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

## Viewing History

```bash
# View commit history
git log

# View compact history
git log --oneline

# View history with graph
git log --graph --oneline --all
```

## Tags for Releases

```bash
# Create tag
git tag -a v1.0.0 -m "Initial release"

# Push tags
git push origin --tags

# List tags
git tag -l
```

## .gitignore Best Practices

Already configured in the project:
```
# Dependencies
node_modules/

# Next.js
.next/
out/

# Environment
.env*.local

# Debug
npm-debug.log*

# OS
.DS_Store
Thumbs.db
```

## Pre-commit Checklist

Before committing, ensure:
- [ ] Code builds without errors (`npm run build`)
- [ ] No console errors in browser
- [ ] Code is formatted consistently
- [ ] No sensitive data (API keys, passwords)
- [ ] .env.local is in .gitignore
- [ ] Commit message is clear and descriptive

## Collaboration Tips

1. **Pull before push**: Always `git pull` before pushing
2. **Small commits**: Make frequent, small commits
3. **Clear messages**: Write descriptive commit messages
4. **Review changes**: Use `git diff` before committing
5. **Branch per feature**: Create separate branches for features

## Common Issues

### Merge Conflicts
```bash
# Pull latest changes
git pull origin main

# Resolve conflicts in files
# Then:
git add .
git commit -m "fix: resolve merge conflicts"
git push origin main
```

### Accidentally Committed Sensitive Data
```bash
# Remove from last commit
git rm --cached .env.local
git commit --amend -m "chore: remove sensitive file"

# If already pushed, contact team immediately
```

## GitHub Actions (Optional)

Create `.github/workflows/ci.yml` for automated testing:
```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - run: npm run lint
```

## Summary

For a clean first commit:
```bash
git add .
git commit -m "feat: initial WDUPMS frontend implementation with Next.js"
git push origin main
```

Then continue with feature-based commits as you develop.
