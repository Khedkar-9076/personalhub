const $ = id => document.getElementById(id);

const incomeInput = $("income-input");
const budgetInput = $("budget-input");
const nameInput = $("expense-name");
const amountInput = $("expense-amount");
const categoryInput = $("expense-category");

const STORAGE_KEY = "personalFinanceDashboard_v2";
const CATEGORIES = ["Food", "Transport", "Bills", "Shopping", "Other"];

function monthKey(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function localDateString(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function formatMoney(value) {
    return Number(value).toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

function formatDate(value) {
    const date = new Date(`${value}T12:00:00`);
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function makeId() {
    return window.crypto?.randomUUID
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function loadData() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

        if (saved && Array.isArray(saved.expenses)) {
            return {
                incomes: saved.incomes || {},
                budgets: saved.budgets || {},
                expenses: saved.expenses.filter(item =>
                    item &&
                    typeof item.id === "string" &&
                    typeof item.name === "string" &&
                    Number.isFinite(Number(item.amount)) &&
                    typeof item.category === "string" &&
                    /^\d{4}-\d{2}$/.test(item.month) &&
                    /^\d{4}-\d{2}-\d{2}$/.test(item.date)
                )
            };
        }
    } catch (error) {
        console.error("Unable to read saved data:", error);
    }

    return { incomes: {}, budgets: {}, expenses: [] };
}

let data = loadData();

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        alert("Data could not be saved. Check your browser storage.");
        console.error(error);
        return false;
    }
}

function getMonthExpenses(month = monthKey()) {
    return data.expenses.filter(item => item.month === month);
}

function getMonthIncome(month = monthKey()) {
    return Number(data.incomes[month] || 0);
}

function getMonthBudget(month = monthKey()) {
    return Number(data.budgets[month] || 0);
}

function saveIncome() {
    const value = incomeInput.value.trim();

    if (value === "" || !Number.isFinite(Number(value)) || Number(value) < 0) {
        alert("Enter a valid income of zero or more.");
        return;
    }

    const key = monthKey();
    const oldValue = data.incomes[key];
    data.incomes[key] = Number(value);

    if (saveData()) {
        incomeInput.value = "";
        renderAll();
    } else if (oldValue === undefined) {
        delete data.incomes[key];
    } else {
        data.incomes[key] = oldValue;
    }
}

function saveBudget() {
    const value = budgetInput.value.trim();

    if (value === "" || !Number.isFinite(Number(value)) || Number(value) < 0) {
        alert("Enter a valid budget of zero or more.");
        return;
    }

    const key = monthKey();
    const oldValue = data.budgets[key];
    data.budgets[key] = Number(value);

    if (saveData()) {
        budgetInput.value = "";
        renderAll();
    } else if (oldValue === undefined) {
        delete data.budgets[key];
    } else {
        data.budgets[key] = oldValue;
    }
}

function addExpense() {
    const name = nameInput.value.trim();
    const amountText = amountInput.value.trim();
    const amount = Number(amountText);
    const category = categoryInput.value;

    if (!name) {
        alert("Enter an expense description.");
        nameInput.focus();
        return;
    }

    if (amountText === "" || !Number.isFinite(amount) || amount <= 0) {
        alert("Enter an amount greater than zero.");
        amountInput.focus();
        return;
    }

    if (!CATEGORIES.includes(category)) {
        alert("Select a valid category.");
        return;
    }

    const date = localDateString();

    const expense = {
        id: makeId(),
        name,
        amount,
        category,
        date,
        month: date.slice(0, 7)
    };

    data.expenses.push(expense);

    if (!saveData()) {
        data.expenses.pop();
        return;
    }

    nameInput.value = "";
    amountInput.value = "";
    categoryInput.value = "Food";

    renderAll();
}

function editExpense(id) {
    const item = data.expenses.find(expense => expense.id === id);
    if (!item) return;

    const newName = prompt("Edit expense description:", item.name);
    if (newName === null) return;

    if (!newName.trim()) {
        alert("Description cannot be empty.");
        return;
    }

    const newAmountText = prompt("Edit amount (₹):", String(item.amount));
    if (newAmountText === null) return;

    const newAmount = Number(newAmountText);

    if (newAmountText.trim() === "" || !Number.isFinite(newAmount) || newAmount <= 0) {
        alert("Enter a valid amount greater than zero.");
        return;
    }

    const newCategory = prompt(
        "Enter category: Food, Transport, Bills, Shopping, Other",
        item.category
    );

    if (newCategory === null) return;

    const normalizedCategory = CATEGORIES.find(
        category => category.toLowerCase() === newCategory.trim().toLowerCase()
    );

    if (!normalizedCategory) {
        alert("Choose Food, Transport, Bills, Shopping, or Other.");
        return;
    }

    const oldItem = { ...item };

    item.name = newName.trim();
    item.amount = newAmount;
    item.category = normalizedCategory;

    if (!saveData()) {
        Object.assign(item, oldItem);
        return;
    }

    renderAll();
}

function deleteExpense(id) {
    const index = data.expenses.findIndex(item => item.id === id);
    if (index < 0) return;

    const item = data.expenses[index];

    if (!confirm(`Delete "${item.name}" — ₹${formatMoney(item.amount)}?`)) {
        return;
    }

    data.expenses.splice(index, 1);

    if (!saveData()) {
        data.expenses.splice(index, 0, item);
        return;
    }

    renderAll();
}

function renderSummary() {
    const income = getMonthIncome();
    const expenses = getMonthExpenses();
    const total = expenses.reduce((sum, item) => sum + item.amount, 0);
    const balance = income - total;

    $("total-income").textContent = formatMoney(income);
    $("total-expense").textContent = formatMoney(total);
    $("remaining-balance").textContent = formatMoney(balance);

    $("remaining-balance").style.color =
        balance < 0 ? "#d65d75" : "#6045a6";

    $("current-month").textContent = new Date().toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric"
    });

    const budget = getMonthBudget();
    const spentPercent = budget > 0 ? total / budget * 100 : 0;
    const savingsPercent = income > 0
        ? Math.max(0, balance / income * 100)
        : 0;

    // Progress shows the share of income remaining after expenses.
    $("savings-percent").textContent = `${Math.round(savingsPercent)}%`;
    $("savings-progress").style.width =
        `${Math.min(100, savingsPercent)}%`;

    $("progress-spent").textContent = formatMoney(total);
    $("progress-income").textContent = formatMoney(income);

    if (income <= 0) {
        $("savings-message").textContent =
            "Set your monthly income to track your savings.";
    } else if (balance < 0) {
        $("savings-message").textContent =
            `You have spent ₹${formatMoney(Math.abs(balance))} more than your income.`;
    } else {
        $("savings-message").textContent =
            `You have ₹${formatMoney(balance)} remaining this month.`;
    }

    const progress = $("savings-progress");
    progress.classList.toggle("over-budget", budget > 0 && total > budget);

    if (budget > 0) {
        const remaining = budget - total;
        $("savings-message").textContent += remaining < 0
            ? ` Budget exceeded by ₹${formatMoney(Math.abs(remaining))}.`
            : ` Budget remaining: ₹${formatMoney(remaining)}.`;

        // When a budget is set, the bar represents budget used.
        $("savings-percent").textContent =
            `${Math.round(spentPercent)}% budget used`;
        progress.style.width = `${Math.min(100, spentPercent)}%`;
    }
}

