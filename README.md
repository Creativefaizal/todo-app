# My Tasks

A small, single-page to-do list app. Your tasks are saved in your own browser
using `localStorage`, so they are still there when you refresh the page.

Built with Next.js (App Router), TypeScript, and Tailwind CSS. There is no
database, no sign-in, and no external API.

## Running it locally

1. Install [Node.js](https://nodejs.org) (version 20 or newer) if you do not have it.
2. Open a terminal in this folder and install the packages:

   ```bash
   npm install
   ```

3. Start the app:

   ```bash
   npm run dev
   ```

4. Open the address it prints, usually http://localhost:3000

## Other commands

| Command             | What it does                    |
| ------------------- | ------------------------------- |
| `npm run dev`       | Runs the app for development    |
| `npm run build`     | Creates a production build      |
| `npm run start`     | Runs the production build       |
| `npm run typecheck` | Checks for TypeScript errors    |
| `npm run lint`      | Checks for common code mistakes |

## Where things are

| File                  | What lives there                                          |
| --------------------- | --------------------------------------------------------- |
| `src/app/page.tsx`    | The whole app: tasks, buttons, and the saving logic       |
| `src/app/layout.tsx`  | The page shell, the browser tab title and the page colour |
| `src/app/globals.css` | The design tokens (colours, spacing, animation) + Tailwind|
| `src/app/icon.svg`    | The little logo shown in the browser tab                  |
| `postcss.config.mjs`  | Tells Next.js to run Tailwind CSS while building          |

Tasks are saved in your browser under the `my-tasks` localStorage key. To
remove them all, open the browser dev tools and run
`localStorage.removeItem("my-tasks")`.

The very first version of the app saved tasks under a key that had a stray
character in it. The app still reads that key once, moves anything it finds
across to `my-tasks`, and then tidies the old one away, so nobody loses their
tasks.

## How it looks

The whole look is decided by the tokens at the top of `src/app/globals.css`.
Change them there and the app stays consistent:

| Token group      | What it is used for                                      |
| ---------------- | -------------------------------------------------------- |
| `paper`, `surface` | The warm page background and the white panels           |
| `hairline`       | The thin borders and list separators                     |
| `ink`, `ink-soft`, `ink-faint` | Text, from strongest to quietest            |
| `accent-*`       | One spruce-green accent, used for the main actions       |
| `danger-*`       | One red, used only for the delete button                  |
| `radius-field`, `radius-card` | The only two corner radii                     |
| `shadow-soft`, `shadow-lift` | The two very light shadows                      |
| `animate-task-in/out` | The short animations when tasks appear and disappear |

A few rules the design tries to stick to:

* One accent colour, warm grey neutrals, and no gradients or glass effects.
* Type is 15px for task text, 11px for the "To do" label, and everything else
  sits between 12.5px and 18px.
* Rows are separated by hairlines rather than boxes, and the edit/delete
  buttons only appear when a row is hovered on a computer. On a phone, where
  there is no hover, they are always visible and at least 40px tall to tap.
* Animations are 200ms and are switched off automatically for anyone whose
  system asks for less motion.
* If you change a colour, keep it dark enough to read: text needs a contrast
  ratio of at least 4.5:1 against its background.


## What you can do

* Add a task by typing and pressing **Enter**, or using the **Add** button
* Tick the circle to mark a task as done
* Press **Edit**, change the text, then **Enter** to save or **Escape** to cancel
* Press **Delete** to remove a task
* See how many tasks are still remaining, and how much of the list is done
* On a computer the Edit and Delete icons appear when you hover over a task or
  tab to it; on a phone they are always shown

## Put it online (Vercel)

Vercel builds and hosts this project for free. You need a Vercel account —
you can sign in with GitHub, GitLab, Bitbucket, or an email address.

1. Install the Vercel command line tool (once per computer):

   ```bash
   npm install -g vercel
   ```

2. Log in. A browser tab opens to confirm it is you:

   ```bash
   vercel login
   ```

3. Deploy from this folder:

   ```bash
   vercel --prod
   ```

The first run asks a few questions, such as which account to use and what to
name the project. Pressing **Enter** accepts the suggested answer each time.
When it finishes it prints a public address such as
`https://ai-todo-app.vercel.app`.

A few things worth knowing:

* Vercel runs `npm run build` on its own computers, so you do not have to
  build first. It detects Next.js by itself and needs no extra settings.
* Run `vercel --prod` again after any change to publish it. Running plain
  `vercel` without `--prod` makes a preview link instead of updating the main
  site.
* The command creates a hidden `.vercel` folder that remembers which project
  this folder belongs to. It is listed in `.gitignore`, so leave it out of git.
* Your build output is a single static page, so Vercel serves it straight from
  its content delivery network — no server to keep awake.
* Tasks stay in each visitor's own browser. The live site therefore does not
  share tasks between your phone and your laptop, or between two people. That
  is how `localStorage` works, and changing it would mean adding a database.

