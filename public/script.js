const clockElement = document.getElementById("clock");
const dateElement = document.getElementById("date");
const timeElement = document.getElementById("time");
const greetingElement = document.getElementById("greeting");
const formatToggleBtn = document.getElementById("format-toggle-btn");

let is24HourFormat = false;

if (formatToggleBtn) {
    formatToggleBtn.textContent = "Switch to 24h";

    formatToggleBtn.addEventListener("click", () => {
        is24HourFormat = !is24HourFormat;

        formatToggleBtn.textContent = is24HourFormat
            ? "Switch to 12h"
            : "Switch to 24h";

        updateClock();
    });
}

function updateClock() {
    const now = new Date();

    if (clockElement) {
        clockElement.textContent = now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: !is24HourFormat
        });
    }

    if (timeElement) {
        timeElement.textContent = now.toLocaleTimeString("en-IN");
    }

    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }

    if (greetingElement) {
        const hour = now.getHours();

        greetingElement.textContent =
            hour < 12 ? "Good Morning! ☀️" :
            hour < 17 ? "Good Afternoon! 🌷" :
            "Good Evening! 🌙";
    }
}

updateClock();
setInterval(updateClock, 1000);


const STORAGE_KEY = "personalFinanceDashboard_v2";

const incomeInput = document.getElementById("income-input");
const setIncomeBtn = document.getElementById("set-income-btn");
const expenseNameInput = document.getElementById("expense-name");
const expenseAmountInput = document.getElementById("expense-amount");
const expenseCategorySelect =
    document.getElementById("expense-category");
const addExpenseBtn = document.getElementById("add-expense-btn");

const expenseListContainer = document.getElementById("exlist");

let totalIncome = 0;
let expenses = [];

function getCurrentMonth() {
    const now = new Date();

    return `${now.getFullYear()}-${String(
        now.getMonth() + 1
    ).padStart(2, "0")}`;
}

function getSavedData() {
    try {
        const data = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "{}"
        );

        if (!data || Array.isArray(data) || typeof data !== "object") {
            return {};
        }

        return data;
    } catch (error) {
        console.error("Unable to read expense data:", error);
        return {};
    }
}

function updateDashboardExpenseCard() {
    const balanceEl = document.getElementById("expenseBalance");
    const remainingBalanceEl = document.getElementById("remainingBalance");
    const incomeEl = document.getElementById("dashboardIncome");
    const expenseEl = document.getElementById("dashboardExpense");
    const progressEl = document.getElementById("expenseProgress");

    // Dashboard card is not present on every page.
    if (!balanceEl || !incomeEl || !expenseEl || !progressEl) {
        return;
    }

    const data = getSavedData();
    const month = getCurrentMonth();

    const income = Number(data.incomes?.[month] || 0);

    const monthExpenses = Array.isArray(data.expenses)
        ? data.expenses.filter(item => item.month === month)
        : [];

    const spent = monthExpenses.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
    );

    const balance = income - spent;

    balanceEl.textContent =
        "₹" + balance.toLocaleString("en-IN");

    incomeEl.textContent =
        income.toLocaleString("en-IN");

    expenseEl.textContent =
        spent.toLocaleString("en-IN");

    const percentage = income > 0
        ? Math.min((spent / income) * 100, 100)
        : 0;
       if (remainingBalanceEl) {
        remainingBalanceEl.textContent = formattedBalance;
        remainingBalanceEl.style.color = balance < 0 ? "red" : "green";
    }
   
    
    progressEl.style.width = percentage + "%";
    balanceEl.style.color = balance < 0 ? "red" : "green";
}



