# @neofork/devlogr

> Because deployment tools deserve better than sad `console.log()`s.

<p align="center">
  <div style="border: 2px solid #e1e4e8; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <img src="https://raw.githubusercontent.com/neoforkdev/devlogr/refs/heads/main/.github/demo.gif" alt="devlogr demo animation" width="100%" style="max-width: 800px;">
  </div>
</p>

<div align="center"><strong>⚡ The logger for UX-friendly deployment tools ⚡</strong><br/>CLI-native, CI-compliant, emoji-sprinkled delight. No setup. All signal.</div>

---

## 🎯 Built for CLI tools. Like, actually.

Most loggers are backend-first or some sad cousin of `console.log`. `devlogr` isn’t.

This is structured logging with style, made for devtools, task runners, release scripts, and CLI utilities that _actually_ run in terminals—whether it's your local shell or your CI pipeline.

No brittle hacks. No bland output. Just focused feedback, clean visuals, and useful context—designed for the humans running your tools.

---

## 🚀 Quickstart

```bash
npm install @neofork/devlogr
```

```ts
import { createLogger } from '@neofork/devlogr';

const log = createLogger('my-cli');

log.title('🔧 Setup');
log.info('Starting process');
log.success('Complete!');

log.startSpinner('Working...');
log.updateSpinnerText('Still going...');
log.completeSpinnerWithSuccess('All done!');
```

---

## ✨ Features That Make DevOps Swoon

- 🎨 **Looks Amazing** – Styled output with color, emoji, and Unicode where supported
- 🧠 **Made for Humans** – Clear, scannable messages designed for fast reading
- 🌀 **Animated Spinners** – Fully interactive, CI-safe feedback loops
- ⚙️ **Zero Config** – Drop-in defaults, full customization optional
- 🧱 **CLI-Native Design** – Terminal-aware and CI-friendly
- 📄 **JSON Mode** – Structured logs when you need machine parsing
- 🔐 **Safe Logging** – Handles circular refs and edge cases gracefully
- 🧪 **Fully Tested** – 200+ tests across scenarios
- 🙅 **No Visual Junk** – Disables emoji, color, or Unicode when terminals can't handle them

---

## 🧩 Logging Methods

```ts
log.error('Something broke');
log.warning('This might be an issue');
log.info('FYI');
log.debug('Debugging info');
log.success('It worked!');
log.task('Running something...');
log.title('🚀 Deployment Phase');
log.plain('No formatting here.');
```

---

## 🕹 Spinner Control

```ts
log.startSpinner('Loading...');
log.updateSpinnerText('Still loading...');
log.succeedSpinner('Loaded');
log.failSpinner('Failed');
log.completeSpinnerWithSuccess('Mission accomplished');
```

---

## 📚 Examples Directory

Want to see DevLogr in action? Check out our comprehensive examples:

**[👉 View Examples](./examples/README.md)**

The examples include:

- All logging methods
- Task sequencing and spinner chaining
- JSON output mode
- Environment config toggles
- Integration with tools like `listr2`

Run any example with: `npm run example:<name>`

---

## 📖 API Documentation

Complete API documentation is available at: **[https://neoforkdev.github.io/devlogr/](https://neoforkdev.github.io/devlogr/)**

### Generate Documentation Locally

```bash
npm run docs          # Generate TypeDoc documentation
npm run docs:serve    # Generate and serve documentation locally
```

The documentation is automatically generated and deployed:

- **Latest**: Updated on every push to `main` → [/latest/](https://neoforkdev.github.io/devlogr/latest/)
- **Versioned**: Created for each git tag → [/v0.0.1/](https://neoforkdev.github.io/devlogr/v0.0.1/), etc.

---

## ⚙️ Environment Variables

<table>
<thead>
<tr><th>Variable</th><th>Description</th><th>Example</th></tr>
</thead>
<tbody>
<tr><td><code>DEVLOGR_LOG_LEVEL</code></td><td>Set log level</td><td><code>debug</code></td></tr>
<tr><td><code>DEVLOGR_OUTPUT_JSON</code></td><td>Structured logs</td><td><code>true</code></td></tr>
<tr><td><code>DEVLOGR_SHOW_TIMESTAMP</code></td><td>Timestamps</td><td><code>false</code>, <code>true</code>, <code>iso</code></td></tr>
<tr><td><code>DEVLOGR_NO_COLOR</code></td><td>Disable colors</td><td><code>true</code></td></tr>
<tr><td><code>DEVLOGR_FORCE_COLOR</code></td><td>Force color</td><td><code>true</code></td></tr>
<tr><td><code>DEVLOGR_NO_EMOJI</code></td><td>No emojis</td><td><code>true</code></td></tr>
<tr><td><code>DEVLOGR_NO_UNICODE</code></td><td>ASCII only</td><td><code>true</code></td></tr>
<tr><td><code>NO_COLOR</code></td><td>Global disable</td><td><code>1</code></td></tr>
<tr><td><code>NO_EMOJI</code></td><td>Global disable emojis</td><td><code>1</code></td></tr>
<tr><td><code>NO_UNICODE</code></td><td>Global disable Unicode</td><td><code>1</code></td></tr>
</tbody>
</table>

---

## 🛠️ Development Scripts

```bash
npm run format        # Check code formatting
npm run format:fix    # Fix formatting
npm run lint          # Lint check
npm run lint:fix      # Fix linting issues
npm run check         # Run all checks
npm run fix           # Fix everything
```

---

## 🧠 Smart Defaults, Powerful Control

- **Terminal detection** for auto-adjusted output
- **JSON-first mode** disables visual effects for clean CI/CD output
- **Timestamps** are optional and configurable
- **Visuals adapt** for broken or minimal terminals

---

## 📜 License

MIT — Use it, fork it, log it.

---

## 🤝 Contribute

Pull requests welcome. Tests required. Style optional but encouraged.
