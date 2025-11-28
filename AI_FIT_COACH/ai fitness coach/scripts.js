// ===============================
//  FITCOACH APP - CORRECTED JS
// ===============================

// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getDatabase,
  ref as dbRef,
  get as dbGet,
  set as dbSet
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBl5zkWeZHgxn6rHFaF4eAhmxP7XY6AXGc",
  authDomain: "fitness-coach-e3295.firebaseapp.com",
  projectId: "fitness-coach-e3295",
  storageBucket: "fitness-coach-e3295.firebasestorage.app",
  messagingSenderId: "387974116131",
  appId: "1:387974116131:web:045734fc9bdb27f42d9296",
  measurementId: "G-0LH7EPN319"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Global
let userGoal = "General Fitness";
let currentPhase = 1;
const TOTAL_DAYS = 84; // 3 phases * 28

// DOM elements
const elements = {
  loginBtn: document.getElementById("loginBtn"),
  registerBtn: document.getElementById("registerBtn"),
  demoBtn: document.getElementById("demoBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  askAIBtn: document.getElementById("askAIBtn"),
  openChatSmall: document.getElementById("openChatSmall"),
  openPlans: document.getElementById("openPlans"),
  errorMsg: document.getElementById("errorMsg"),
  authPanel: document.getElementById("authPanel"),
  dashboard: document.getElementById("dashboard"),
  userEmail: document.getElementById("userEmail"),

  // Stats
  currentWeight: document.getElementById("currentWeight"),
  targetGoal: document.getElementById("targetGoal"),
  currentStreak: document.getElementById("currentStreak"),
  weeklyWorkouts: document.getElementById("weeklyWorkouts"),
  weeklyCalories: document.getElementById("weeklyCalories"),
  weeklyMinutes: document.getElementById("weeklyMinutes"),
  dailyQuote: document.getElementById("dailyQuote"),

  // Progress circles
  overallProgress: document.getElementById("overallProgress"),
  overallProgressValue: document.getElementById("overallProgressValue"),
  workoutProgress: document.getElementById("workoutProgress"),
  workoutProgressValue: document.getElementById("workoutProgressValue"),
  nutritionProgress: document.getElementById("nutritionProgress"),
  nutritionProgressValue: document.getElementById("nutritionProgressValue"),

  // Daily progress
  currentPhaseTitle: document.getElementById("currentPhaseTitle"),
  currentPhaseDays: document.getElementById("currentPhaseDays"),
  dayGrid: document.getElementById("dayGrid"),
  prevPhaseBtn: document.getElementById("prevPhaseBtn"),
  nextPhaseBtn: document.getElementById("nextPhaseBtn"),

  // Graph
  progressGraph: document.getElementById("progressGraph"),

  // Profile popup
  detailsOverlay: document.getElementById("detailsOverlay"),
  popupName: document.getElementById("popupName"),
  popupAge: document.getElementById("popupAge"),
  popupGender: document.getElementById("popupGender"),
  popupHeight: document.getElementById("popupHeight"),
  popupWeight: document.getElementById("popupWeight"),
  popupReason: document.getElementById("popupReason"),
  popupSaveBtn: document.getElementById("popupSaveBtn"),
  popupSkipBtn: document.getElementById("popupSkipBtn"),

  // Profile display
  displayName: document.getElementById("displayName"),
  displayAge: document.getElementById("displayAge"),
  displayGender: document.getElementById("displayGender"),
  displayHeight: document.getElementById("displayHeight"),
  displayWeight: document.getElementById("displayWeight"),
  displayReason: document.getElementById("displayReason"),
  editMetricsBtn: document.getElementById("editMetricsBtn"),

  // Plan modal
  planModal: document.getElementById("planModal"),
  closePlan: document.getElementById("closePlan"),

  // Reset progress
  resetProgressBtn: document.getElementById("resetProgressBtn"),
  confirmModal: document.getElementById("confirmModal"),
  cancelReset: document.getElementById("cancelReset"),
  confirmReset: document.getElementById("confirmReset"),

  // Chat
  chatPanel: document.getElementById("chatPanel"),
  chatBody: document.getElementById("chatBody"),
  chatInput: document.getElementById("chatInput"),
  chatSend: document.getElementById("chatSend"),
  closeChat: document.getElementById("closeChat"),
  typingIndicator: document.getElementById("typingIndicator")
};

const DEMO_ACCOUNT = { email: "demo@fitcoach.ai", password: "demo123" };

// =====================
// Utility
// =====================
function showError(message) {
  if (elements.errorMsg) {
    elements.errorMsg.textContent = message;
    elements.errorMsg.style.display = "block";
    setTimeout(() => {
      elements.errorMsg.style.display = "none";
    }, 5000);
  } else {
    console.error(message);
  }
}

function showSuccess(message) {
  console.log("Success:", message);
}

// =====================
// Progress helpers
// =====================
function getCompletedDays() {
  let count = 0;
  for (let i = 1; i <= TOTAL_DAYS; i++) {
    if (localStorage.getItem(`day_${i}_completed`) === "true") {
      count++;
    }
  }
  return count;
}

function getCompletedDaysInPhase(phase) {
  const startDay = (phase - 1) * 28 + 1;
  const endDay = phase * 28;
  let count = 0;
  for (let day = startDay; day <= endDay; day++) {
    if (localStorage.getItem(`day_${day}_completed`) === "true") {
      count++;
    }
  }
  return count;
}

function getPhaseTitle(phase) {
  const titles = {
    1: "Phase 1: Foundation Building",
    2: "Phase 2: Progression",
    3: "Phase 3: Mastery"
  };
  return titles[phase] || `Phase ${phase}`;
}

// For demo, fixed current day
function getCurrentDay() {
  return 15;
}

function updateCircle(circle, percentage) {
  if (!circle) return;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  circle.style.strokeDashoffset = offset;
}

// =====================
// Update progress circles
// =====================
function updateProgressCircles() {
  const completedDays = getCompletedDays();
  const overallProgress = Math.round((completedDays / TOTAL_DAYS) * 100);

  const workoutProgress = Math.min(
    overallProgress + Math.floor(Math.random() * 20),
    100
  );
  const nutritionProgress = Math.min(
    overallProgress + Math.floor(Math.random() * 15),
    100
  );

  if (elements.overallProgressValue) {
    elements.overallProgressValue.textContent = `${overallProgress}%`;
  }
  if (elements.workoutProgressValue) {
    elements.workoutProgressValue.textContent = `${workoutProgress}%`;
  }
  if (elements.nutritionProgressValue) {
    elements.nutritionProgressValue.textContent = `${nutritionProgress}%`;
  }

  updateCircle(elements.overallProgress, overallProgress);
  updateCircle(elements.workoutProgress, workoutProgress);
  updateCircle(elements.nutritionProgress, nutritionProgress);
}

// =====================
// Update stats
// =====================
function updateStats() {
  const completedDays = getCompletedDays();

  if (elements.currentStreak) {
    elements.currentStreak.textContent = completedDays;
  }
  if (elements.weeklyWorkouts) {
    elements.weeklyWorkouts.textContent =
      Math.floor((completedDays / 7) * 4) + Math.floor(Math.random() * 3);
  }
  if (elements.weeklyCalories) {
    elements.weeklyCalories.textContent = (
      completedDays * 350 +
      Math.floor(Math.random() * 1000)
    ).toLocaleString();
  }
  if (elements.weeklyMinutes) {
    elements.weeklyMinutes.textContent =
      completedDays * 30 + Math.floor(Math.random() * 60);
  }

  const quotes = [
    "The only bad workout is the one that didn't happen.",
    "Don't wish for a good body, work for it.",
    "Your body can stand almost anything. It's your mind you have to convince.",
    "Strength doesn't come from what you can do. It comes from overcoming the things you once thought you couldn't.",
    "The hardest lift of all is lifting your butt off the couch."
  ];
  const chosen = quotes[Math.floor(Math.random() * quotes.length)];
  if (elements.dailyQuote) {
    elements.dailyQuote.textContent = chosen;
  }
}

// =====================
// Daily grid
// =====================
function generateDayGrid() {
  if (!elements.dayGrid) return;
  const startDay = (currentPhase - 1) * 28 + 1;
  const endDay = currentPhase * 28;

  if (elements.currentPhaseTitle) {
    elements.currentPhaseTitle.textContent = getPhaseTitle(currentPhase);
  }
  if (elements.currentPhaseDays) {
    elements.currentPhaseDays.textContent = `Days ${startDay}-${endDay}`;
  }

  if (elements.prevPhaseBtn) {
    elements.prevPhaseBtn.disabled = currentPhase === 1;
  }
  if (elements.nextPhaseBtn) {
    elements.nextPhaseBtn.disabled = currentPhase === 3;
  }

  elements.dayGrid.innerHTML = "";
  const today = getCurrentDay();

  for (let day = startDay; day <= endDay; day++) {
    const isCompleted =
      localStorage.getItem(`day_${day}_completed`) === "true";
    const isToday = day === today;

    const dayCard = document.createElement("div");
    dayCard.className = `day-card ${isCompleted ? "completed" : ""} ${
      isToday ? "today" : ""
    }`;
    dayCard.dataset.day = String(day);

    dayCard.innerHTML = `
      <div class="day-number">${day}</div>
      <div class="day-status">${isCompleted ? "Completed" : "Pending"}</div>
    `;

    dayCard.addEventListener("click", () => toggleDayCompletion(day));
    elements.dayGrid.appendChild(dayCard);
  }
}

function toggleDayCompletion(day) {
  const key = `day_${day}_completed`;
  const isCompleted = localStorage.getItem(key) === "true";

  if (!isCompleted) {
    localStorage.setItem(key, "true");
    showSuccess(`Day ${day} marked as completed!`);
  } else {
    localStorage.setItem(key, "false");
    showSuccess(`Day ${day} marked as incomplete.`);
  }

  generateDayGrid();
  updateProgressCircles();
  updateStats();
  updateProgressGraph();
}

// =====================
// Progress Graph
// =====================
function updateProgressGraph() {
  if (!elements.progressGraph) return;

  const completedDays = getCompletedDays();
  const overallProgress = Math.round((completedDays / TOTAL_DAYS) * 100);

  const phase1Pct = Math.round(
    (getCompletedDaysInPhase(1) / 28) * 100
  );
  const phase2Pct = Math.round(
    (getCompletedDaysInPhase(2) / 28) * 100
  );
  const phase3Pct = Math.round(
    (getCompletedDaysInPhase(3) / 28) * 100
  );

  const graphHTML = `
    <h4>📊 Your Consistency Progress</h4>
    <div class="phase-progress" style="display: flex; align-items: center; margin-bottom: 10px;">
      <span style="font-size: 14px; color: var(--text-medium); min-width: 60px;">${overallProgress}% Complete</span>
      <div style="flex: 1; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin: 0 10px;">
        <div style="height: 100%; background: linear-gradient(90deg, var(--primary), var(--primary-light)); border-radius: 4px; width: ${overallProgress}%; transition: width 0.5s ease;"></div>
      </div>
      <span style="font-size: 14px; color: var(--text-medium); min-width: 60px;">${completedDays}/${TOTAL_DAYS} Days</span>
    </div>

    <div class="graph-container">
      <div class="graph-bars">
        <div class="graph-bar" style="height: ${Math.min(
          100,
          phase1Pct
        )}%">
          <div class="graph-bar-value">${phase1Pct}%</div>
          <div class="graph-bar-label">Phase 1</div>
        </div>
        <div class="graph-bar" style="height: ${Math.min(
          100,
          phase2Pct
        )}%">
          <div class="graph-bar-value">${phase2Pct}%</div>
          <div class="graph-bar-label">Phase 2</div>
        </div>
        <div class="graph-bar" style="height: ${Math.min(
          100,
          phase3Pct
        )}%">
          <div class="graph-bar-value">${phase3Pct}%</div>
          <div class="graph-bar-label">Phase 3</div>
        </div>
      </div>
      <div class="graph-x-axis">
        <div class="graph-x-label">Foundation</div>
        <div class="graph-x-label">Progression</div>
        <div class="graph-x-label">Mastery</div>
      </div>
    </div>

    <div class="graph-stats">
      <div class="stat-item">
        <span class="stat-label">Current Day:</span>
        <span class="stat-value">${getCurrentDay()}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Days Completed:</span>
        <span class="stat-value">${completedDays}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Current Phase:</span>
        <span class="stat-value">${currentPhase}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Consistency Score:</span>
        <span class="stat-value">${overallProgress}%</span>
      </div>
    </div>
  `;

  elements.progressGraph.innerHTML = graphHTML;
  elements.progressGraph.style.display = "block";
}

// =====================
// Popup & User Data
// =====================
function openDetailsOverlay() {
  if (!elements.detailsOverlay) return;

  elements.detailsOverlay.style.display = "flex";
  elements.detailsOverlay.setAttribute("aria-hidden", "false");

  elements.popupName.value =
    elements.displayName.textContent === "N/A"
      ? ""
      : elements.displayName.textContent;
  elements.popupAge.value =
    elements.displayAge.textContent === "N/A"
      ? ""
      : elements.displayAge.textContent;
  elements.popupGender.value =
    elements.displayGender.textContent === "N/A"
      ? ""
      : elements.displayGender.textContent;
  elements.popupHeight.value =
    elements.displayHeight.textContent === "N/A"
      ? ""
      : elements.displayHeight.textContent.replace(" cm", "");
  elements.popupWeight.value =
    elements.displayWeight.textContent === "N/A"
      ? ""
      : elements.displayWeight.textContent.replace(" kg", "");
  elements.popupReason.value =
    elements.displayReason.textContent === "Set your goal!"
      ? ""
      : elements.displayReason.textContent;
}

function closeDetailsOverlay() {
  if (!elements.detailsOverlay) return;
  elements.detailsOverlay.style.display = "none";
  elements.detailsOverlay.setAttribute("aria-hidden", "true");
}

function updateDashboardMetrics(details = {}) {
  const name = details.name || "N/A";
  const age = details.age ? `${details.age}` : "N/A";
  const gender = details.gender || "N/A";
  const height = details.height ? `${details.height} cm` : "N/A";
  const weight = details.weight ? `${details.weight} kg` : "N/A";
  const reason = details.reason || "General Fitness";

  if (elements.displayName) elements.displayName.textContent = name;
  if (elements.displayAge) elements.displayAge.textContent = age;
  if (elements.displayGender) elements.displayGender.textContent = gender;
  if (elements.displayHeight) elements.displayHeight.textContent = height;
  if (elements.displayWeight) elements.displayWeight.textContent = weight;
  if (elements.displayReason) elements.displayReason.textContent = reason;

  userGoal = reason;
  if (elements.currentWeight) {
    elements.currentWeight.textContent = details.weight
      ? `${details.weight}kg`
      : "-";
  }
  if (elements.targetGoal) {
    elements.targetGoal.textContent = userGoal;
  }
}

async function savePopupDetails() {
  const user = auth.currentUser;
  if (!user) return;

  const name = elements.popupName.value.trim();
  const age = elements.popupAge.value.trim();
  const gender = elements.popupGender.value;
  const height = elements.popupHeight.value.trim();
  const weight = elements.popupWeight.value.trim();
  const reason = elements.popupReason.value.trim();

  if (!name || !age || !gender || !height || !weight) {
    alert("Please enter all required fields, or use the Skip button.");
    return;
  }

  elements.popupSaveBtn.disabled = true;
  elements.popupSaveBtn.classList.add("btn-saving");
  elements.popupSaveBtn.textContent = "Saving...";

  try {
    const userRef = dbRef(db, `users/${user.uid}/details`);
    const newDetails = {
      name,
      age: parseInt(age, 10),
      gender,
      height: parseInt(height, 10),
      weight: parseInt(weight, 10),
      reason: reason || "General Fitness",
      savedAt: Date.now()
    };
    await dbSet(userRef, newDetails);
    updateDashboardMetrics(newDetails);
    closeDetailsOverlay();
    updateProgressGraph();
    updateProgressCircles();
    updateStats();
  } catch (err) {
    alert("Failed to save details: " + err.message);
  } finally {
    elements.popupSaveBtn.disabled = false;
    elements.popupSaveBtn.classList.remove("btn-saving");
    elements.popupSaveBtn.textContent = "Save Details";
  }
}

async function skipPopup() {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const userRef = dbRef(db, `users/${user.uid}/details`);
    await dbSet(userRef, { skipped: true, savedAt: Date.now() });
    closeDetailsOverlay();
    updateProgressGraph();
    updateProgressCircles();
    updateStats();
  } catch (err) {
    alert("Failed to skip: " + err.message);
  }
}

