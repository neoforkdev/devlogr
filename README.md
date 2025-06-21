# @neofork/devlogr

> Because dev tools deserve better than sad `console.log()`s.

![devlogr demo animation](./github/demo.gif)

<div align="center"><strong>⚡ UX-first logger for modern CLI tools ⚡</strong><br/>Clean visuals, emoji joy, animated spinners, and smart formatting—<em>zero config required</em>.</div>

---

## 🎯 Made for CLI tools. Seriously.

Most loggers are backend-first. `devlogr` isn’t.

It's built for the command line. For dev tools. For you—the developer who cares about UX even when nobody else does.

Forget boring output. Ditch brittle hacks. This is structured logging with personality and power.

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

## ✨ Features Developers Actually Want

- 🎨 **Looks Amazing** – Stylish output with color, emoji, and Unicode (where supported)
- 🧠 **Built for Humans** – Messages that make sense at a glance
- 🌀 **Animated Spinners** – Fully interactive, fallback-safe
- ⚙️ **Zero Config** – No setup needed, but fully customizable
- 🧱 **CLI-Native Design** – Terminal aware, CI/CD compatible
- 📄 **JSON Mode** – Machine-readable output when you need it
- 🔐 **Safe Logging** – Circular references? Handled.
- 🧪 **Fully Tested** – 200+ tests, real-world hardened
- 🙅 **No Visual Junk** – Automatically disables color/emojis on outdated terminals

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
log.completeSpinnerWithSuccess('Loaded');
log.completeSpinnerWithError('Failed');
```

Or use named spinners for more control:

```ts
import { SpinnerUtils } from '@neofork/devlogr';

SpinnerUtils.start('build', { text: 'Building...', color: 'yellow' });
SpinnerUtils.succeed('build', 'Build done!');
```

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

## 🧠 Smart Defaults, Powerful Options

- **Automatically detects** terminal features and disables bells and whistles when needed
- **Timestamps** off by default—turn on with `DEVLOGR_SHOW_TIMESTAMP=true` or `=iso`
- **JSON mode** disables animations—great for CI logs and structured output

---

## 📜 License

MIT — Use it, fork it, ship it.

---

## 🤝 Contribute

Pull requests welcome. Tests are required. Opinions are free.
