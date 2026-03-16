import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Initialize SQLite database
const db = new Database("tasks.db");

// 2. Create tasks table if it doesn't exist
// Using INTEGER PRIMARY KEY AUTOINCREMENT for beginner simplicity
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'To-Do',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(cors());
  app.use(express.json());

  // --- API Routes ---
  
  // GET /tasks - Retrieve all tasks
  app.get("/tasks", (req, res) => {
    try {
      const tasks = db.prepare("SELECT * FROM tasks ORDER BY created_at DESC").all();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  // POST /tasks - Create a new task
  app.post("/tasks", (req, res) => {
    try {
      const { title, description } = req.body;
      
      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }

      const stmt = db.prepare(
        "INSERT INTO tasks (title, description, status) VALUES (?, ?, 'To-Do')"
      );
      const info = stmt.run(title, description || "");

      // Get the newly created task using the auto-incremented ID
      const newTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(info.lastInsertRowid);
      res.status(201).json(newTask);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  // PUT /tasks/:id - Update task details or status
  app.put("/tasks/:id", (req, res) => {
    try {
      const id = Number(req.params.id);
      const { title, description, status } = req.body;

      const existingTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as any;
      if (!existingTask) {
        return res.status(404).json({ error: "Task not found" });
      }

      // Use the new values if provided, otherwise keep the old ones
      const newTitle = title !== undefined ? title : existingTask.title;
      const newDescription = description !== undefined ? description : existingTask.description;
      const newStatus = status !== undefined ? status : existingTask.status;

      const stmt = db.prepare(
        "UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?"
      );
      stmt.run(newTitle, newDescription, newStatus, id);

      const updatedTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
      res.json(updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  // DELETE /tasks/:id - Delete a task
  app.delete("/tasks/:id", (req, res) => {
    try {
      const id = Number(req.params.id);
      
      const existingTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
      if (!existingTask) {
        return res.status(404).json({ error: "Task not found" });
      }

      const stmt = db.prepare("DELETE FROM tasks WHERE id = ?");
      stmt.run(id);

      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // --- Vite middleware for development ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Start the server
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