function updateExpenseUI() {
    const data = getSavedData();
    const month = getCurrentMonth();

    totalIncome = Number(data.incomes?.[month] || 0);

    expenses = Array.isArray(data.expenses)
        ? data.expenses.filter(item => item.month === month)
        : [];

    const totalSpent = expenses.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
    );

    const remaining = totalIncome - totalSpent;

    const incomeDisplay = document.getElementById("total-income");
    const expenseDisplay = document.getElementById("total-expense");
    const balanceDisplay = document.getElementById("remaining-balance");



    if (incomeDisplay) {
        incomeDisplay.textContent =
            totalIncome.toLocaleString("en-IN");
    }

    if (expenseDisplay) {
        expenseDisplay.textContent =
            totalSpent.toLocaleString("en-IN");
    }

    if (balanceDisplay) {
        balanceDisplay.textContent =
            remaining.toLocaleString("en-IN");

        balanceDisplay.style.color =
            remaining < 0 ? "red" : "green";
    }

    // Expense list
    if (expenseListContainer) {
        expenseListContainer.innerHTML = "";

        expenses.forEach(item => {
            const div = document.createElement("div");
            div.className = "expense-item";

            const name = document.createElement("span");
            name.textContent =
                `${item.name} (${item.category || "Other"}): ₹${Number(item.amount || 0).toLocaleString("en-IN")}`;

            const deleteBtn = document.createElement("button");
            deleteBtn.type = "button";
            deleteBtn.textContent = "❌";
            deleteBtn.setAttribute("aria-label", "Delete expense");

            deleteBtn.addEventListener("click", () => {
                deleteExpense(item.id);
            });

            div.append(name, deleteBtn);
            expenseListContainer.appendChild(div);
        });
    }

    // Category summary
    const summaryContainer =
        document.getElementById("category-summary-list");

    if (summaryContainer) {
        summaryContainer.innerHTML = "";

        const categories = [
            "Food",
            "Transport",
            "Bills",
            "Shopping",
            "Other"
        ];

        const totals = {};

        expenses.forEach(item => {
            const category = item.category || "Other";

            totals[category] =
                (totals[category] || 0) +
                Number(item.amount || 0);
        });

        if (expenses.length === 0) {
            summaryContainer.textContent = "No expenses added yet.";
        } else {
            categories.forEach(category => {
                const amount = totals[category] || 0;

                const row = document.createElement("div");
                row.className = "category-row";

                const info = document.createElement("div");
                info.className = "category-info";

                const name = document.createElement("span");
                name.textContent = category;

                const value = document.createElement("strong");
                value.textContent =
                    "₹" + amount.toLocaleString("en-IN");

                info.append(name, value);

                const bar = document.createElement("div");
                bar.className = "category-bar";

                const fill = document.createElement("div");
                fill.className = "category-fill";

                fill.style.width = totalSpent > 0
                    ? (amount / totalSpent) * 100 + "%"
                    : "0%";

                bar.appendChild(fill);
                row.append(info, bar);

                summaryContainer.appendChild(row);
            });
        }
    }

    updateDashboardExpenseCard();
}


function saveAndRenderExpenses() {
    const data = getSavedData();
    const month = getCurrentMonth();

    data.incomes = data.incomes || {};
    data.budgets = data.budgets || {};

    const otherMonthExpenses = Array.isArray(data.expenses)
        ? data.expenses.filter(item => item.month !== month)
        : [];

    const currentMonthExpenses = expenses.map(item => ({
        ...item,
        month: item.month || month
    }));

    data.expenses = [
        ...otherMonthExpenses,
        ...currentMonthExpenses
    ];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    updateExpenseUI();
}


if (setIncomeBtn && incomeInput) {
    setIncomeBtn.addEventListener("click", () => {
        const value = Number(incomeInput.value);

        if (!Number.isFinite(value) || value <= 0) {
            alert("Please enter a valid income.");
            return;
        }

        const data = getSavedData();
        const month = getCurrentMonth();

        data.incomes = data.incomes || {};
        data.budgets = data.budgets || {};

        data.incomes[month] = value;

        if (!Array.isArray(data.expenses)) {
            data.expenses = [];
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

        incomeInput.value = "";

        updateExpenseUI();
    });
}



if (
    addExpenseBtn &&
    expenseNameInput &&
    expenseAmountInput &&
    expenseCategorySelect
) {
    addExpenseBtn.addEventListener("click", () => {
        const name = expenseNameInput.value.trim();
        const amount = Number(expenseAmountInput.value);
        const category = expenseCategorySelect.value;

        if (!name || !Number.isFinite(amount) || amount <= 0) {
            alert("Please enter a valid expense name and amount.");
            return;
        }

        const month = getCurrentMonth();

        // Read saved expenses before adding a new one.
        const data = getSavedData();

        data.incomes = data.incomes || {};
        data.budgets = data.budgets || {};

        const savedExpenses = Array.isArray(data.expenses)
            ? data.expenses
            : [];

        savedExpenses.push({
            id: Date.now(),
            name,
            amount,
            category,
            month
        });

        data.expenses = savedExpenses;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

        expenseNameInput.value = "";
        expenseAmountInput.value = "";

        updateExpenseUI();
    });
}


function deleteExpense(id) {
    const data = getSavedData();

    if (!Array.isArray(data.expenses)) {
        return;
    }

    data.expenses = data.expenses.filter(
        item => String(item.id) !== String(id)
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    updateExpenseUI();
}



function addTask() {
    const input = document.getElementById("taskinput");
    const list = document.getElementById("taskList");

    if (!input || !list) return;

    const task = input.value.trim();

    if (!task) {
        alert("Please enter a task!");
        return;
    }

    const li = document.createElement("li");
    const text = document.createElement("span");
    text.textContent = task;

    const completeBtn = document.createElement("button");
    completeBtn.type = "button";
    completeBtn.textContent = "✔️";
    completeBtn.style.marginLeft = "10px";

    completeBtn.addEventListener("click", () => {
        li.style.textDecoration =
            li.style.textDecoration === "line-through"
                ? "none"
                : "line-through";
    });
    app.delete("/api/tasks/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "Invalid task ID"
            });
        }

        const [result] = await db.execute(
            "DELETE FROM tasks WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Task not found in MySQL"
            });
        }

        res.json({
            message: "Task deleted successfully",
            id
        });

    } catch (error) {
        console.error("Delete error:", error.message);

        res.status(500).json({
            error: "Failed to delete task"
        });
    }
});

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.textContent = "❌";
    deleteBtn.style.marginLeft = "5px";

    deleteBtn.addEventListener("click", () => li.remove());

    li.append(text, completeBtn, deleteBtn);
    list.appendChild(li);

    input.value = "";
}




