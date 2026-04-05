// ===== DATA STORAGE =====
let gainData = [];
let lostData = [];
let monthlySpending = {};
let savingsGoals = [];
let calorieChart;
let spendingChart;

// Load from localStorage
if (localStorage.getItem("gainData")) {
  gainData = JSON.parse(localStorage.getItem("gainData"));
  lostData = JSON.parse(localStorage.getItem("lostData"));
  monthlySpending = JSON.parse(localStorage.getItem("monthlySpending"));
  savingsGoals = JSON.parse(localStorage.getItem("savingsGoals"));
}

// ===== TAB SWITCH =====
function showTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(tab).classList.add('active');
}

// ===== ADD CALORIES GAINED + MONEY =====
function addGain() {
  let food = document.getElementById("food").value;
  let calories = Number(document.getElementById("calories").value);
  let money = Number(document.getElementById("money").value);

  if (!food || !calories || !money) return;

  gainData.push(calories);

  // Track monthly spending
  let today = new Date();
  let monthKey = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
  monthlySpending[monthKey] = (monthlySpending[monthKey] || 0) + money;

  let li = document.createElement("li");
  li.textContent = `${food} - ${calories} cal - $${money}`;
  document.getElementById("gainList").appendChild(li);

  updateCharts();
}

// ===== ADD CALORIES LOST =====
function addLost() {
  let activity = document.getElementById("activity").value;
  let burned = Number(document.getElementById("burned").value);

  if (!activity || !burned) return;

  lostData.push(burned);

  let li = document.createElement("li");
  li.textContent = `${activity} - ${burned} cal burned`;
  document.getElementById("lostList").appendChild(li);

  updateCharts();
}

// ===== ADD SCHEDULE =====
function addEvent() {
  let event = document.getElementById("event").value;
  let date = document.getElementById("date").value;

  let li = document.createElement("li");
  li.textContent = `${event} on ${date}`;
  document.getElementById("scheduleList").appendChild(li);
}

// ===== DARK MODE =====
function toggleDark() {
  document.body.classList.toggle("dark");
}

// ===== CHART HELPERS =====
function getTotalGained() {
  return gainData.reduce((a, b) => a + b, 0);
}
function getTotalLost() {
  return lostData.reduce((a, b) => a + b, 0);
}

// ===== INIT CHARTS =====
function initCharts() {
  const ctxCalorie = document.getElementById('calorieChart');
  calorieChart = new Chart(ctxCalorie, {
    type: 'bar',
    data: {
      labels: ['Calories Gained', 'Calories Lost'],
      datasets: [{
        data: [getTotalGained(), getTotalLost()],
        backgroundColor: ['rgba(220, 38, 38, 0.8)', 'rgba(37, 99, 235, 0.8)'],
        borderColor: ['rgba(220, 38, 38, 1)', 'rgba(37, 99, 235, 1)'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Calories' } }
      }
    }
  });

  updateSpendingChart();
  displaySavingsGoals();
}

// ===== UPDATE CHARTS =====
function updateCharts() {
  // Bar chart
  if (calorieChart) {
    calorieChart.data.datasets[0].data = [getTotalGained(), getTotalLost()];
    calorieChart.update();
  }
  // Pie chart
  updateSpendingChart();
  // Savings
  displaySavingsGoals();

  // Save data to localStorage
  localStorage.setItem("gainData", JSON.stringify(gainData));
  localStorage.setItem("lostData", JSON.stringify(lostData));
  localStorage.setItem("monthlySpending", JSON.stringify(monthlySpending));
  localStorage.setItem("savingsGoals", JSON.stringify(savingsGoals));
}

// ===== SPENDING PIE CHART =====
function updateSpendingChart() {
  const ctxSpending = document.getElementById('spendingChart');
  if (!ctxSpending) return;

  let months = Object.keys(monthlySpending).sort();
  let amounts = months.map(m => monthlySpending[m]);

  if (spendingChart) spendingChart.destroy();

  spendingChart = new Chart(ctxSpending, {
    type: 'pie',
    data: {
      labels: months,
      datasets: [{
        data: amounts,
        backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#a29bfe', '#fd79a8', '#00cec9']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { callbacks: { label: ctx => `${ctx.label}: $${ctx.raw.toFixed(2)}` } }
      }
    }
  });
}

// ===== SAVINGS GOALS =====
function setSavingsGoal() {
  let month = document.getElementById('monthInput').value;
  let goal = Number(document.getElementById('savingsGoal').value);
  if (!month || !goal) { alert('Enter month + goal'); return; }

  savingsGoals[month] = goal;
  displaySavingsGoals();
  document.getElementById('monthInput').value = '';
  document.getElementById('savingsGoal').value = '';
}

function displaySavingsGoals() {
  let html = '';
  for (let month in savingsGoals) {
    let spent = monthlySpending[month] || 0;
    let goal = savingsGoals[month];
    let remaining = Math.max(0, goal - spent);
    let percent = Math.min(100, (remaining / goal * 100).toFixed(1));
    let statusColor = remaining > 0 ? '#4caf50' : '#f44336';
    let statusText = remaining > 0 ? 'On Track' : 'Over Budget';

    html += `<div class="savings-goal-box">
      <strong>${month}</strong><br>
      <span style="color: inherit;">Goal: <strong>$${goal}</strong> | Spent: <strong>$${spent.toFixed(2)}</strong> | Remaining: <strong style="color: ${statusColor};">$${remaining.toFixed(2)}</strong></span>
      <div style="margin-top: 8px; color: ${statusColor}; font-weight: bold;">${statusText} - ${percent}%</div>
      <div class="savings-progress-bar">
        <div style="background: ${statusColor}; width: ${percent}%; height: 100%; border-radius: 4px; transition: width 0.3s ease;"></div>
      </div>
    </div>`;
  }

  document.getElementById('savingsGoals').innerHTML = html || '<p style="color: #666;">No savings goals set</p>';
  document.getElementById('goalsDisplay').innerHTML = html || '<p style="color: #666;">No savings goals set</p>';
}

// ===== INIT =====
window.addEventListener('load', initCharts);
