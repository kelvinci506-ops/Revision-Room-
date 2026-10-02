// ==========================================================================
// THE REVISION ROOM - MAIN APPLICATION ENGINE (app.js)
// ==========================================================================

// 1. FIREBASE CONFIGURATION & INITIALIZATION
const firebaseConfig = {
    databaseURL: "https://revision-room-c2865-default-rtdb.firebaseio.com"
};

// Initialize Firebase
if (typeof firebase !== "undefined" && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = (typeof firebase !== "undefined" && firebase.database) ? firebase.database() : null;

// APP STATE VARIABLES
let currentUser = {
    id: null,
    name: "Student",
    avatar: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='%236366f1'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-3.8-1.04-4.84-2.61.03-1.6 3.23-2.48 4.84-2.48 1.6 0 4.81.88 4.84 2.48C15.8 18.96 14.03 20 12 20z'/></svg>",
    points: 0
};

let studyTimerSeconds = 0;
let timerInterval = null;
let currentQuizMode = "solo"; // 'solo' or '1v1'
let currentQuestionIndex = 0;
let activeQuizQuestions = [];
let userScore = 0;

let currentTerm = "term1";
let currentSubject = "english";

// DOM ELEMENTS
const profileModal = document.getElementById("profile-modal");
const appContainer = document.getElementById("app");
const avatarInput = document.getElementById("avatar-input");
const avatarPreview = document.getElementById("avatar-preview");
const usernameInput = document.getElementById("username-input");
const saveProfileBtn = document.getElementById("save-profile-btn");

const navAvatar = document.getElementById("nav-avatar");
const navUsername = document.getElementById("nav-username");
const userPointsElem = document.getElementById("user-points");
const studyTimerElem = document.getElementById("study-timer");

// ==========================================================================
// PROFILE & AVATAR HANDLER
// ==========================================================================

if (avatarInput) {
    avatarInput.addEventListener("change", function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                currentUser.avatar = event.target.result;
                if (avatarPreview) avatarPreview.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

if (saveProfileBtn) {
    saveProfileBtn.addEventListener("click", function () {
        const name = usernameInput ? usernameInput.value.trim() : "";
        if (!name) {
            alert("Please enter your name to start!");
            return;
        }

        currentUser.name = name;
        currentUser.id = "user_" + Date.now();

        if (navUsername) navUsername.textContent = currentUser.name;
        if (navAvatar) navAvatar.src = currentUser.avatar;

        if (profileModal) profileModal.classList.add("hidden");
        if (appContainer) appContainer.classList.remove("hidden");

        initStudyTimer();
        initOnlinePresence();
        initChatEngine();
        initLeaderboard();
        
        // Load initial notes for Term 1 English
        loadNotes(currentTerm, currentSubject);
    });
}

// ==========================================================================
// NAVIGATION & VIEWS
// ==========================================================================
const navButtons = document.querySelectorAll(".nav-btn");
const viewPanels = document.querySelectorAll(".view-panel");

navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const targetView = btn.getAttribute("data-target");

        navButtons.forEach(b => b.classList.remove("active"));
        viewPanels.forEach(p => p.classList.remove("active"));

        btn.classList.add("active");
        const targetElem = document.getElementById(targetView);
        if (targetElem) targetElem.classList.add("active");
    });
});

// ==========================================================================
// STUDY TIMER ENGINE
// ==========================================================================
function initStudyTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        studyTimerSeconds++;
        const mins = Math.floor(studyTimerSeconds / 60).toString().padStart(2, "0");
        const secs = (studyTimerSeconds % 60).toString().padStart(2, "0");
        if (studyTimerElem) studyTimerElem.textContent = `${mins}:${secs}`;
        
        if (studyTimerSeconds % 300 === 0) {
            addPoints(5);
        }
    }, 1000);
}

function addPoints(pts) {
    currentUser.points += pts;
    if (userPointsElem) userPointsElem.textContent = currentUser.points;
    
    if (db && currentUser.id) {
        db.ref("leaderboard/" + currentUser.id).set({
            name: currentUser.name,
            avatar: currentUser.avatar,
            points: currentUser.points
        });
    }
}

// ==========================================================================
// NOTES ENGINE (TERM & SUBJECT SWITCHING)
// ==========================================================================
const termButtons = document.querySelectorAll(".term-btn");
const tabButtons = document.querySelectorAll(".tab-btn");
const notesContent = document.getElementById("notes-content");

termButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        termButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentTerm = btn.getAttribute("data-term");
        loadNotes(currentTerm, currentSubject);
    });
});

tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        tabButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentSubject = btn.getAttribute("data-subject");
        loadNotes(currentTerm, currentSubject);
    });
});

function loadNotes(term, subject) {
    if (!notesContent) return;

    if (typeof notesData !== "undefined" && notesData[term] && notesData[term][subject]) {
        notesContent.innerHTML = notesData[term][subject];
    } else {
        notesContent.innerHTML = "<p>Notes content coming soon.</p>";
    }
}

// ==========================================================================
// QUIZ ENGINE (SOLO & 1v1 MODES)
// ==========================================================================
const startSoloBtn = document.getElementById("start-solo-btn");
const start1v1Btn = document.getElementById("start-1v1-btn");
const quizSelection = document.getElementById("quiz-selection");
const quizContainer = document.getElementById("quiz-container");
const forfeitBtn = document.getElementById("forfeit-btn");
const quizModeTitle = document.getElementById("quiz-mode-title");
const quizProgress = document.getElementById("quiz-progress");
const quizQuestionText = document.getElementById("quiz-question-text");
const quizOptions = document.getElementById("quiz-options");
const quizFeedback = document.getElementById("quiz-feedback");
const feedbackMessage = document.getElementById("feedback-message");
const explanationText = document.getElementById("explanation-text");
const nextQuestionBtn = document.getElementById("next-question-btn");
const retakeQuizBtn = document.getElementById("retake-quiz-btn");

if (startSoloBtn) startSoloBtn.addEventListener("click", () => startQuiz("solo"));
if (start1v1Btn) start1v1Btn.addEventListener("click", () => startQuiz("1v1"));

function startQuiz(mode) {
    currentQuizMode = mode;
    if (quizSelection) quizSelection.classList.add("hidden");
    if (quizContainer) quizContainer.classList.remove("hidden");
    if (retakeQuizBtn) retakeQuizBtn.classList.add("hidden");

    const questionsList = (typeof quizQuestions !== "undefined") ? quizQuestions : [];

    if (mode === "solo") {
        if (quizModeTitle) quizModeTitle.textContent = "🎯 Solo Challenge";
        if (forfeitBtn) forfeitBtn.classList.add("hidden");
        activeQuizQuestions = [...questionsList].sort(() => 0.5 - Math.random()).slice(0, 20);
    } else {
        if (quizModeTitle) quizModeTitle.textContent = "⚔️ 1v1 Match";
        if (forfeitBtn) forfeitBtn.classList.remove("hidden");
        let combined = [...questionsList, ...questionsList];
        activeQuizQuestions = combined.sort(() => 0.5 - Math.random()).slice(0, 30);
    }

    currentQuestionIndex = 0;
    userScore = 0;
    renderQuestion();
}

function renderQuestion() {
    if (quizFeedback) quizFeedback.classList.add("hidden");
    if (quizOptions) quizOptions.innerHTML = "";

    if (currentQuestionIndex >= activeQuizQuestions.length) {
        showQuizResults();
        return;
    }

    const q = activeQuizQuestions[currentQuestionIndex];
    if (!q) return;

    if (quizProgress) quizProgress.textContent = `Question ${currentQuestionIndex + 1}/${activeQuizQuestions.length}`;
    if (quizQuestionText) quizQuestionText.textContent = `[${q.subject}] ${q.question}`;

    if (q.options && quizOptions) {
        q.options.forEach((opt, idx) => {
            const btn = document.createElement("button");
            btn.className = "option-btn";
            btn.textContent = opt;
            btn.addEventListener("click", () => handleAnswer(idx, q.correct, q.explanation));
            quizOptions.appendChild(btn);
        });
    }
}

function handleAnswer(selectedIdx, correctIdx, explanation) {
    if (!quizOptions) return;
    const optionBtns = quizOptions.querySelectorAll(".option-btn");
    optionBtns.forEach(btn => btn.disabled = true);

    if (selectedIdx === correctIdx) {
        if (optionBtns[selectedIdx]) optionBtns[selectedIdx].classList.add("correct");
        if (feedbackMessage) {
            feedbackMessage.textContent = "✅ Correct!";
            feedbackMessage.style.color = "var(--success)";
        }
        addPoints(10);
        userScore++;
    } else {
        if (optionBtns[selectedIdx]) optionBtns[selectedIdx].classList.add("wrong");
        if (optionBtns[correctIdx]) optionBtns[correctIdx].classList.add("correct");
        if (feedbackMessage) {
            feedbackMessage.textContent = "❌ Incorrect";
            feedbackMessage.style.color = "var(--danger)";
        }
    }

    if (explanationText) explanationText.textContent = explanation;
    if (quizFeedback) quizFeedback.classList.remove("hidden");
}

