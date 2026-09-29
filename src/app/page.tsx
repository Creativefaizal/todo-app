"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";

/** One to-do item. */
type Task = {
  id: string;
  text: string;
  completed: boolean;
};

// The localStorage entry our tasks are saved under.
const STORAGE_KEY = "my-tasks";

// Older versions of the app saved tasks under a key that contained a stray
// character. We still read that key so nobody loses their tasks, and the next
// save moves everything across to STORAGE_KEY.
const LEGACY_STORAGE_KEY = "my-…sks";

/* ---------------------------------------------------------------------------
   A few shared styles.
   Keeping them here means every button of the same kind looks identical.
   --------------------------------------------------------------------------- */

// The quiet icon buttons for Edit and Delete. On a computer they stay hidden
// until the row is hovered (or reached with the keyboard). On phones, where
// there is no hover, they are simply always visible.
const iconButton =
  "grid h-10 w-10 shrink-0 place-items-center rounded-field text-ink-faint transition-colors duration-150 sm:h-9 sm:w-9";
const editButton =
  iconButton + " hover:bg-ink/[0.06] hover:text-ink active:bg-ink/[0.09]";
const deleteButton =
  iconButton + " hover:bg-danger-50 hover:text-danger-600 active:bg-danger-50";

// The group holding those two buttons, with the hover reveal described above.
const rowActions =
  "flex shrink-0 items-center gap-0.5 sm:gap-1 sm:opacity-0 sm:transition-opacity sm:duration-150 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100";

// Reads the saved tasks from the browser, or returns an empty list.
function readStoredTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    // Look under the current key first, then the older one, then give up.
    const saved =
      localStorage.getItem(STORAGE_KEY) ??
      localStorage.getItem(LEGACY_STORAGE_KEY) ??
      "[]";
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // The saved text was damaged, so start with an empty list instead.
    return [];
  }
}

// A short id that is different for every new task.
function makeId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/* ---------------------------------------------------------------------------
   Icons and other small pieces of the interface.
   They are plain inline SVG, so the app needs no icon library.
   --------------------------------------------------------------------------- */

type IconProps = { className?: string };

// The app mark: three lines of decreasing length on a spruce-green tile.
function BrandMark() {
  return (
    <span
      aria-hidden="true"
      className="grid h-9 w-9 shrink-0 place-items-center rounded-[0.65rem] bg-accent-600 text-white shadow-soft"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-[18px] w-[18px]"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.9}
        strokeLinecap="round"
      >
        <path d="M6.5 8.5h11" />
        <path d="M6.5 12h7.5" />
        <path d="M6.5 15.5h4.5" />
      </svg>
    </span>
  );
}

function PlusIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 6v12M6 12h12" />
    </svg>
  );
}

function CheckIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M2.6 6.4 4.7 8.5 9.4 3.4" />
    </svg>
  );
}

function XIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
    </svg>
  );
}

function PencilIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M4.5 19.5h4l10-10a2.1 2.1 0 0 0-3-3l-10 10v3z" />
      <path d="M14.5 6.5l3 3" />
    </svg>
  );
}

function TrashIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M4 6.5h16" />
      <path d="M9.5 6.5V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2v1.3" />
      <path d="M6.6 6.5l.9 12.3A1.5 1.5 0 0 0 9 20.2h6a1.5 1.5 0 0 0 1.5-1.4l.9-12.3" />
      <path d="M10.5 10.5v5.5M13.5 10.5v5.5" />
    </svg>
  );
}

// An unticked circle, used in the empty state. A small mark like this says
// "nothing here yet" without needing a picture.
function EmptyCircleIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="7.5" strokeDasharray="2.5 3.4" />
    </svg>
  );
}