async function loadUserDetails(user) {
  try {
    const userDetailsRef = dbRef(db, `users/${user.uid}/details`);
    const snapshot = await dbGet(userDetailsRef);
    const details = snapshot.val();

    if (details && !details.skipped) {
      updateDashboardMetrics(details);
    } else {
      updateDashboardMetrics({});
      setTimeout(() => openDetailsOverlay(), 250);
    }
  } catch (err) {
    console.error("Error checking or loading user details:", err);
  }
}

// =====================
// Plan Modal
// =====================
if (elements.openPlans) {
  elements.openPlans.addEventListener("click", () => {
    if (elements.planModal) elements.planModal.style.display = "flex";
  });
}

if (elements.closePlan) {
  elements.closePlan.addEventListener("click", () => {
    if (elements.planModal) elements.planModal.style.display = "none";
  });
}

if (elements.planModal) {
  elements.planModal.addEventListener("click", (e) => {
    if (e.target === elements.planModal) {
      elements.planModal.style.display = "none";
    }
  });
}

// =====================
// Reset Progress
// =====================
if (elements.resetProgressBtn) {
  elements.resetProgressBtn.addEventListener("click", () => {
    if (elements.confirmModal) elements.confirmModal.style.display = "flex";
  });
}

if (elements.cancelReset) {
  elements.cancelReset.addEventListener("click", () => {
    if (elements.confirmModal) elements.confirmModal.style.display = "none";
  });
}

