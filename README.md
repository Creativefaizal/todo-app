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

| File                 | What lives there                                          |
| -------------------- | --------------------------------------------------------- |
| `src/app/page.tsx`   | The whole app: tasks, buttons, and the saving logic        |
| `src/app/layout.tsx` | The page shell and the browser tab title                  |
| `src/app/globals.css`| Tailwind CSS, the styling library                         |
| `postcss.config.mjs` | Tells Next.js to run Tailwind CSS while building          |

Tasks are saved in your browser under the `my-tasks` localStorage key. To
remove them all, open the browser dev tools and run
`localStorage.removeItem("my-tasks")`.

## What you can do

* Add a task by typing and pressing **Enter**, or using the **Add** button
* Tick the circle to mark a task as done
* Press **Edit**, change the text, then **Enter** to save or **Escape** to cancel
* Press **Delete** to remove a task
* See how many tasks are still remaining

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