if (nextQuestionBtn) {
    nextQuestionBtn.addEventListener("click", () => {
        currentQuestionIndex++;
        renderQuestion();
    });
}

if (forfeitBtn) {
    forfeitBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to forfeit this 1v1 match? You will lose progress.")) {
            if (quizContainer) quizContainer.classList.add("hidden");
            if (quizSelection) quizSelection.classList.remove("hidden");
        }
    });
}

function showQuizResults() {
    if (quizQuestionText) quizQuestionText.textContent = `🎉 Quiz Completed! You scored ${userScore} out of ${activeQuizQuestions.length}!`;
    if (quizOptions) quizOptions.innerHTML = "";
    if (quizFeedback) quizFeedback.classList.add("hidden");
    if (retakeQuizBtn) retakeQuizBtn.classList.remove("hidden");
}

if (retakeQuizBtn) {
    retakeQuizBtn.addEventListener("click", () => {
        startQuiz(currentQuizMode);
    });
}

// ==========================================================================
// REALTIME PRESENCE & CHAT
// ==========================================================================
function initOnlinePresence() {
    if (!db || !currentUser.id) return;
    const userPresenceRef = db.ref("presence/" + currentUser.id);
    userPresenceRef.set({
        name: currentUser.name,
        avatar: currentUser.avatar,
        online: true
    });
    userPresenceRef.onDisconnect().remove();

    db.ref("presence").on("value", snapshot => {
        const onlineUsersList = document.getElementById("online-users-list");
        if (!onlineUsersList) return;
        onlineUsersList.innerHTML = "";
        const data = snapshot.val();
        if (data) {
            Object.values(data).forEach(user => {
                const chip = document.createElement("div");
                chip.className = "online-user-chip";
                chip.innerHTML = `<img src="${user.avatar}" alt=""> <span>${user.name}</span>`;
                onlineUsersList.appendChild(chip);
            });
        }
    });
}