function resetAllProgress() {
  for (let i = 1; i <= TOTAL_DAYS; i++) {
    localStorage.removeItem(`day_${i}_completed`);
  }
  currentPhase = 1;

  if (elements.confirmModal) {
    elements.confirmModal.style.display = "none";
  }

  generateDayGrid();
  updateProgressCircles();
  updateStats();
  updateProgressGraph();

  showSuccess(
    "All progress has been reset! You are now back to the beginning of your journey."
  );
}

if (elements.confirmReset) {
  elements.confirmReset.addEventListener("click", resetAllProgress);
}

if (elements.confirmModal) {
  elements.confirmModal.addEventListener("click", (e) => {
    if (e.target === elements.confirmModal) {
      elements.confirmModal.style.display = "none";
    }
  });
}

// =====================
// Auth Handlers
// =====================
if (elements.registerBtn) {
  elements.registerBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    if (!email || !password) {
      showError("Please enter both email and password");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      showSuccess("Account created successfully!");
    } catch (error) {
      showError(error.message);
    }
  });
}

if (elements.loginBtn) {
  elements.loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    if (!email || !password) {
      showError("Please enter both email and password");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      showError("Invalid email or password. Please try again.");
    }
  });
}

if (elements.demoBtn) {
  elements.demoBtn.addEventListener("click", async () => {
    try {
      await createUserWithEmailAndPassword(
        auth,
        DEMO_ACCOUNT.email,
        DEMO_ACCOUNT.password
      );
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        await signInWithEmailAndPassword(
          auth,
          DEMO_ACCOUNT.email,
          DEMO_ACCOUNT.password
        );
      } else {
        showError("Demo login failed: " + error.message);
      }
    }
  });
}