function renderTransactions() {
    const tbody = $("exlist");
    tbody.replaceChildren();

    const search = $("expense-search").value.trim().toLowerCase();
    const selectedCategory = $("filter-category").value;
    const selectedMonth = $("filter-month").value;

    const filtered = data.expenses
        .filter(item => {
            const matchesSearch =
                item.name.toLowerCase().includes(search) ||
                item.category.toLowerCase().includes(search);

            const matchesCategory =
                selectedCategory === "All" ||
                item.category === selectedCategory;

            const matchesMonth =
                !selectedMonth || item.month === selectedMonth;

            return matchesSearch && matchesCategory && matchesMonth;
        })
        .sort((a, b) => b.date.localeCompare(a.date));

    $("transaction-count").textContent =
        `${filtered.length} record${filtered.length === 1 ? "" : "s"}`;

    $("table-empty").hidden = filtered.length !== 0;

    filtered.forEach(item => {
        const tr = document.createElement("tr");

        const dateCell = document.createElement("td");
        dateCell.className = "date-cell";
        dateCell.textContent = formatDate(item.date);

        const nameCell = document.createElement("td");
        nameCell.className = "description-cell";
        nameCell.textContent = item.name;

        const categoryCell = document.createElement("td");
        const badge = document.createElement("span");
        badge.className = "category-badge";
        badge.textContent = item.category;
        categoryCell.appendChild(badge);

        const amountCell = document.createElement("td");
        amountCell.className = "amount-cell";
        amountCell.textContent = `₹${formatMoney(item.amount)}`;

        const actionCell = document.createElement("td");
        const actions = document.createElement("div");
        actions.className = "action-buttons";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "edit-btn";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => editExpense(item.id));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => deleteExpense(item.id));

        actions.append(editButton, deleteButton);
        actionCell.appendChild(actions);

        tr.append(dateCell, nameCell, categoryCell, amountCell, actionCell);
        tbody.appendChild(tr);
    });
}