// A thin ring that fills up as tasks are ticked off. It is decoration only:
// the words next to it carry the same information.
function ProgressRing({ value }: { value: number }) {
  const radius = 8.5;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 -rotate-90" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r={radius}
        fill="none"
        strokeWidth={3}
        className="stroke-hairline"
      />
      <circle
        cx="12"
        cy="12"
        r={radius}
        fill="none"
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - value)}
        className="stroke-accent-600 transition-[stroke-dashoffset] duration-500 ease-out"
      />
    </svg>
  );
}

export default function HomePage() {
  // The tasks shown on screen, read from localStorage when the page opens.
  const [tasks, setTasks] = useState<Task[]>(readStoredTasks);

  // The page is rendered on the server first, where localStorage does not
  // exist, so the list is only shown once the app runs in the browser.
  const [isBrowser, setIsBrowser] = useState(false);

  // Text typed into the "add a task" box.
  const [newTaskText, setNewTaskText] = useState("");

  // Which task (if any) is being edited right now.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // The task that is fading out right now, on its way to being deleted.
  const [removingId, setRemovingId] = useState<string | null>(null);

  const newTaskInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Show the list only once we know we are running in the browser, because
  // localStorage does not exist when the page is first rendered on the server.
  // This second render is deliberate: it keeps the server and browser versions
  // of the page identical, which is what avoids a hydration mismatch.
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    setIsBrowser(true);
  }, []);

  // Save the tasks to localStorage every time they change.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    // Everything lives under STORAGE_KEY now, so the old entry can go.
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  }, [tasks]);

  // Deleting a task happens in two steps: the row fades out first, then this
  // short timer takes it out of the list. Waiting means the list closes the gap
  // smoothly instead of jumping. (200ms matches the "task-out" animation.)
  useEffect(() => {
    if (removingId === null) return;

    const timer = window.setTimeout(() => {
      setTasks((current) => current.filter((task) => task.id !== removingId));
      setRemovingId(null);
    }, 200);

    return () => window.clearTimeout(timer);
  }, [removingId]);

  function addTask(event: FormEvent) {
    event.preventDefault();
    const text = newTaskText.trim();
    if (!text) return;

    // Adding a new task to a copy of the list is what makes the page update.
    setTasks((current) => [
      ...current,
      { id: makeId(), text, completed: false },
    ]);
    setNewTaskText("");
    newTaskInputRef.current?.focus();
  }

  function toggleTask(id: string) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  function deleteTask(id: string) {
    // If the task being deleted was open for editing, close the edit box.
    if (editingId === id) {
      setEditingId(null);
      setEditingText("");
    }

    // Deleting takes a moment (the row fades out first). If another task is
    // still fading, remove that one now so nothing gets left behind.
    if (removingId !== null && removingId !== id) {
      setTasks((current) => current.filter((task) => task.id !== removingId));
    }

    setRemovingId(id);
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditingText(task.text);
    // Move the cursor into the box with the text selected, so it is easy to replace.
    requestAnimationFrame(() => {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    });
  }

  function saveEdit(id: string) {
    const text = editingText.trim();
    if (!text) return;

    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, text } : task)),
    );
    setEditingId(null);
    setEditingText("");
    newTaskInputRef.current?.focus();
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingText("");
    newTaskInputRef.current?.focus();
  }

  function onEditKeyDown(event: KeyboardEvent<HTMLInputElement>, id: string) {
    if (event.key === "Enter") saveEdit(id);
    if (event.key === "Escape") cancelEdit();
  }

  // Numbers used by the small summary at the top of the page.
  const total = tasks.length;
  const remaining = tasks.filter((task) => !task.completed).length;
  const done = total - remaining;
  const progress = total === 0 ? 0 : done / total;
  const allDone = total > 0 && remaining === 0;

  return (
    <main className="mx-auto w-full max-w-2xl px-5 pt-10 pb-24 sm:px-6 sm:pt-16 sm:pb-32">
      {/* -------------------------------------------------------- header --- */}
      <header className="mb-8 sm:mb-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <BrandMark />
            <h1 className="truncate text-[17px] font-semibold tracking-[-0.01em] text-ink sm:text-lg">
              My Tasks
            </h1>
          </div>

          {/* A small summary of how much of the list is finished. It only
              appears once there is something to report. */}
          {isBrowser && total > 0 && (
            <div
              className="flex shrink-0 items-center gap-2.5"
              aria-live="polite"
            >
              <ProgressRing value={progress} />
              <p
                className={
                  "text-[13px] " +
                  (allDone ? "font-medium text-accent-700" : "text-ink-soft")
                }
              >
                {allDone ? "All done" : `${remaining} left`}
              </p>
            </div>
          )}
        </div>

        <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-soft sm:mt-3">
          Write it down, then get it done.
        </p>
      </header>

      {/* ----------------------------------------------------- add a task --- */}
      <form onSubmit={addTask}>
        {/* The whole box reacts when the input is focused, so it is always
            obvious where a new task is typed. */}
        <div className="flex items-center gap-1.5 rounded-card border border-hairline bg-surface p-1.5 shadow-soft transition-[border-color,box-shadow] duration-200 focus-within:border-accent-600/45 focus-within:ring-4 focus-within:ring-accent-600/10 sm:gap-2">
          <label htmlFor="new-task" className="sr-only">
            What needs to be done?
          </label>
          <input
            id="new-task"
            ref={newTaskInputRef}
            type="text"
            value={newTaskText}
            onChange={(event) => setNewTaskText(event.target.value)}
            placeholder="What needs to be done?"
            autoComplete="off"
            className="h-11 min-w-0 flex-1 rounded-field bg-transparent px-3.5 text-[15px] text-ink placeholder:text-ink-faint focus:outline-none sm:h-12"
          />
          <button
            type="submit"
            disabled={!newTaskText.trim()}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-field bg-accent-600 px-4 text-[14px] font-semibold text-white transition-colors duration-150 hover:bg-accent-700 active:bg-accent-800 disabled:cursor-not-allowed disabled:bg-paper disabled:text-ink-faint sm:h-12 sm:px-5"
          >
            <PlusIcon className="h-4 w-4" />
            Add
          </button>
        </div>

        <p className="mt-2.5 hidden text-[12.5px] text-ink-faint sm:block">
          Press
          <kbd className="mx-1 inline-flex h-[18px] items-center rounded-[5px] border border-hairline bg-surface px-1.5 align-middle font-sans text-[10.5px] font-medium tracking-wide text-ink-soft">
            Enter
          </kbd>
          to add a task.
        </p>
      </form>

      {/* --------------------------------------------------------- the list --- */}
      <section aria-labelledby="tasks-heading" className="mt-9 sm:mt-11">
        <h2
          id="tasks-heading"
          className="pb-2 text-[11px] font-semibold tracking-[0.16em] text-ink-faint uppercase"
        >
          To do
        </h2>

        {/* The list only appears once the app is running in the browser,
            because localStorage does not exist while the page is built on the
            server. */}
        {isBrowser &&
          (total === 0 ? (
            /* Nothing to show yet: a quiet placeholder rather than an empty
               screen, and no picture needed. */
            <div className="rounded-card border border-dashed border-hairline-strong bg-surface/60 px-6 py-14 text-center sm:py-16">
              <span className="mx-auto grid h-10 w-10 place-items-center rounded-full border border-hairline bg-surface text-ink-faint">
                <EmptyCircleIcon className="h-5 w-5" />
              </span>
              <p className="mt-4 text-[15px] font-medium text-ink">
                No tasks yet
              </p>
              <p className="mx-auto mt-1.5 max-w-[26rem] text-[13.5px] leading-relaxed text-ink-soft">
                Add your first task in the box above. It is saved in this
                browser automatically.
              </p>
            </div>
          ) : (
            /* One quiet list: hairline separators and a soft hover band instead
               of a card around every task. */
            <ul className="border-t border-hairline">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className={
                    "group flex items-start gap-3 border-b border-hairline py-3.5 transition-colors duration-150 hover:bg-ink/[0.035] focus-within:bg-ink/[0.035] sm:gap-4 " +
                    (removingId === task.id
                      ? "animate-task-out"
                      : "animate-task-in")
                  }
                >
                  {/* The checkbox. The real input is drawn over a circle of our
                      own, so it can look the way we want and still work with a
                      keyboard. The label reaches 8px further out in every
                      direction, which makes it easier to tap on a phone. */}
                  <label className="relative mt-0.5 flex shrink-0 cursor-pointer items-center justify-center before:absolute before:-inset-2 before:content-['']">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      aria-label={`Mark "${task.text}" as ${task.completed ? "not done" : "done"}`}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border-[1.5px] border-hairline-strong bg-surface transition-[background-color,border-color,transform] duration-150 hover:border-accent-400 active:scale-90 checked:border-accent-600 checked:bg-accent-600"
                    />
                    {/* The tick is drawn by hand so it can be "written on" in
                        about a fifth of a second whenever a task is ticked. */}
                    <svg
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      pathLength={1}
                      className="pointer-events-none absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-white [stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset] duration-200 ease-out peer-checked:[stroke-dashoffset:0]"
                    >
                      <path d="M2.6 6.4 4.7 8.5 9.4 3.4" />
                    </svg>
                  </label>

                  {editingId === task.id ? (
                    <input
                      ref={editInputRef}
                      value={editingText}
                      onChange={(event) => setEditingText(event.target.value)}
                      onKeyDown={(event) => onEditKeyDown(event, task.id)}
                      aria-label={`Edit "${task.text}"`}
                      className="h-10 min-w-0 flex-1 rounded-field border border-accent-600/35 bg-surface px-3 text-[15px] text-ink transition-[border-color,box-shadow] duration-150 focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10 focus:outline-none"
                    />
                  ) : (
                    /* Ticking a task strikes the words through and fades them
                       back, so finished work is clearly quiet but still easy to
                       read. */
                    <p
                      className={
                        "min-w-0 flex-1 text-[15px] leading-6 break-words transition-colors duration-200 " +
                        (task.completed
                          ? "text-ink-faint line-through decoration-ink-faint/60 decoration-1"
                          : "text-ink")
                      }
                    >
                      {task.text}
                    </p>
                  )}

                  {/* The row buttons. On a phone they are always visible; on a
                      computer they appear when the row is hovered or reached
                      with the keyboard, which keeps the list calm. The group is
                      only as tall as one line of text, so the taller buttons
                      sit centred on the first line of the task. */}
                  <div
                    className={
                      editingId === task.id
                        ? "flex h-10 shrink-0 items-center gap-1.5"
                        : rowActions + " h-6"
                    }
                  >
                    {editingId === task.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => saveEdit(task.id)}
                          aria-label="Save changes"
                          className="inline-flex h-10 w-10 items-center justify-center gap-1.5 rounded-field bg-accent-600 text-[13px] font-semibold text-white transition-colors duration-150 hover:bg-accent-700 active:bg-accent-800 sm:w-auto sm:px-3.5"
                        >
                          <CheckIcon className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Save</span>
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          aria-label="Cancel changes"
                          className="inline-flex h-10 w-10 items-center justify-center gap-1.5 rounded-field text-[13px] font-medium text-ink-faint transition-colors duration-150 hover:bg-ink/[0.06] hover:text-ink active:bg-ink/[0.09] sm:w-auto sm:px-3"
                        >
                          <XIcon className="h-4 w-4" />
                          <span className="hidden sm:inline">Cancel</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(task)}
                          aria-label={`Edit "${task.text}"`}
                          title="Edit"
                          className={editButton}
                        >
                          <PencilIcon className="h-[17px] w-[17px]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTask(task.id)}
                          aria-label={`Delete "${task.text}"`}
                          title="Delete"
                          className={deleteButton}
                        >
                          <TrashIcon className="h-[17px] w-[17px]" />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ))}
      </section>
    </main>
  );
}

