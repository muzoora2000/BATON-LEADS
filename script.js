/* ========================================
   BATON LEADS COMPANY — script.js
   ======================================== */

// ────────────────────────────────────────
// UTILS
// ────────────────────────────────────────
function getTime() {
    const d = new Date();
    let h = d.getHours(), m = d.getMinutes();
    const ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m < 10 ? '0' + m : m} ${ap}`;
}

function escHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function smoothScroll(el) {
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
}

// ────────────────────────────────────────
// QUEUE PAGE
// ────────────────────────────────────────
function initQueuePage() {
    const bar    = document.getElementById('progressBar');
    const pct    = document.getElementById('progressPercent');
    const status = document.getElementById('progressStatus');
    const step1  = document.getElementById('step1');
    const step2  = document.getElementById('step2');
    const step3  = document.getElementById('step3');
    const dot1   = document.getElementById('dot1');
    const dot2   = document.getElementById('dot2');
    const dot3   = document.getElementById('dot3');
    const ahead  = document.getElementById('peopleAhead');
    const wait   = document.getElementById('waitTime');

    if (!bar) return;

    let progress = 0;
    const TOTAL_MS = 7000;
    const TICK_MS  = 40;
    const INC      = 100 / (TOTAL_MS / TICK_MS);

    const tick = setInterval(() => {
        progress = Math.min(progress + INC, 100);
        bar.style.width    = progress + '%';
        pct.textContent    = Math.round(progress) + '%';

        // Phase 1: 0–15% — queue count drops to 2
        if (progress >= 15 && ahead.textContent === '3') {
            ahead.textContent = '2';
            wait.textContent  = '~1 min';
            numberPop(ahead);
        }

        // Phase 2: 40% — complete step 1, start step 2
        if (progress >= 40 && !step1.classList.contains('completed')) {
            completeStep(step1, dot1);
            activateStep(step2, dot2);
            ahead.textContent  = '1';
            wait.textContent   = '~30 sec';
            status.textContent = 'Matching skills to your request...';
            numberPop(ahead);
        }

        // Phase 3: 75% — complete step 2, start step 3
        if (progress >= 75 && step2.classList.contains('active') && !step2.classList.contains('completed')) {
            completeStep(step2, dot2);
            activateStep(step3, dot3);
            ahead.textContent  = '0';
            wait.textContent   = 'Now!';
            status.textContent = 'Connecting you to Sarah...';
            numberPop(ahead);
        }

        // Phase 4: 100% — complete all, redirect
        if (progress >= 100) {
            clearInterval(tick);
            completeStep(step3, dot3);
            bar.style.transition = 'none';
            status.textContent   = 'Connected! ✓';
            pct.textContent      = '100%';
            setTimeout(() => { window.location.href = 'chat.html'; }, 900);
        }
    }, TICK_MS);
}

function completeStep(stepEl, dotEl) {
    stepEl.classList.remove('active');
    stepEl.classList.add('completed');
    if (dotEl) dotEl.textContent = '✓';
}

function activateStep(stepEl, dotEl) {
    stepEl.classList.add('active');
    if (dotEl) dotEl.textContent = '';
}

function numberPop(el) {
    el.style.transform = 'scale(1.3)';
    setTimeout(() => { el.style.transform = 'scale(1)'; }, 300);
}

// ────────────────────────────────────────
// CHAT PAGE — REPLIES
// ────────────────────────────────────────
let isRecording = false;

const VA_REPLIES = [
    "Of course! I'd be happy to help with that. Could you give me a bit more detail?",
    "Great question! Let me look into that for you right away. 🔍",
    "Understood — I'm processing your request now. It'll just take a moment!",
    "Absolutely! I've noted that and will action it immediately. ✅",
    "Thank you for reaching out. I'm here to make sure this gets resolved for you.",
    "Got it! I'll take care of this right now. Anything else you'd like me to know?",
    "I can definitely help with that. Let me pull up your details on my end.",
    "No problem at all! I'm on it — you'll hear back from me very shortly. 💪",
    "I'll escalate that to the right team and follow up with you shortly.",
    "Your referral has been sent successfully! The recipient will receive it within 24 hours. 🎉",
    "I've updated your account details. Is there anything else I can assist you with today?",
    "That's been arranged! You'll receive a confirmation shortly. Let me know if you need anything else.",
];

const QUICK_REPLY_MAP = {
    'tell me more':            "Sure! Baton Leads connects businesses with qualified referrals. We handle the outreach, matching, and follow-up so you can focus on closing. What specifically would you like to know more about?",
    'send referral':           "Your referral has been sent successfully! ✅ The recipient will receive a notification within the next few minutes. Is there anything else I can help you with?",
    'call me':                 "I've logged a callback request for you! 📞 A team member will call you within the next 15–30 minutes. Please ensure your phone is available.",
    "what are your services?": "We offer: 1️⃣ B2B Referral Management, 2️⃣ Lead Qualification, 3️⃣ Client Onboarding Support, and 4️⃣ 24/7 Virtual Assistant access. Which service would you like to know more about?",
    "i need urgent help":      "I understand this is urgent — I'm prioritising your request right now! 🚨 Please describe the issue and I'll get it resolved as quickly as possible.",
};

function vaReply(userText) {
    const key = (userText || '').toLowerCase().trim();
    if (QUICK_REPLY_MAP[key]) return QUICK_REPLY_MAP[key];
    return VA_REPLIES[Math.floor(Math.random() * VA_REPLIES.length)];
}

// ────────────────────────────────────────
// CHAT PAGE — MESSAGE RENDERING
// ────────────────────────────────────────
function appendMessage(text, sender, extra) {
    const area = document.getElementById('messagesArea');
    if (!area) return;

    const wrap = document.createElement('div');
    wrap.className = `message ${sender === 'user' ? 'user-message' : 'va-message'}`;

    if (sender === 'user') {
        wrap.innerHTML = `
            <div class="msg-content">
                <div class="bubble user-bubble">${escHtml(text)}</div>
                <span class="msg-time">${getTime()}</span>
            </div>`;
    } else if (extra === 'voice') {
        wrap.innerHTML = `
            <div class="msg-avatar">S</div>
            <div class="msg-content">
                <div class="bubble va-bubble" style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:18px;">🎙️</span>
                    <div style="display:flex;align-items:center;gap:3px;">
                        ${[6,12,8,16,10,14,6,10].map(h =>
                            `<div style="width:3px;height:${h}px;background:var(--accent);border-radius:2px;opacity:0.8;"></div>`
                        ).join('')}
                    </div>
                    <span style="font-size:12px;color:var(--gray-400);white-space:nowrap;">0:07</span>
                </div>
                <span class="msg-time">${getTime()}</span>
            </div>`;
    } else {
        wrap.innerHTML = `
            <div class="msg-avatar">S</div>
            <div class="msg-content">
                <div class="bubble va-bubble">${escHtml(text)}</div>
                <span class="msg-time">${getTime()}</span>
            </div>`;
    }

    area.appendChild(wrap);
    smoothScroll(area);
}

// ────────────────────────────────────────
// TYPING INDICATOR
// ────────────────────────────────────────
function showTyping() {
    const ind    = document.getElementById('typingIndicator');
    const status = document.getElementById('vaStatus');
    if (ind) {
        ind.style.display = 'flex';
        smoothScroll(document.getElementById('messagesArea'));
    }
    if (status) {
        status.innerHTML = '<em style="font-size:12px;color:var(--accent);">Sarah is typing...</em>';
    }
}

function hideTyping() {
    const ind    = document.getElementById('typingIndicator');
    const status = document.getElementById('vaStatus');
    if (ind) ind.style.display = 'none';
    if (status) {
        status.innerHTML = '<span class="online-dot small"></span> Online &middot; Responds instantly';
    }
}

// ────────────────────────────────────────
// SEND MESSAGE
// ────────────────────────────────────────
function sendMessage() {
    const input = document.getElementById('messageInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    appendMessage(text, 'user');
    input.value = '';
    input.focus();

    // Simulate VA typing then reply
    const typingDelay = 400 + Math.random() * 300;
    const replyDelay  = 1200 + Math.random() * 1400;

    setTimeout(() => {
        showTyping();
        setTimeout(() => {
            hideTyping();
            appendMessage(vaReply(text), 'va');
        }, replyDelay);
    }, typingDelay);
}

function sendQuickReply(text) {
    const input = document.getElementById('messageInput');
    if (input) { input.value = text; }
    sendMessage();
}

function handleKeyPress(e) {
    if (e.key === 'Enter') sendMessage();
}

// ────────────────────────────────────────
// VOICE RECORDING
// ────────────────────────────────────────
function toggleRecording() {
    isRecording = !isRecording;
    const btn = document.getElementById('micBtn');
    const ind = document.getElementById('recordingIndicator');
    const inp = document.getElementById('messageInput');

    if (isRecording) {
        if (btn) btn.classList.add('recording');
        if (ind) ind.style.display = 'inline';
        if (inp) inp.style.opacity = '0';
        setTimeout(stopRecording, 3500);
    } else {
        stopRecording();
    }
}

function stopRecording() {
    const btn = document.getElementById('micBtn');
    const ind = document.getElementById('recordingIndicator');
    const inp = document.getElementById('messageInput');
    isRecording = false;
    if (btn) btn.classList.remove('recording');
    if (ind) ind.style.display = 'none';
    if (inp) inp.style.opacity = '1';

    const area = document.getElementById('messagesArea');
    if (!area) return;

    const wrap = document.createElement('div');
    wrap.className = 'message user-message';
    wrap.innerHTML = `
        <div class="msg-content">
            <div class="bubble user-bubble" style="display:flex;align-items:center;gap:8px;">
                <span>🎙️</span>
                <span style="font-size:13px;">Voice note &middot; 0:03</span>
            </div>
            <span class="msg-time">${getTime()}</span>
        </div>`;
    area.appendChild(wrap);
    smoothScroll(area);

    setTimeout(() => {
        showTyping();
        setTimeout(() => {
            hideTyping();
            appendMessage('Got your voice note! Let me respond to that.', 'va');
        }, 1600);
    }, 500);
}

// ────────────────────────────────────────
// SESSION TIMER
// ────────────────────────────────────────
function startSessionTimer() {
    const el = document.getElementById('sessionTimer');
    if (!el) return;
    let s = 0;
    setInterval(() => {
        s++;
        const m   = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        el.textContent = `${m}:${sec}`;
    }, 1000);
}

function setChatDate() {
    const el = document.getElementById('chatDate');
    if (!el) return;
    el.textContent = new Date().toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });
}

// ────────────────────────────────────────
// DASHBOARD PAGE
// ────────────────────────────────────────
const CLIENT_DATA = {
    'James O.':    { full: 'James Okonkwo',   email: 'james.o@email.com',    status: 'Active Client', joined: 'March 2025',  letter: 'J', color: 'green'  },
    'Amaka F.':    { full: 'Amaka Famuyide',  email: 'amaka.f@email.com',    status: 'Active Client', joined: 'Jan 2025',    letter: 'A', color: 'green'  },
    'Emeka T.':    { full: 'Emeka Tunde',     email: 'emeka.t@email.com',    status: 'Active Client', joined: 'Feb 2025',    letter: 'E', color: 'blue'   },
    'Chidera N.':  { full: 'Chidera Nwosu',   email: 'chidera.n@email.com',  status: 'Active Client', joined: 'Apr 2025',    letter: 'C', color: 'purple' },
    'Nkechi B.':   { full: 'Nkechi Balogun',  email: 'nkechi.b@email.com',   status: 'Active Client', joined: 'Dec 2024',    letter: 'N', color: 'orange' },
    'Tunde A.':    { full: 'Tunde Adeyemi',   email: 'tunde.a@email.com',    status: 'New Client',    joined: '—',           letter: 'T', color: 'gray'   },
    'Blessing C.': { full: 'Blessing Chisom', email: 'blessing.c@email.com', status: 'New Client',    joined: '—',           letter: 'B', color: 'gray'   },
    'Rotimi P.':   { full: 'Rotimi Peters',   email: 'rotimi.p@email.com',   status: 'New Client',    joined: '—',           letter: 'R', color: 'gray'   },
};

function selectChat(el, name) {
    document.querySelectorAll('.chat-list-item').forEach(i => i.classList.remove('selected'));
    el.classList.add('selected');

    const data = CLIENT_DATA[name] || {};
    const set  = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };

    set('selectedChatName', name);
    set('panelName',        data.full   || name);
    set('panelEmail',       data.email  || '—');
    set('panelStatus',      data.status || '—');
    set('panelJoined',      data.joined || '—');

    const avatar = document.getElementById('dashAvatarLetter');
    if (avatar) {
        avatar.textContent = data.letter || name[0];
        avatar.className   = `chat-item-avatar ${data.color || 'gray'} large`;
    }

    const inp = document.getElementById('dashInput');
    if (inp) inp.placeholder = `Reply to ${name.split(' ')[0]}...`;

    const badge = el.querySelector('.unread-badge');
    if (badge) badge.remove();
}

function switchTab(btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function useTemplate(text) {
    const inp = document.getElementById('dashInput');
    if (inp) { inp.value = text; inp.focus(); }
}

function sendDashMessage() {
    const inp = document.getElementById('dashInput');
    if (!inp || !inp.value.trim()) return;
    const text = inp.value.trim();
    inp.value = '';

    const area = document.getElementById('dashboardMessages');
    if (!area) return;

    const wrap = document.createElement('div');
    wrap.className = 'message va-message';
    wrap.innerHTML = `
        <div class="msg-avatar">S</div>
        <div class="msg-content">
            <div class="bubble va-bubble">${escHtml(text)}</div>
            <span class="msg-time">${getTime()}</span>
        </div>`;
    area.appendChild(wrap);
    smoothScroll(area);
}

function handleDashKeyPress(e) { if (e.key === 'Enter') sendDashMessage(); }

// ────────────────────────────────────────
// INIT
// ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initQueuePage();
    startSessionTimer();
    setChatDate();

    const chatMsgs = document.getElementById('messagesArea');
    const dashMsgs = document.getElementById('dashboardMessages');
    smoothScroll(chatMsgs);
    smoothScroll(dashMsgs);

    // Friendly follow-up message on chat page after a short delay
    if (chatMsgs) {
        setTimeout(() => {
            showTyping();
            setTimeout(() => {
                hideTyping();
                appendMessage(
                    "Just to let you know — I'm here and ready to help with anything you need. " +
                    "Feel free to use the quick reply buttons below or just type your message! 😊",
                    'va'
                );
            }, 2000);
        }, 2500);
    }
});