function renderCategories() {
    const container = $("category-summary-list");
    container.replaceChildren();

    const totals = {};

    getMonthExpenses().forEach(item => {
        totals[item.category] = (totals[item.category] || 0) + item.amount;
    });

    const entries = Object.entries(totals)
        .sort((a, b) => b[1] - a[1]);

    const total = entries.reduce((sum, entry) => sum + entry[1], 0);

    if (!entries.length) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = "Your category summary will appear here.";
        container.appendChild(empty);
        return;
    }

    entries.forEach(([category, amount]) => {
        const percent = total > 0 ? amount / total * 100 : 0;

        const row = document.createElement("div");
        row.className = "category-row";

        const label = document.createElement("span");
        label.textContent = category;

        const value = document.createElement("strong");
        value.textContent = `₹${formatMoney(amount)} (${percent.toFixed(1)}%)`;

        row.append(label, value);

        const track = document.createElement("div");
        track.className = "category-track";

        const fill = document.createElement("div");
        fill.className = "category-fill";
        fill.style.width = `${percent}%`;

        track.appendChild(fill);
        container.append(row, track);
    });
}

function drawChart() {
    const canvas = $("expense-chart");
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    if (!ctx || rect.width <= 0) return;

    const width = rect.width;
    const height = rect.height;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const months = [];

    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setDate(1);
        date.setMonth(date.getMonth() - i);

        const key = monthKey(date);
        const total = data.expenses
            .filter(item => item.month === key)
            .reduce((sum, item) => sum + item.amount, 0);

        months.push({
            label: date.toLocaleDateString("en-IN", { month: "short" }),
            total
        });
    }

    const max = Math.max(...months.map(item => item.total), 100);
    const left = 47;
    const right = 10;
    const top = 18;
    const bottom = 37;
    const chartWidth = width - left - right;
    const chartHeight = height - top - bottom;
    const slot = chartWidth / months.length;

    ctx.font = "11px Arial";
    ctx.textBaseline = "middle";

    for (let i = 0; i <= 4; i++) {
        const y = top + chartHeight * i / 4;
        const value = max * (4 - i) / 4;

        ctx.beginPath();
        ctx.strokeStyle = "#eeebf5";
        ctx.moveTo(left, y);
        ctx.lineTo(width - right, y);
        ctx.stroke();

        ctx.fillStyle = "#8c879b";
        ctx.textAlign = "right";
        ctx.fillText(
            value >= 1000
                ? `₹${(value / 1000).toFixed(value % 1000 ? 1 : 0)}k`
                : `₹${Math.round(value)}`,
            left - 7,
            y
        );
    }

    months.forEach((item, i) => {
        const barWidth = Math.min(32, slot * 0.55);
        const x = left + i * slot + (slot - barWidth) / 2;
        const barHeight = item.total / max * chartHeight;
        const y = top + chartHeight - barHeight;

        const gradient = ctx.createLinearGradient(0, y, 0, top + chartHeight);
        gradient.addColorStop(0, "#9b83df");
        gradient.addColorStop(1, "#9ccbf2");

        ctx.fillStyle = gradient;

        // Rounded top corners using standard canvas paths.
        const r = Math.min(6, barWidth / 2, barHeight / 2);
        const h = Math.max(barHeight, 2);
        const by = top + chartHeight - h;

        ctx.beginPath();
        ctx.moveTo(x, by + r);
        ctx.quadraticCurveTo(x, by, x + r, by);
        ctx.lineTo(x + barWidth - r, by);
        ctx.quadraticCurveTo(x + barWidth, by, x + barWidth, by + r);
        ctx.lineTo(x + barWidth, top + chartHeight);
        ctx.lineTo(x, top + chartHeight);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#8c879b";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(item.label, x + barWidth / 2, top + chartHeight + 11);
    });
}

function renderAll() {
    renderSummary();
    renderTransactions();
    renderCategories();
    drawChart();
}

$("set-income-btn").addEventListener("click", saveIncome);
$("set-budget-btn").addEventListener("click", saveBudget);
$("add-expense-btn").addEventListener("click", addExpense);

$("expense-search").addEventListener("input", renderTransactions);
$("filter-category").addEventListener("change", renderTransactions);
$("filter-month").addEventListener("change", renderTransactions);

$("reset-filters").addEventListener("click", () => {
    $("expense-search").value = "";
    $("filter-category").value = "All";
    $("filter-month").value = "";
    renderTransactions();
});

[nameInput, amountInput].forEach(input => {
    input.addEventListener("keydown", event => {
        if (event.key === "Enter") addExpense();
    });
});

incomeInput.addEventListener("keydown", event => {
    if (event.key === "Enter") saveIncome();
});

budgetInput.addEventListener("keydown", event => {
    if (event.key === "Enter") saveBudget();
});

window.addEventListener("resize", drawChart);

// Start the transaction filter on the current month.
$("filter-month").value = monthKey();

renderAll();