// ===== DATA =====
let gainData = [];
let lostData = [];
let monthlySpending = {};
let savingsGoals = {};
let calorieChart;
let spendingChart;

// ===== LOAD =====
function loadData() {
  gainData = JSON.parse(localStorage.getItem("gainData")) || [];
  lostData = JSON.parse(localStorage.getItem("lostData")) || [];
  monthlySpending = JSON.parse(localStorage.getItem("monthlySpending")) || {};
  savingsGoals = JSON.parse(localStorage.getItem("savingsGoals")) || {};
}

// ===== SAVE =====
function saveData() {
  localStorage.setItem("gainData", JSON.stringify(gainData));
  localStorage.setItem("lostData", JSON.stringify(lostData));
  localStorage.setItem("monthlySpending", JSON.stringify(monthlySpending));
  localStorage.setItem("savingsGoals", JSON.stringify(savingsGoals));
}

// ===== TAB =====
function showTab(tab) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(tab).classList.add("active");
}

// ===== DATE =====
function getMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// ===== ADD GAIN (FULL OBJECT) =====
function addGain() {
  const food = document.getElementById("food").value.trim();
  const calories = Number(document.getElementById("calories").value);
  const money = Number(document.getElementById("money").value);

  if (!food || !calories || !money) return;

  gainData.push({ food, calories, money });

  const monthKey = getMonthKey();
  monthlySpending[monthKey] = (monthlySpending[monthKey] || 0) + money;

  clearInputs(["food", "calories", "money"]);
  updateUI();
  renderLists();
}

// ===== ADD LOST =====
function addLost() {
  const activity = document.getElementById("activity").value.trim();
  const burned = Number(document.getElementById("burned").value);

  if (!activity || !burned) return;

  lostData.push({ activity, burned });

  clearInputs(["activity", "burned"]);
  updateUI();
  renderLists();
}

// ===== ADD EVENT =====
function addEvent() {
  const event = document.getElementById("event").value.trim();
  const date = document.getElementById("date").value;

  if (!event || !date) return;

  const li = document.createElement("li");
  li.textContent = `${event} on ${date}`;
  document.getElementById("scheduleList").appendChild(li);

  clearInputs(["event", "date"]);
}

// ===== CLEAR INPUTS =====
function clearInputs(ids) {
  ids.forEach(id => document.getElementById(id).value = "");
}

// ===== RENDER LISTS =====
function renderLists() {
  const gainList = document.getElementById("gainList");
  const lostList = document.getElementById("lostList");

  gainList.innerHTML = "";
  lostList.innerHTML = "";

  gainData.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.food} - ${item.calories} cal - $${item.money}`;
    gainList.appendChild(li);
  });

  lostData.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.activity} - ${item.burned} cal burned`;
    lostList.appendChild(li);
  });
}

// ===== RESET FUNCTIONS =====
function resetGain() {
  gainData = [];
  updateUI();
  renderLists();
}

function resetLost() {
  lostData = [];
  updateUI();
  renderLists();
}

function resetSchedule() {
  document.getElementById("scheduleList").innerHTML = "";
}

function resetSavings() {
  savingsGoals = {};
  updateUI();
}

function resetAll() {
  if (!confirm("Reset everything?")) return;

  gainData = [];
  lostData = [];
  monthlySpending = {};
  savingsGoals = {};

  localStorage.clear();

  renderLists();
  renderSavingsGoals();
  updateUI();
}

// ===== DARK MODE =====
function toggleDark() {
  document.body.classList.toggle("dark");
}

// ===== SUM =====
function sumCalories(arr) {
  return arr.reduce((total, item) => total + item.calories, 0);
}

function sumLost(arr) {
  return arr.reduce((total, item) => total + item.burned, 0);
}

// ===== CHARTS =====
function initCharts() {
  calorieChart = new Chart(document.getElementById("calorieChart"), {
    type: "bar",
    data: {
      labels: ["Gained", "Lost"],
      datasets: [{
        data: [sumCalories(gainData), sumLost(lostData)]
      }]
    },
    options: {
      plugins: { legend: { display: false } }
    }
  });

  updateSpendingChart();
  renderSavingsGoals();
}

// ===== UPDATE UI =====
function updateUI() {
  if (calorieChart) {
    calorieChart.data.datasets[0].data = [
      sumCalories(gainData),
      sumLost(lostData)
    ];
    calorieChart.update();
  }

  updateSpendingChart();
  renderSavingsGoals();
  saveData();
}

// ===== SPENDING CHART =====
function updateSpendingChart() {
  const ctx = document.getElementById("spendingChart");
  if (!ctx) return;

  const months = Object.keys(monthlySpending);
  const values = months.map(m => monthlySpending[m]);

  if (spendingChart) spendingChart.destroy();

  spendingChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: months,
      datasets: [{ data: values }]
    }
  });
}

// ===== SAVINGS =====
function setSavingsGoal() {
  const month = document.getElementById("monthInput").value;
  const goal = Number(document.getElementById("savingsGoal").value);

  if (!month || !goal) return;

  savingsGoals[month] = goal;

  clearInputs(["monthInput", "savingsGoal"]);
  updateUI();
}

// ===== RENDER SAVINGS =====
function renderSavingsGoals() {
  const container = document.getElementById("savingsGoals");

  let html = "";

  for (let month in savingsGoals) {
    const spent = monthlySpending[month] || 0;
    const goal = savingsGoals[month];
    const remaining = goal - spent;

    html += `
      <div class="card">
        <h4>${month}</h4>
        <p>Goal: $${goal}</p>
        <p>Spent: $${spent}</p>
        <p>Remaining: $${remaining}</p>
      </div>
    `;
  }

  container.innerHTML = html || "<p>No goals yet</p>";
}

// ===== INIT =====
window.addEventListener("load", () => {
  loadData();
  initCharts();
  renderLists();
});