if (elements.logoutBtn) {
  elements.logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
  });
}

// Phase navigation
if (elements.prevPhaseBtn) {
  elements.prevPhaseBtn.addEventListener("click", () => {
    if (currentPhase > 1) {
      currentPhase--;
      generateDayGrid();
    }
  });
}
if (elements.nextPhaseBtn) {
  elements.nextPhaseBtn.addEventListener("click", () => {
    if (currentPhase < 3) {
      currentPhase++;
      generateDayGrid();
    }
  });
}

// =====================
// Auth state listener
// =====================
onAuthStateChanged(auth, (user) => {
  if (user) {
    elements.authPanel.style.display = "none";
    elements.dashboard.style.display = "block";
    elements.userEmail.textContent = user.email;
    document.getElementById("authHeader").innerHTML = `
      <div style="text-align: right;">
        <div style="font-size: 14px; color: var(--primary); font-weight: 600;">Welcome!</div>
        <div style="font-size: 13px; color: var(--text-medium);">${user.email}</div>
      </div>
    `;
    loadUserDetails(user);
    generateDayGrid();
    updateProgressGraph();
    updateProgressCircles();
    updateStats();
  } else {
    elements.authPanel.style.display = "block";
    elements.dashboard.style.display = "none";
    elements.userEmail.textContent = "";
    document.getElementById("authHeader").innerHTML = "";
    closeDetailsOverlay();
  }
});

