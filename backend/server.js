
const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, "..", "public")));

const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "personal_dash",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function checkDatabase() {
    try {
        await db.query("SELECT 1");
        console.log("MySQL connected successfully!");
    } catch (err) {
        console.error("Database error:", err.message);
    }
}

checkDatabase();



// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..","public", "home.html"));
});


// To-Do page
app.get("/todo", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "todo.html"));
});

app.get("/api/tasks", async (req, res) => {
  try {
    const [tasks] = await db.execute(
      "SELECT * FROM tasks ORDER BY id DESC"
    );

    res.json(tasks);
  } catch (error) {
    console.error("mysql error");
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

/* Add a new task */
app.post("/api/tasks", async (req, res) => {
  try {
    const {
      title,
      description = "",
      category = " ",
      priority = "Medium",
      dueDate = ""
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        error: "Task title is required"
      });
    }

    const [result] = await db.execute(
      `INSERT INTO tasks
       (title, description, category, priority, due_date)
       VALUES (?, ?, ?, ?, ?)`,
      [
        title.trim(),
        description,
        category,
        priority,
        dueDate || null
      ]
    );
    

    res.status(201).json({
      message: "Task saved successfully!",
      id: result.insertId
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to save task" });
  }
});


app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    const [result] = await db.execute(
      "DELETE FROM tasks WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found in MySQL" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/tasks/:id/complete", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const completed = req.body.completed;

        if (!Number.isInteger(id) || id <= 0 ||
            typeof completed !== "boolean") {
            return res.status(400).json({
                error: "Invalid task ID or completed value"
            });
        }

        const [result] = await db.execute(
            "UPDATE tasks SET completed = ? WHERE id = ?",
            [completed ? 1 : 0, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Task not found in MySQL"
            });
        }

        res.json({
            message: "Task updated successfully",
            completed
        });
    } catch (error) {
        console.error("Complete error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get("/expense", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "expense.html"));
});

/* GET all expenses */
app.get("/api/expenses", async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT id, title, amount, category, expense_date
             FROM expenses
             ORDER BY expense_date DESC, id DESC`
        );

        res.json(rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Could not load expenses" });
    }
});

/* ADD expense */
app.post("/api/expenses", async (req, res) => {
    try {
        const { title, amount, category, expense_date } = req.body;
        const value = Number(amount);

        if (!title?.trim() || !Number.isFinite(value) || value <= 0) {
            return res.status(400).json({ error: "Invalid title or amount" });
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(expense_date || "")) {
            return res.status(400).json({ error: "Invalid expense date" });
        }

        const [result] = await db.execute(
            `INSERT INTO expenses (title, amount, category, expense_date)
             VALUES (?, ?, ?, ?)`,
            [title.trim(), value, category || "Other", expense_date]
        );

        res.status(201).json({
            id: result.insertId,
            message: "Expense saved"
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Could not save expense" });
    }
});

/* DELETE expense */
app.delete("/api/expenses/:id", async (req, res) => {
    try {
        if (!/^\d+$/.test(req.params.id)) {
            return res.status(400).json({ error: "Invalid expense ID" });
        }

        const [result] = await db.execute(
            "DELETE FROM expenses WHERE id = ?",
            [Number(req.params.id)]
        );

        if (!result.affectedRows) {
            return res.status(404).json({ error: "Expense not found" });
        }

        res.json({ message: "Expense deleted" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Could not delete expense" });
    }
});

/* GET monthly income and budget */
app.get("/api/finances/:month", async (req, res) => {
    try {
        const month = req.params.month;

        if (!/^\d{4}-\d{2}$/.test(month)) {
            return res.status(400).json({ error: "Invalid month" });
        }

        const [rows] = await db.execute(
            "SELECT income, budget FROM monthly_finances WHERE month_key = ?",
            [month]
        );

        res.json(rows[0] || { income: 0, budget: 0 });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Could not load finances" });
    }
});

/* SAVE monthly income and budget */
app.put("/api/finances/:month", async (req, res) => {
    try {
        const month = req.params.month;
        const income = Number(req.body.income);
        const budget = Number(req.body.budget);

        if (!/^\d{4}-\d{2}$/.test(month) ||
            !Number.isFinite(income) || income < 0 ||
            !Number.isFinite(budget) || budget < 0) {
            return res.status(400).json({ error: "Invalid finance values" });
        }

        await db.execute(
            `INSERT INTO monthly_finances (month_key, income, budget)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE
             income = VALUES(income),
             budget = VALUES(budget)`,
            [month, income, budget]
        );

        res.json({ message: "Income and budget saved" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Could not save finances" });
    }
});


app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