function initChatEngine() {
    if (!db) return;
    const chatForm = document.getElementById("chat-form");
    const chatInput = document.getElementById("chat-message-input");
    const chatMessages = document.getElementById("chat-messages");

    if (chatForm) {
        chatForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const msg = chatInput ? chatInput.value.trim() : "";
            if (msg) {
                db.ref("chat").push({
                    senderId: currentUser.id,
                    senderName: currentUser.name,
                    senderAvatar: currentUser.avatar,
                    message: msg,
                    timestamp: Date.now()
                });
                if (chatInput) chatInput.value = "";
            }
        });
    }

    db.ref("chat").limitToLast(50).on("child_added", snapshot => {
        const msgData = snapshot.val();
        if (!chatMessages || !msgData) return;
        const isSelf = msgData.senderId === currentUser.id;

        const msgDiv = document.createElement("div");
        msgDiv.className = `chat-message ${isSelf ? "self" : ""}`;
        msgDiv.innerHTML = `
            <img src="${msgData.senderAvatar}" alt="">
            <div class="msg-content">
                <div class="msg-author">${isSelf ? "You" : msgData.senderName}</div>
                <div>${msgData.message}</div>
            </div>
        `;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
}

// ==========================================================================
// LEADERBOARD ENGINE
// ==========================================================================
function initLeaderboard() {
    if (!db) return;
    const leaderboardList = document.getElementById("leaderboard-list");
    if (!leaderboardList) return;

    db.ref("leaderboard").orderByChild("points").limitToLast(20).on("value", snapshot => {
        leaderboardList.innerHTML = "";
        let users = [];

        snapshot.forEach(child => {
            users.push(child.val());
        });

        users.reverse();

        users.forEach((user, index) => {
            const li = document.createElement("li");
            li.className = "rank-item";
            li.innerHTML = `
                <div class="rank-user">
                    <span class="rank-num">#${index + 1}</span>
                    <img src="${user.avatar}" alt="">
                    <span>${user.name}</span>
                </div>
                <span class="rank-pts">${user.points} PTS</span>
            `;
            leaderboardList.appendChild(li);
        });
    });
}

// ==================== FIREBASE & LIVE CHAT LOGIC ====================

// 1. Firebase Configuration
if (typeof firebaseConfig === 'undefined') {
  window.firebaseConfig = {
    apiKey: "AIzaSyCQgVXarStxlVu8p5HjmxZ7sFKho2jOokw",
    authDomain: "revision-room-c2865.firebaseapp.com",
    databaseURL: "https://revision-room-c2865-default-rtdb.firebaseio.com",
    projectId: "revision-room-c2865",
    storageBucket: "revision-room-c2865.firebasestorage.app",
    messagingSenderId: "1056489500486",
    appId: "1:1056489500486:web:98645439a64c151547bf47",
    measurementId: "G-DGFY44QV13"
  };
}

// Initialize database handle
const chatDb = firebase.database();

// 2. Get/Set Username
let chatUser = localStorage.getItem("revision_username");
if (!chatUser) {
  chatUser = prompt("Enter your name to join study chat:") || ("Student_" + Math.floor(Math.random() * 1000));
  localStorage.setItem("revision_username", chatUser);
}

const userDisplay = document.getElementById('user-display-name');
if (userDisplay) {
  userDisplay.textContent = "Logged in as: " + chatUser;
}

// 3. Online Presence Tracker
const myStatusRef = chatDb.ref('status/' + chatUser);
const connectedRef = chatDb.ref('.info/connected');

connectedRef.on('value', (snap) => {
  if (snap.val() === true) {
    myStatusRef.set({ state: 'online', last_changed: firebase.database.ServerValue.TIMESTAMP });
    myStatusRef.onDisconnect().remove();
  }
});

// 4. Update Online Classmates Bar & Count
chatDb.ref('status').on('value', (snapshot) => {

  const users = snapshot.val() || {};
  const onlineContainer = document.getElementById('online-students-list');
  const badge = document.getElementById('online-count-badge');
  const userList = Object.keys(users);
  
  if (badge) badge.textContent = userList.length;

  if (onlineContainer) {
    onlineContainer.innerHTML = '';
    if (userList.length === 0) {
      onlineContainer.innerHTML = '<span class="loading-text">No users online</span>';
      return;
    }
    userList.forEach(user => {
      onlineContainer.innerHTML += `<div class="student-pill">🟢 ${user}</div>`;
    });
  }
});

// 5. Drawer Toggle Function
function toggleChat() {
  const drawer = document.getElementById('chat-drawer');
  if (drawer) drawer.classList.toggle('open');
}
 
 // 6. Handle Send Function
function handleSend(event) {
  if (event) event.preventDefault();
  
  const input = document.getElementById('chat-input');
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  // Send message to Firebase RTDB
  chatDb.ref('group_chat').push({
    sender: chatUser,
    message: text,
    timestamp: firebase.database.ServerValue.TIMESTAMP
  });

  input.value = '';
}

// 7. Dynamic Real-Time Listener (Handles DOM safely)
function initChatListener() {
  chatDb.ref('group_chat').limitToLast(50).on('child_added', (snapshot) => {
    const data = snapshot.val();
    const container = document.getElementById('chat-messages');
    
    if (!data || !container) return;

    const msgText = data.message || data.text || '';
    if (!msgText) return;

    const isMe = data.sender === chatUser;
    const msgDiv = document.createElement('div');
    
    msgDiv.style.margin = "8px 0";
    msgDiv.style.padding = "8px 12px";
    msgDiv.style.borderRadius = "10px";
    msgDiv.style.maxWidth = "80%";
    msgDiv.style.wordBreak = "break-word";
    
    if (isMe) {
      msgDiv.style.background = "#6c5ce7";
      msgDiv.style.color = "#ffffff";
      msgDiv.style.marginLeft = "auto";
    } else {
      msgDiv.style.background = "#2d3436";
      msgDiv.style.color = "#ffffff";
      msgDiv.style.marginRight = "auto";
    }

    msgDiv.innerHTML = `
      <small style="font-size:0.75em; opacity:0.8; display:block; margin-bottom: 2px;">${data.sender || 'Anonymous'}</small>
      <div>${msgText}</div>
    `;

    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
  });
}

// Ensure DOM is ready before attaching Firebase listener
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChatListener);
} else {
  initChatListener();
}