// =====================
// Chat (AI Coach)
// =====================
function openChat() {
  if (!elements.chatPanel) return;
  elements.chatPanel.style.display = "flex";
  setTimeout(() => {
    if (elements.chatInput) elements.chatInput.focus();
  }, 100);
}

function closeChat() {
  if (!elements.chatPanel) return;
  elements.chatPanel.style.display = "none";
}

if (elements.askAIBtn) {
  elements.askAIBtn.addEventListener("click", openChat);
}
if (elements.openChatSmall) {
  elements.openChatSmall.addEventListener("click", openChat);
}
if (elements.closeChat) {
  elements.closeChat.addEventListener("click", closeChat);
}

if (elements.chatSend) {
  elements.chatSend.addEventListener("click", sendMessage);
}
if (elements.chatInput) {
  elements.chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });
}

// Responses DB (same content you had, just valid JS)
const responses = {
  "workout plan": {
    response:
      "Here is your customized workout plan based on your goal and fitness level:\n\n• Monday: Full Body Strength (Squats, Push-ups, Rows)\n• Tuesday: Cardio & Core (Running, Planks, Leg Raises)\n• Wednesday: Active Recovery (Yoga, Stretching)\n• Thursday: Upper Body Focus (Bench Press, Pull-ups, Shoulder Press)\n• Friday: Lower Body & Cardio (Deadlifts, Lunges, Cycling)\n• Saturday: Sports or Fun Activity\n• Sunday: Rest Day\n\nAdjust intensity based on your fitness level and progress.",
    keywords: [
      "workout",
      "plan",
      "routine",
      "schedule",
      "exercise",
      "training",
      "program"
    ]
  },
  "diet plan": {
    response:
      "Your fat-loss diet plan includes:\n\n🍳 Breakfast: 2 boiled eggs + 1 whole wheat toast + green tea\n🥗 Lunch: Grilled chicken/fish + large salad + 1/2 cup brown rice\n🍎 Snack: Apple with 1 tbsp peanut butter or Greek yogurt\n🍲 Dinner: Steamed vegetables + lentil soup or tofu stir-fry\n💧 Hydration: 2-3 liters of water daily\n\nCalorie target: 1500-1800 based on your activity level. Focus on protein and fiber to stay full.",
    keywords: [
      "diet",
      "meal",
      "nutrition",
      "food",
      "eating",
      "calories",
      "weight loss",
      "fat loss"
    ]
  },
  // (You can keep all the rest of the response entries exactly as you had.
  // To keep this message shorter, I'm not repeating all of them here.
  // Just paste your full `responses` object here – it was already valid JS.)
};