let tasks = [];

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

function renderTasks() {
    if (!taskList) return;

    taskList.innerHTML = "";

    tasks.forEach((task, index) => {
        const li = document.createElement("li");
        li.className = "task-item" + (task.done ? " done" : "");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.done;
        checkbox.setAttribute("aria-label", "Complete task");

        checkbox.addEventListener("change", () => {
            tasks[index].done = checkbox.checked;
            renderTasks();
        });

        const span = document.createElement("span");
        span.textContent = task.text;

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "delete-btn";
        remove.textContent = "×";

        remove.addEventListener("click", () => {
            tasks.splice(index, 1);
            renderTasks();
        });

        li.append(checkbox, span, remove);
        taskList.appendChild(li);
    });

    const completed = tasks.filter(task => task.done).length;
    const total = tasks.length;
    const percentage = total
        ? Math.round((completed / total) * 100)
        : 0;

    const totalEl = document.getElementById("totalTasks");
    const completedEl = document.getElementById("completedTasks");
    const percentEl = document.getElementById("goalPercent");
    const progressEl = document.getElementById("goalProgress");
    const messageEl = document.getElementById("taskMessage");

    if (totalEl) totalEl.textContent = total;
    if (completedEl) completedEl.textContent = completed;
    if (percentEl) percentEl.textContent = percentage + "%";
    if (progressEl) progressEl.style.width = percentage + "%";

    if (messageEl) {
        messageEl.textContent =
            total === 0 ? "Add your first task to get started." :
            completed === total ? "Great job! All tasks completed 🎉" :
            `${total - completed} task(s) remaining. Keep going!`;
    }
}

if (taskForm && taskInput && taskList) {
    taskForm.addEventListener("submit", event => {
        event.preventDefault();

        const text = taskInput.value.trim();

        if (!text) return;

        tasks.push({ text, done: false });
        taskInput.value = "";

        renderTasks();
    });
}



const themeToggle = document.getElementById("themeToggle");
const themeButton = document.getElementById("themeButton");
const topThemeButton = document.getElementById("topThemeButton");

function applyTheme(isDark) {
    document.body.classList.toggle("dark-mode", isDark);
    document.body.classList.toggle("dark", isDark);

    localStorage.setItem("theme", isDark ? "dark" : "light");

    if (themeToggle) {
        themeToggle.textContent = isDark
            ? "☀️ Light Mode"
            : "🌙 Dark Mode";
    }

    if (themeButton) {
        themeButton.innerHTML = isDark
            ? '☀️ <span class="nav-text">Light Theme</span>'
            : '🌙 <span class="nav-text">Toggle Theme</span>';
    }

    if (topThemeButton) {
        topThemeButton.textContent = isDark ? "☀️" : "🌙";
    }
}

applyTheme(localStorage.getItem("theme") === "dark");

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const isDark =
            !document.body.classList.contains("dark-mode");

        applyTheme(isDark);
    });
}

function toggleTheme() {
    const isDark =
        !document.body.classList.contains("dark-mode");

    applyTheme(isDark);
}

if (themeButton) {
    themeButton.addEventListener("click", toggleTheme);
}

