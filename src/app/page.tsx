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
const STORAGE_KEY = "my-…sks";

// Shared styles for the small text buttons in each row.
const subtleButton =
  "rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";

// Reads the saved tasks from the browser, or returns an empty list.
function readStoredTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
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
  }, [tasks]);

  function addTask(event: FormEvent) {
    event.preventDefault();
    const text = newTaskText.trim();
    if (!text) return;

    setTasks([...tasks, { id: makeId(), text, completed: false }]);
    setNewTaskText("");
    newTaskInputRef.current?.focus();
  }

  function toggleTask(id: string) {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  function deleteTask(id: string) {
    setTasks(tasks.filter((task) => task.id !== id));
    setEditingId(null);
    setEditingText("");
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

    setTasks(tasks.map((task) => (task.id === id ? { ...task, text } : task)));
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

  // How many tasks are still to do.
  const remaining = tasks.filter((task) => !task.completed).length;

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-12 sm:py-20">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          My Tasks
        </h1>
        <p className="mt-1 text-sm text-slate-500 sm:text-base">
          Keep track of what needs to get done.
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
        <form onSubmit={addTask} className="flex items-stretch gap-2 sm:gap-3">
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
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!newTaskText.trim()}
            className="shrink-0 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            Add
          </button>
        </form>

        {/* The list only appears once the app is running in the browser. */}
        {isBrowser &&
          (tasks.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-base font-medium text-slate-600">
                No tasks yet
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Add a task above to get started.
              </p>
            </div>
          ) : (
            <section aria-label="Task list" className="mt-8">
              <p
                aria-live="polite"
                className="mb-2 px-3 text-sm text-slate-500"
              >
                {remaining} {remaining === 1 ? "task" : "tasks"} remaining
              </p>
              <ul className="space-y-1">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center gap-2 rounded-xl px-3 py-3 transition-colors hover:bg-slate-50 sm:gap-3"
                  >
                    <label className="relative -ml-1 flex shrink-0 cursor-pointer items-center justify-center p-1">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        aria-label={`Mark "${task.text}" as ${task.completed ? "not complete" : "complete"}`}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 bg-white transition-colors hover:border-slate-400 checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      />
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                      >
                        <path d="M2.5 6.5 4.5 8.5 9.5 3.5" />
                      </svg>
                    </label>

                    {editingId === task.id ? (
                      <input
                        ref={editInputRef}
                        value={editingText}
                        onChange={(event) => setEditingText(event.target.value)}
                        onKeyDown={(event) => onEditKeyDown(event, task.id)}
                        aria-label="Edit task"
                        className="min-w-0 flex-1 rounded-lg border border-indigo-500 bg-white px-3 py-1.5 text-[15px] text-slate-900 ring-4 ring-indigo-500/10 focus:outline-none"
                      />
                    ) : (
                      <span
                        className={
                          task.completed
                            ? "min-w-0 flex-1 break-words text-[15px] text-slate-400 line-through"
                            : "min-w-0 flex-1 break-words text-[15px] text-slate-700"
                        }
                      >
                        {task.text}
                      </span>
                    )}

                    <div className="flex shrink-0 items-center gap-1">
                      {editingId === task.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => saveEdit(task.id)}
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className={subtleButton}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(task)}
                            className={subtleButton}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteTask(task.id)}
                            className={
                              subtleButton +
                              " hover:bg-rose-50 hover:text-rose-600"
                            }
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
      </div>
    </main>
  );
}

