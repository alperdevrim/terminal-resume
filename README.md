# terminal-resume

**Live at [www.alperdevrim.com](https://www.alperdevrim.com)**

A personal resume/portfolio site whose entire UI is a simulated terminal. There's no navbar, no cards, no conventional page chrome — visitors explore the resume by typing commands at a prompt (`help`, `about`, `experience`, `ls`, `cat`, ...), exactly like a real shell.

Everything runs client-side against data parsed from [`src/data/resume.yaml`](src/data/resume.yaml) at build time. There is no backend, no `eval`, and no server round-trip for commands — only a fixed set of predefined commands.

## Quick start

Requires Node 20+.

```bash
npm install
npm run dev       # start the dev server at http://localhost:5173
```

Other scripts:

```bash
npm run build      # type-check, then produce a static build in dist/
npm run preview     # serve the production build locally
npm test            # run the unit test suite once
npm run test:watch  # run tests in watch mode
npm run lint         # lint with oxlint
```

## Editing your resume — `resume.yaml`

All resume content lives in [`src/data/resume.yaml`](src/data/resume.yaml). Nothing personal is hardcoded in components — edit this file and the site updates. The shape it's parsed into is defined in [`src/lib/resume/types.ts`](src/lib/resume/types.ts); the parser ([`src/lib/resume/transform.ts`](src/lib/resume/transform.ts)) fills in sensible defaults for missing/malformed fields rather than crashing, so partial edits are safe.

```yaml
profile:
  name: "Your Name"
  title: "Your Title"
  location: "Your Location"
  summary: "A short professional summary."

experience:
  - company: "Company Name"
    position: "Your Role"
    start_date: "2023"
    end_date: "Present"          # omit for "Present"
    description:
      - "An achievement or responsibility"
    technologies:
      - TypeScript

education:
  - institution: "University"
    degree: "Degree"
    start_date: "2020"
    end_date: "2024"
    details:
      - "Optional detail line"

skills:
  cloud:                          # category name -> list of skills
    - AWS                         # bare string: just a name
    - name: "Kubernetes"          # or a mapping, for a proficiency meter
      level: 75                   # 0-100; omit for no meter
      color: blue                 # optional accent

languages:                        # spoken languages
  - name: "English"
    level: 100
    note: "Native"                # free text, e.g. a CEFR level
    color: green

projects:
  - name: "Project Name"
    description: "What it does."
    technologies:
      - Go
    url: "https://example.com"    # or omit / null

certifications:
  - name: "Certification"
    issuer: "Issuer"
    date: "2025"

contact:
  email: "you@example.com"
  phone: null                     # optional
  website: null                   # optional

socials:
  github: "https://github.com/you"
  linkedin: "https://linkedin.com/in/you"

terminal:                         # terminal chrome, not resume content
  user: "root"                    # null -> slug of profile.name
  host: "resume"                  # null -> "resume"
  welcome: "Welcome to {name}'s interactive resume."
  exit_url: "https://example.com" # where `exit` goes; null disables it
  commands:                       # per-command on/off switches
    about: true                   # every command is listed; see below
    ls: false
```

Every resume section maps to both a command (`experience`, `skills`, ...) and an entry in the virtual filesystem browsable with `ls`/`cat` (e.g. `cat experience/company-name`).

### The `terminal` section

`terminal` is the one section that isn't resume content — it's the shell's own dressing:

- **`user` / `host`** build the `user@host:~$` prompt. Set either to `null` to fall back to a slug of `profile.name` and `"resume"` respectively, so `user: "root"`, `host: "example"` renders `root@example:~$`.
- **`welcome`** is the line printed once the boot sequence finishes, typed out character by character. The command list is printed straight after it, so visitors see what's available without having to run `help` first. `{name}` is replaced with `profile.name` wherever it appears, so you can rewrite the copy without hardcoding your name — `welcome: "{name}'s resume. Type help."`. Set it to `null` for the default, `"Welcome to {name}'s interactive resume."`
- **`exit_url`** is where the `exit` command sends visitors — typically a LinkedIn profile or homepage. Leave it `null` and `exit` just prints a message instead of navigating.
- **`commands`** switches individual commands on and off. **Every** command can be toggled — the shipped `resume.yaml` lists all of them explicitly, so the block doubles as the canonical index of what the terminal knows:

  ```yaml
  terminal:
    commands:
      help: true
      about: true
      experience: true
      education: true
      skills: true
      languages: true
      projects: true
      certifications: true
      contact: true
      socials: true
      history: true
      clear: true
      exit: true
      whoami: false
      ls: false
      cat: false
  ```

  Commands are **opt-out**, so deleting a line leaves that command enabled and adding a new command to the registry never requires touching this map. A disabled command is genuinely gone, not merely hidden: it drops out of `help`, out of Tab completion, out of "did you mean" suggestions, and typing it reports `command not found`. Only real booleans count — `ls: "no"` is ignored.

  `help` is toggleable like everything else. Turning it off is allowed, but leaves visitors with no way to discover the remaining commands.

  A test asserts this block lists exactly the commands in the registry, so the two can't drift apart.

### Proficiency meters and accent colors

Skills and languages accept an optional `level` (0–100) that renders as a meter:

```text
  Kubernetes  [███████████████░░░░░]  75%
```

A skills category stays a compact `·`-joined list until at least one of its skills declares a level, at which point every skill in that category gets its own row so the meters align. Out-of-range levels are clamped rather than rejected.

Experience, education, project, certification, skill and language entries all accept `color`, drawn from a fixed terminal-ish palette: `red`, `green`, `yellow`, `orange`, `blue`, `purple`, `pink`, `cyan`. Unrecognized names are ignored rather than passed through to the DOM.

## Adding a new command

Commands live in [`src/lib/commands/registry.ts`](src/lib/commands/registry.ts) as a flat array of `{ name, description, run }` objects (see `Command` in [`src/lib/commands/types.ts`](src/lib/commands/types.ts)). To add one:

1. Write a formatter that returns `OutputLine[]` — either reuse one from [`src/lib/resume/format.ts`](src/lib/resume/format.ts) or add a new one there.
2. Push a new `Command` entry in `registry.ts`:

   ```ts
   { name: 'mycommand', description: 'What it does', run: (_args, ctx) => output(formatMyThing(ctx.resume)) }
   ```

3. It's automatically picked up by `help`, Tab autocomplete, and unknown-command "did you mean" suggestions — no other wiring needed.

Commands are case-sensitive, like a real shell.

## Adding a new resume section

1. Extend the `Resume` type in `src/lib/resume/types.ts`.
2. Add a matching parse function in `src/lib/resume/transform.ts` (see the existing `parseX` helpers — keep it tolerant of missing/malformed YAML).
3. Add a formatter in `src/lib/resume/format.ts`.
4. Optionally expose it as a command (see above) and/or as a file in the virtual filesystem in `src/lib/vfs/buildVfs.ts`.
5. Add the corresponding YAML under a new top-level key in `resume.yaml`.

## Architecture

```
src/
  data/resume.yaml        the only place personal content lives
  lib/
    resume/                types, YAML -> Resume transform, section formatters
    vfs/                    resume data -> browsable ls/cat file tree
    commands/               tokenizer, command registry, executor, typo suggestions
    terminal/                command history, tab-autocomplete, boot sequence, prompt
    output.ts               shared "structured output" model (colored spans, clickable links)
  components/
    Terminal.tsx            the whole interactive terminal (state, keybindings, rendering)
    OutputLineView.tsx      renders one output line's spans
    SeoContent.tsx           visually-hidden semantic content for crawlers/screen readers
```

`resume.yaml` is parsed into JSON at build/dev-transform time by a small custom Vite plugin (in `vite.config.ts`) — the browser bundle never ships a YAML parser. Command logic (parsing, the virtual filesystem, history, autocomplete, the YAML transform) is framework-agnostic and unit-tested independently of the UI; see `src/lib/**/*.test.ts`.

## Deployment

This is a static site (`npm run build` outputs `dist/`) — deploy it anywhere that serves static files: Vercel, Netlify, Cloudflare Pages, GitHub Pages, etc. There's no server-side rendering or API routes to configure.

### Docker

A multi-stage [`Dockerfile`](Dockerfile) builds the site with Node and serves the result with nginx, so the final image contains only static files and a web server — no build toolchain (~76 MB).

```bash
docker compose up --build        # http://localhost:8080
```

`docker-compose.yml` mounts [`nginx.conf`](nginx.conf) read-only rather than relying on the copy baked into the image, so tuning the server config only needs `docker compose restart web` instead of a rebuild. It also declares a healthcheck (busybox `wget`, already in the alpine base — no extra package layer) and its own bridge network.

Or without compose:

```bash
docker build -t terminal-resume .
docker run --rm -p 8080:80 terminal-resume
```

The nginx config ([`nginx.conf`](nginx.conf)) serves content-hashed files under `/assets/` as immutable with a one-year cache, while `index.html` is sent `no-cache` so a deploy is picked up immediately instead of clients pinning to a stale bundle.

Because `resume.yaml` is baked in at build time, changing your resume means rebuilding the image.
