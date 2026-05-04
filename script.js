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

function scrollBottom(el) {
    if (el) el.scrollTop = el.scrollHeight;
}

// ────────────────────────────────────────
// QUEUE PAGE
// ────────────────────────────────────────
function initQueuePage() {
    const bar      = document.getElementById('progressBar');
    const pct      = document.getElementById('progressPercent');
    const status   = document.getElementById('progressStatus');
    const step1    = document.getElementById('step1');
    const step2    = document.getElementById('step2');
    const step3    = document.getElementById('step3');
    const ahead    = document.getElementById('peopleAhead');
    const wait     = document.getElementById('waitTime');

    if (!bar) return;

    let progress = 0;
    const TOTAL_MS = 6500;
    const TICK_MS  = 50;
    const INC      = 100 / (TOTAL_MS / TICK_MS);

    const timer = setInterval(() => {
        progress = Math.min(progress + INC, 100);
        bar.style.width = progress + '%';
        pct.textContent  = Math.round(progress) + '%';

        if (progress >= 18 && ahead.textContent === '3') {
            ahead.textContent = '2';
            wait.textContent  = '~1 min';
        }
        if (progress >= 45 && step1 && !step1.classList.contains('completed')) {
            step1.classList.remove('active');
            step1.classList.add('completed');
            step1.querySelector('.step-dot').style.background = 'var(--success)';
            step2.classList.add('active');
            ahead.textContent  = '1';
            wait.textContent   = '~30 sec';
            status.textContent = 'Matching skills to your request...';
        }
        if (progress >= 78 && step2 && !step2.classList.contains('completed')) {
            step2.classList.remove('active');
            step2.classList.add('completed');
            step2.querySelector('.step-dot').style.background = 'var(--success)';
            step3.classList.add('active');
            ahead.textContent  = '0';
            wait.textContent   = 'Now!';
            status.textContent = 'Connecting you to Sarah...';
        }
        if (progress >= 100) {
            clearInterval(timer);
            status.textContent = 'Connected! ✓';
            setTimeout(() => { window.location.href = 'chat.html'; }, 700);
        }
    }, TICK_MS);
}

// ────────────────────────────────────────
// CHAT PAGE
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

function vaReply() {
    return VA_REPLIES[Math.floor(Math.random() * VA_REPLIES.length)];
}

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
                ${[8,14,10,18,12,16,8].map(h =>
                  `<div style="width:3px;height:${h}px;background:var(--accent);border-radius:2px;"></div>`
                ).join('')}
              </div>
              <span style="font-size:12px;color:var(--gray-400);">0:07</span>
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
    scrollBottom(area);
}

function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function showTyping() {
    const ind    = document.getElementById('typingIndicator');
    const status = document.getElementById('vaStatus');
    if (ind) { ind.style.display = 'flex'; scrollBottom(document.getElementById('messagesArea')); }
    if (status) status.innerHTML = '<span class="typing-text-status" style="font-style:italic;font-size:12px;color:var(--gray-500);">Sarah is typing...</span>';
}

function hideTyping() {
    const ind    = document.getElementById('typingIndicator');
    const status = document.getElementById('vaStatus');
    if (ind) ind.style.display = 'none';
    if (status) status.innerHTML = '<span class="online-dot small"></span> Online &middot; Responds instantly';
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    appendMessage(text, 'user');
    input.value = '';

    setTimeout(() => {
        showTyping();
        const delay = 1100 + Math.random() * 1200;
        setTimeout(() => {
            hideTyping();
            appendMessage(vaReply(), 'va');
        }, delay);
    }, 300);
}

function sendQuickReply(text) {
    const input = document.getElementById('messageInput');
    if (input) input.value = text;
    sendMessage();
}

function handleKeyPress(e) { if (e.key === 'Enter') sendMessage(); }

