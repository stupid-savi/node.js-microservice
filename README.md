### Linting

eslint :- for eslint-ts configuration & rules :- `https://typescript-eslint.io, https://eslint.org/docs/latest/rules`

### Formatting

prettier :- `https://prettier.io/docs/en/install

### Git Hooks Automation

Git Hooks :- Husky and lint-staged :- `https://typicode.github.io/husky/get-started.html, https://github.com/lint-staged/lint-staged`

Husky allows us to register git hooks so we can automate linting and prettier commands for git actions like commit, push etc. and lint-staged only apply linting and formatting to changed files not the entire folder or files

### Logging

logger :- winston

### Testing

For jest testing - `pnpm add --save-dev jest, pnpm add --save-dev ts-jest, npx ts-jest config init, pnpm add --save-dev @types/jest, pnpm add --save-dev supertest @types/supertest `

### Test Driven Development (TDD)

![alt text](assets/test-driven-development.webp)

Note:- In case of testing i.e jest it automatically set the NODE_ENV = test so no need to add cross-env NODE_ENV = test in its script
