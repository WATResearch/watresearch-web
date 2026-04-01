# WATResearch Codebase Guidelines

This document defines the architectural rules, branching strategy, and contribution standards for WATResearch's FastAPI + React stack. All contributors are expected to follow these guidelines to maintain production stability.

## Git Branching Strategy (Gitflow)

We follow a strict Gitflow workflow to maintain production stability. **Direct pushes to `main` or `dev` are strictly forbidden!!**

| Branch | Pattern | Purpose | Rule |
| :--- | :--- | :--- | :--- |
| **Production** | `main` | Current live website code. | **Protected.** Merges via PR only. |
| **Development** | `dev` | Integration & testing. | **Protected.** The "source of truth" for devs. |
| **Features** | `feature/*` | New functionality. | Branch off `dev`. PR back to `dev`. |
| **Bugfixes** | `bugfix/*` | Fixing bugs found in `dev`. | Branch off `dev`. PR back to `dev`. |
| **Chores** | `chore/*` | Tooling/Documentation. | Branch off `dev`. PR back to `dev`. |

---

### Naming Conventions

#### Branch Naming
Use `category/short-description` in kebab-case.

| ✅ | `feature/masked-diffusion-sampler` |
|---|---|
| ✅ | `bugfix/fix-absorbing-state-index` |
| ✅ | `chore/update-torch-deps` |
| ✅ | `hotfix/resolve-nelbo-nan` |

#### Commit Messages
Write commits as direct commands, as if instructing the codebase what to do.

| | Example |
|---|---|
| ✅ | `Add MDLM training loop` |
| ❌ | `Fixed timestep discretization in forward process` |
| ✅ | `Update LLaDA eval script for WikiText-103` |
| ❌ | `I fixed the bug` / `tried something` / `WIP` |


## Critical Rules (Zero Tolerance)
* **Secrets:** Never commit `.env` files. Use CI/CD secrets for production.