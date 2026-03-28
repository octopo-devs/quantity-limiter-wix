## ADDED Requirements

### Requirement: Wix CLI project scaffold
The system SHALL have a Wix CLI project configuration at the repository root that extends the existing Wix app. The project MUST include a valid `wix.config.json` and `.wix/` directory with the app identity.

#### Scenario: CLI project initialization
- **WHEN** `npm create @wix/app@latest` is run with "Extend existing application" selected
- **THEN** the repository root contains `wix.config.json`, `.wix/` directory, and standard Wix CLI project files

#### Scenario: CLI recognizes existing app
- **WHEN** `npm run dev` is executed in the project root
- **THEN** the Wix CLI connects to the existing app and provides a development site URL for preview

### Requirement: Development workflow via Wix CLI
The system SHALL support local development through `npm run dev` provided by the Wix CLI. The dev server MUST connect to a real Wix development site and hot-reload frontend changes.

#### Scenario: Local development startup
- **WHEN** a developer runs `npm run dev` in the project root
- **THEN** the CLI starts a development server, prompts for or connects to a development site, and opens the dashboard extension in the browser

#### Scenario: Hot reload during development
- **WHEN** a developer modifies a frontend source file while `npm run dev` is running
- **THEN** the changes are reflected in the browser preview without manual refresh

### Requirement: App version deployment
The system SHALL support creating new app versions through the Wix CLI for production deployment of the dashboard extension.

#### Scenario: Create app version
- **WHEN** a developer runs the Wix CLI build/deploy command
- **THEN** a new app version is created in the Wix app dashboard containing the latest frontend code

### Requirement: Root package.json with CLI scripts
The system SHALL have a root `package.json` with Wix CLI scripts (`dev`, `build`) and dependencies (`@wix/cli`, `@wix/app`).

#### Scenario: Root package.json exists with CLI dependencies
- **WHEN** the project is set up
- **THEN** the root `package.json` contains `@wix/cli` and `@wix/app` as dependencies, and `dev` and `build` scripts that invoke the Wix CLI