function toggleRecording() {
    const btn  = document.getElementById('micBtn');
    const ind  = document.getElementById('recordingIndicator');
    const inp  = document.getElementById('messageInput');

    isRecording = !isRecording;
    if (isRecording) {
        btn.classList.add('recording');
        if (ind)  ind.style.display  = 'block';
        if (inp)  inp.style.opacity  = '0';
        setTimeout(stopRecording, 3000);
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
          <span>🎙️</span><span>Voice note &middot; 0:03</span>
        </div>
        <span class="msg-time">${getTime()}</span>
      </div>`;
    area.appendChild(wrap);
    scrollBottom(area);

    setTimeout(() => {
        showTyping();
        setTimeout(() => { hideTyping(); appendMessage('Got your voice note! Let me respond to that.', 'va'); }, 1400);
    }, 500);
}

// Session timer
function startSessionTimer() {
    const el = document.getElementById('sessionTimer');
    if (!el) return;
    let s = 0;
    setInterval(() => {
        s++;
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        el.textContent = `${m}:${sec}`;
    }, 1000);
}

function setChatDate() {
    const el = document.getElementById('chatDate');
    if (!el) return;
    el.textContent = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ────────────────────────────────────────
// DASHBOARD PAGE
// ────────────────────────────────────────
const CLIENT_DATA = {
    'James O.':   { full: 'James Okonkwo',    email: 'james.o@email.com',    status: 'Active Client', joined: 'March 2025',   letter: 'J', color: 'green' },
    'Amaka F.':   { full: 'Amaka Famuyide',   email: 'amaka.f@email.com',    status: 'Active Client', joined: 'Jan 2025',     letter: 'A', color: 'green' },
    'Emeka T.':   { full: 'Emeka Tunde',      email: 'emeka.t@email.com',    status: 'Active Client', joined: 'Feb 2025',     letter: 'E', color: 'blue'  },
    'Chidera N.': { full: 'Chidera Nwosu',    email: 'chidera.n@email.com',  status: 'Active Client', joined: 'Apr 2025',     letter: 'C', color: 'purple'},
    'Nkechi B.':  { full: 'Nkechi Balogun',   email: 'nkechi.b@email.com',   status: 'Active Client', joined: 'Dec 2024',     letter: 'N', color: 'orange'},
    'Tunde A.':   { full: 'Tunde Adeyemi',    email: 'tunde.a@email.com',    status: 'New Client',    joined: '—',            letter: 'T', color: 'gray'  },
    'Blessing C.':{ full: 'Blessing Chisom',  email: 'blessing.c@email.com', status: 'New Client',    joined: '—',            letter: 'B', color: 'gray'  },
    'Rotimi P.':  { full: 'Rotimi Peters',    email: 'rotimi.p@email.com',   status: 'New Client',    joined: '—',            letter: 'R', color: 'gray'  },
};

function selectChat(el, name) {
    document.querySelectorAll('.chat-list-item').forEach(i => i.classList.remove('selected'));
    el.classList.add('selected');

    const data = CLIENT_DATA[name] || {};
    const nameEl   = document.getElementById('selectedChatName');
    const panelN   = document.getElementById('panelName');
    const panelE   = document.getElementById('panelEmail');
    const panelS   = document.getElementById('panelStatus');
    const panelJ   = document.getElementById('panelJoined');
    const avatar   = document.getElementById('dashAvatarLetter');
    const dashInp  = document.getElementById('dashInput');

    if (nameEl)  nameEl.textContent   = name;
    if (panelN)  panelN.textContent   = data.full    || name;
    if (panelE)  panelE.textContent   = data.email   || '—';
    if (panelS)  panelS.textContent   = data.status  || '—';
    if (panelJ)  panelJ.textContent   = data.joined  || '—';
    if (dashInp) dashInp.placeholder  = `Reply to ${name.split(' ')[0]}...`;

    if (avatar) {
        avatar.textContent  = data.letter || name[0];
        avatar.className    = `chat-item-avatar ${data.color || 'gray'} large`;
    }

    // Remove unread badge from clicked item
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
    scrollBottom(area);
}

function handleDashKeyPress(e) { if (e.key === 'Enter') sendDashMessage(); }

// ────────────────────────────────────────
// INIT
// ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initQueuePage();
    startSessionTimer();
    setChatDate();

    const chatMsgs  = document.getElementById('messagesArea');
    const dashMsgs  = document.getElementById('dashboardMessages');
    scrollBottom(chatMsgs);
    scrollBottom(dashMsgs);

    // Auto greeting on chat page after a short delay
    if (chatMsgs) {
        setTimeout(() => {
            showTyping();
            setTimeout(() => {
                hideTyping();
                appendMessage("Just to let you know — I'm here and ready to help with anything you need. Feel free to use the quick reply buttons below or type your message! 😊", 'va');
            }, 1800);
        }, 2000);
    }
});
