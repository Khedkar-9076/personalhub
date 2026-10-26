// READ TASKS SAVED BY todo.js
function getTasks() {
    return JSON.parse(localStorage.getItem("taskflow_personal_planner_v1")) || [];
}

// UPDATE SUMMARY CARDS
function updateSummary() {
    const tasks = getTasks();

    const total = tasks.length;

    const completed = tasks.filter(task =>
        task.completed === true
    ).length;

    const pending = total - completed;

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("pendingTasks").textContent = pending;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    document.getElementById("progressFill").style.width =
        percentage + "%";

    document.getElementById("progressLabel").textContent =
        percentage + "% completed (" + completed + " of " + total + " tasks)";
}

// WEEKLY TASK CHART
// Sample data until completed-date tracking is added
new Chart(document.getElementById("weeklyChart"), {
    type: "bar",
    data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{
            label: "Tasks Completed",
            data: [3, 5, 2, 6, 4, 7, 3],
            backgroundColor: "#6366f1",
            borderRadius: 7
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: { precision: 0 }
            }
        }
    }
});

// EXPENSE DOUGHNUT CHART
// Sample data until connected to your Expense Tracker
new Chart(document.getElementById("expenseChart"), {
    type: "doughnut",
    data: {
        labels: ["Food", "Shopping", "Travel", "Bills"],
        datasets: [{
            data: [2500, 1800, 1200, 3000],
            backgroundColor: [
                "#6366f1",
                "#10b981",
                "#f59e0b",
                "#ec4899"
            ],
            borderWidth: 0
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom"
            }
        }
    }
});

// MONTHLY INCOME VS EXPENSES
// Sample data until connected to your Expense Tracker
new Chart(document.getElementById("financeChart"), {
    type: "line",
    data: {
        labels: [
            "Jan", "Feb", "Mar", "Apr",
            "May", "Jun", "Jul"
        ],
        datasets: [
            {
                label: "Income",
                data: [15000, 18000, 17000, 22000, 20000, 24000, 26000],
                borderColor: "#10b981",
                backgroundColor: "#10b981",
                tension: 0.35
            },
            {
                label: "Expenses",
                data: [8000, 9500, 7000, 12000, 10000, 14000, 11000],
                borderColor: "#f59e0b",
                backgroundColor: "#f59e0b",
                tension: 0.35
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

// INITIALIZE PAGE
updateSummary();

function updateSummaryFromStorage() {
    const STORAGE_KEY = "personalFinanceDashboard_v2";

    const saved = localStorage.getItem(STORAGE_KEY);
    const data = saved ? JSON.parse(saved) : {};

    const month = new Date().toISOString().slice(0, 7);

    const income = Number(data.incomes?.[month] || 0);

    const expenses = Array.isArray(data.expenses)
        ? data.expenses.filter(item => item.month === month)
        : [];

    const totalExpenses = expenses.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
    );

    const balance = income - totalExpenses;

    const expenseEl = document.getElementById("totalExpenses");

    if (expenseEl) {
        expenseEl.textContent =
            "₹" + totalExpenses.toLocaleString("en-IN");
    }

    // Update these only if the elements exist in summary.html
    const incomeEl = document.getElementById("totalIncome");
    const balanceEl = document.getElementById("remainingBalance");

    if (incomeEl) {
        incomeEl.textContent = "₹" + income.toLocaleString("en-IN");
    }

    if (balanceEl) {
        balanceEl.textContent = "₹" + balance.toLocaleString("en-IN");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    updateSummary();
    updateSummaryFromStorage();
});

window.addEventListener("pageshow", updateSummaryFromStorage);

window.addEventListener("storage", (event) => {
    if (event.key === "personalFinanceDashboard_v2") {
        updateSummaryFromStorage();
    }
});

   