if (topThemeButton) {
    topThemeButton.addEventListener("click", toggleTheme);
}



const quotes = [
    '"Believe in yourself and all that you are."',
    '"Small steps every day lead to big results."',
    '"Progress, not perfection."',
    '"Dream big. Start small. Keep going."',
    '"Your future depends on what you do today."'
];

let quoteIndex = 0;

const newQuoteButton = document.getElementById("newQuote");
const quoteText = document.getElementById("quoteText");

if (newQuoteButton && quoteText) {
    newQuoteButton.addEventListener("click", () => {
        quoteIndex = (quoteIndex + 1) % quotes.length;
        quoteText.textContent = quotes[quoteIndex];
    });
}

function updateQuickBalance() {
    const saved = localStorage.getItem("personalFinanceDashboard_v2");
    const data = saved ? JSON.parse(saved) : {};

    const month = new Date().toISOString().slice(0, 7);

    const income = Number(data.incomes?.[month] || 0);

    const expenses = Array.isArray(data.expenses)
        ? data.expenses.filter(item => item.month === month)
        : [];

    const totalExpense = expenses.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
    );

    const balance = income - totalExpense;

    const balanceEl = document.getElementById("quick-balance");

    if (balanceEl) {
        balanceEl.textContent =
            "₹" + balance.toLocaleString("en-IN");

        balanceEl.style.color = balance < 0 ? "red" : "green";
    }
}

document.addEventListener("DOMContentLoaded", updateQuickBalance);
window.addEventListener("pageshow", updateQuickBalance);

window.addEventListener("storage", event => {
    if (event.key === "personalFinanceDashboard_v2") {
        updateQuickBalance();
    }
});

function updateTaskCards() {
    const saved = localStorage.getItem("taskflow_personal_planner_v1");

    let tasks = [];

    try {
        const data = saved ? JSON.parse(saved) : [];
        tasks = Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Task data read error:", error);
    }

    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(
        task => task.completed === true
    ).length;

    const totalEl = document.getElementById("total-tasks");
    const completedEl = document.getElementById("completed-tasks");

    if (totalEl) totalEl.textContent = totalTasks;
    if (completedEl) completedEl.textContent = completedTasks;
}

document.addEventListener("DOMContentLoaded", updateTaskCards);
window.addEventListener("pageshow", updateTaskCards);

window.addEventListener("storage", event => {
    if (event.key === "taskflow_personal_planner_v1") {
        updateTaskCards();
    }
});


function updateDailyGoalCard() {
    const today = new Date();

    const todayKey = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    let tasks = [];

    try {
        const saved = JSON.parse(
            localStorage.getItem("taskflow_personal_planner_v1") || "[]"
        );

        // Supports array storage or an object containing tasks
        if (Array.isArray(saved)) {
            tasks = saved;
        } else if (Array.isArray(saved.tasks)) {
            tasks = saved.tasks;
        }
    } catch (error) {
        console.error("Could not load tasks:", error);
    }

    // Today's tasks only
    const todayTasks = tasks.filter(task => {
        const dueDate = task.dueDate || task.due_date || "";
        return dueDate.slice(0, 10) === todayKey;
    });

    const completed = todayTasks.filter(task =>
        task.completed === true ||
        task.completed === 5
    ).length;

    const total = todayTasks.length;

    const progress = total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    const goalsEl = document.getElementById("today-goals");
    const progressTextEl = document.getElementById("goal-progress-text");
    const progressBarEl = document.getElementById("goal-progress-bar");

    if (goalsEl) {
        goalsEl.textContent = `${completed}/${total}`;
    }

    if (progressTextEl) {
        progressTextEl.textContent =
            `${progress}% completed today`;
    }

    if (progressBarEl) {
        progressBarEl.style.width = `${progress}%`;
    }
}

document.addEventListener(
    "DOMContentLoaded",
    updateDailyGoalCard
);

window.addEventListener(
    "pageshow",
    updateDailyGoalCard
);

window.addEventListener("storage", event => {
    if (event.key === "taskflow_personal_planner_v1") {
        updateDailyGoalCard();
    }
});

updateExpenseUI();
updateDashboardExpenseCard();


const navToggle = document.getElementById("navToggle");
const navigationMenu = document.getElementById("navigationMenu");

if (navToggle && navigationMenu) {
    navToggle.addEventListener("click", () => {
        const isOpen = navigationMenu.classList.toggle("show");

        navToggle.textContent = isOpen ? "✕" : "☰";
        navToggle.setAttribute("aria-expanded", isOpen);
    });
}


