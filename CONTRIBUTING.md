# Contributing to Personal AI Coaching Expert

Thank you for your interest in contributing! This document explains how to propose changes, run tests, and submit high-quality pull requests so we can review and merge them faster.

## Code of conduct

Please follow the project's Code of Conduct. If you don't have one yet, keep interactions respectful and constructive when opening issues or PRs.

## How to contribute

1. Fork the repository and create a branch from `develop` for your change. Use a descriptive branch name (e.g., `feature/auth-google`, `fix/backend-ci`).
2. Make small, focused changes. Each pull request should address only one logical change or issue.
3. Run tests and linters locally before opening a PR.
4. Open a pull request against the `develop` branch and include a clear description of the changes, why they were made, and any migration or configuration steps needed.

## Branching and PR guidelines

- Base your PRs on `develop` (not `main`).
- Use conventional commits or clear commit messages describing the change.
- Include screenshots or recordings for UI changes when applicable.

## Development workflow

- Keep dependencies minimal and add a single entry per PR if you need to update them.
- When you add or change environment variables, include them in `backend/.env.example` (or document them in the README).

## Testing

- Backend tests: use Django's test runner.

```pwsh
cd backend
python manage.py test
```

- Add tests for any bug fix or new feature. New code should include appropriate unit tests where applicable.

## Linting and formatting

- Follow existing code style.
- For frontend, run ESLint / TypeScript checks before opening PRs:

```pwsh
cd frontend
npm run lint
```

- For Python, use your preferred formatter (black/ruff) if applicable. If you'd like, we can add a pre-commit configuration.

## Reviewing process

- PRs will be reviewed on `develop`. Expect at least one reviewer to request changes or approve.
- Address review comments by pushing follow-up commits to the same branch.

## Contributors

Thanks to everyone who contributes. Add yourself to CONTRIBUTORS.md (optional) after your first PR is merged.