// ---- Chat helpers ----
function addMessage(text, isUser = false) {
  if (!elements.chatBody) return;
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${isUser ? "user-message" : "bot-message"}`;
  messageDiv.textContent = text;
  elements.chatBody.appendChild(messageDiv);
  elements.chatBody.scrollTop = elements.chatBody.scrollHeight;
}

function showTyping() {
  if (!elements.typingIndicator || !elements.chatBody) return;
  elements.typingIndicator.style.display = "block";
  elements.chatBody.scrollTop = elements.chatBody.scrollHeight;
}

function hideTyping() {
  if (!elements.typingIndicator) return;
  elements.typingIndicator.style.display = "none";
}

function findBestResponse(input) {
  let bestMatch = null;
  let bestScore = 0;

  for (const [category, data] of Object.entries(responses)) {
    let score = 0;
    for (const keyword of data.keywords) {
      if (input.includes(keyword)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = category;
    }
  }

  if (bestScore > 0 && bestMatch) {
    return responses[bestMatch].response;
  }
  return "I'm not sure I understand. Try asking about workouts, nutrition, or fitness tracking. Be more specific with your question for better help!";
}

function sendMessage() {
  if (!elements.chatInput || !elements.chatBody) return;
  const message = elements.chatInput.value.trim();
  if (!message) return;

  addMessage(message, true);
  elements.chatInput.value = "";
  showTyping();

  setTimeout(() => {
    hideTyping();
    const response = findBestResponse(message.toLowerCase());
    addMessage(response, false);
  }, 800 + Math.random() * 800);
}

// =====================
// Edit profile button
// =====================
if (elements.editMetricsBtn) {
  elements.editMetricsBtn.addEventListener("click", openDetailsOverlay);
}
if (elements.popupSaveBtn) {
  elements.popupSaveBtn.addEventListener("click", savePopupDetails);
}
if (elements.popupSkipBtn) {
  elements.popupSkipBtn.addEventListener("click", skipPopup);
}

