// App State
let state = {
  balance: 1.2500,
  earnings: 1.2500,
  pending: 0.0000,
  withdrawn: 0.0000,
  referrals: 3,
  refEarnings: 0.0450,
  jobs: [
    { id: 1, platform: 'telegram', type: 'Join', title: 'Join Official Crypto Channel', reward: 0.005, link: 'https://t.me/example' },
    { id: 2, platform: 'twitter', type: 'Follow', title: 'Follow X Profile & Retweet Pinned', reward: 0.008, link: 'https://twitter.com/example' },
    { id: 3, platform: 'instagram', type: 'Like', title: 'Like Latest Reel & Comment', reward: 0.006, link: 'https://instagram.com/p/example' },
    { id: 4, platform: 'facebook', type: 'Follow', title: 'Like & Follow Facebook Page', reward: 0.007, link: 'https://facebook.com/example' },
    { id: 5, platform: 'whatsapp', type: 'Join', title: 'Join WhatsApp Community Group', reward: 0.005, link: 'https://chat.whatsapp.com/example' }
  ],
  submissions: [
    { id: 101, jobId: 1, jobTitle: 'Join Official Crypto Channel', reward: 0.005, platform: 'telegram', taskLink: 'https://t.me/example', profile: '@cryptouser', screenshot: 'proof_telegram.png', status: 'pending', user: 'User_9821' }
  ],
  history: [
    { id: 201, title: 'Join Telegram AirDrop Channel', reward: 0.005, date: 'Today, 2:15 PM', status: 'Approved' }
  ]
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  renderJobs();
  renderHistory();
  renderAdminSubmissions();
  updateUIStats();
  
  // Set Referral Link
  const refInput = document.getElementById('ref-link-input');
  if (refInput) {
    refInput.value = `https://microjob.app/ref?id=usr_${Math.floor(Math.random() * 89999 + 10000)}`;
  }
});

// Navigation
function switchView(viewName, el) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  
  const target = document.getElementById(`view-${viewName}`);
  if (target) target.classList.add('active');
  if (el) el.classList.add('active');

  if (viewName === 'admin') {
    renderAdminSubmissions();
  }
}

// Filter Jobs
function filterJobs(platform, btn) {
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderJobs(platform);
}

// Render Jobs list with precise submission layout
function renderJobs(filter = 'all') {
  const container = document.getElementById('jobs-list');
  if (!container) return;

  const filtered = filter === 'all' ? state.jobs : state.jobs.filter(j => j.platform === filter);
  
  if (filtered.length === 0) {
    container.innerHTML = `<div class="card" style="text-align: center; color: var(--text-muted); padding: 24px;">No micro-jobs available for this platform right now.</div>`;
    return;
  }

  container.innerHTML = filtered.map(job => `
    <div class="card" style="display:flex; flex-direction:column; gap:12px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <span class="job-platform">${job.platform} • ${job.type}</span>
          <h3 class="job-title" style="margin-top:2px;">${job.title}</h3>
        </div>
        <span class="job-reward">+${job.reward.toFixed(4)} USDT</span>
      </div>

      <!-- Precise Task Proof Layout Box -->
      <div style="background:var(--bg-main); border:1px solid var(--border); border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:10px; margin-top:4px;">
        <div class="form-group" style="gap:4px;">
          <label class="form-label" style="font-size:12px;">Task Link (Admin)</label>
          <input type="text" class="form-control" readonly value="${job.link}" style="font-size:13px; padding:8px 12px; background:var(--bg-surface);">
        </div>

        <div class="form-group" style="gap:4px;">
          <label class="form-label" style="font-size:12px;">Profile Link / Username</label>
          <input type="text" id="profile-${job.id}" class="form-control" placeholder="e.g. @your_username or profile url" style="font-size:13px; padding:8px 12px;">
        </div>

        <div class="form-group" style="gap:4px;">
          <label class="form-label" style="font-size:12px;">Upload Proof Screenshot</label>
          <input type="file" id="file-${job.id}" class="form-control" accept="image/*" style="font-size:13px; padding:6px 12px;">
        </div>

        <button class="btn" style="padding:10px; font-size:14px; margin-top:4px;" onclick="submitTaskProof(${job.id})">Submit Proof</button>
      </div>
    </div>
  `).join('');
}

// Submit Task Proof
function submitTaskProof(jobId) {
  const job = state.jobs.find(j => j.id === jobId);
  const profileInput = document.getElementById(`profile-${jobId}`);
  const fileInput = document.getElementById(`file-${jobId}`);

  if (!profileInput || !profileInput.value.trim()) {
    alert('Please enter your Profile Link or Username!');
    profileInput.focus();
    return;
  }

  const profileVal = profileInput.value.trim();
  const fileName = fileInput && fileInput.files.length > 0 ? fileInput.files[0].name : 'screenshot_proof.png';

  // Add submission to state for admin review
  const newSub = {
    id: Date.now(),
    jobId: job.id,
    jobTitle: job.title,
    reward: job.reward,
    platform: job.platform,
    taskLink: job.link,
    profile: profileVal,
    screenshot: fileName,
    status: 'pending',
    user: 'User_' + Math.floor(Math.random() * 8999 + 1000)
  };

  state.submissions.unshift(newSub);
  state.pending += job.reward;
  
  updateUIStats();
  renderAdminSubmissions();

  // Reset inputs
  profileInput.value = '';
  if (fileInput) fileInput.value = '';

  alert('Task proof submitted successfully! Waiting for Admin approval.');
}

// Render Admin Submissions
function renderAdminSubmissions() {
  const list = document.getElementById('admin-submissions-list');
  const countBadge = document.getElementById('admin-pending-count');
  if (!list) return;

  const pendingSubs = state.submissions.filter(s => s.status === 'pending');
  if (countBadge) countBadge.innerText = pendingSubs.length;

  if (pendingSubs.length === 0) {
    list.innerHTML = `<div class="card" style="text-align: center; color: var(--text-muted); padding: 20px;">No pending task proofs to review.</div>`;
    return;
  }

  list.innerHTML = pendingSubs.map(sub => `
    <div class="card" style="border-left: 4px solid var(--accent); display:flex; flex-direction:column; gap:10px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <span class="job-platform">${sub.platform} • Reward: +${sub.reward.toFixed(4)} USDT</span>
          <h4 style="font-size:15px; font-weight:600; margin-top:2px;">${sub.jobTitle}</h4>
        </div>
        <span style="font-size:12px; background:var(--bg-main); padding:4px 8px; border-radius:6px; color:var(--text-muted);">${sub.user}</span>
      </div>

      <div style="font-size:13px; color:var(--text-muted); background:var(--bg-main); padding:8px 12px; border-radius:8px; display:flex; flex-direction:column; gap:4px;">
        <div><strong>Profile/Username:</strong> <span style="color:var(--text-main);">${sub.profile}</span></div>
        <div><strong>Screenshot File:</strong> <span style="color:var(--text-main);">${sub.screenshot}</span></div>
      </div>

      <div style="display:flex; gap:8px; margin-top:4px;">
        <button class="btn" style="background:var(--accent); padding:8px; font-size:14px;" onclick="adminApprove(${sub.id})">Approve & Pay</button>
        <button class="btn" style="background:var(--danger); color:#fff; padding:8px; font-size:14px;" onclick="adminReject(${sub.id})">Reject</button>
      </div>
    </div>
  `).join('');
}

// Admin Approve
function adminApprove(subId) {
  const sub = state.submissions.find(s => s.id === subId);
  if (!sub) return;

  sub.status = 'Approved';
  state.pending = Math.max(0, state.pending - sub.reward);
  state.balance += sub.reward;
  state.earnings += sub.reward;

  // Add to history
  state.history.unshift({
    id: Date.now(),
    title: sub.jobTitle,
    reward: sub.reward,
    date: 'Just now',
    status: 'Approved'
  });

  updateUIStats();
  renderAdminSubmissions();
  renderHistory();
  alert(`Task approved! +${sub.reward.toFixed(4)} USDT credited to user wallet.`);
}

// Admin Reject
function adminReject(subId) {
  const sub = state.submissions.find(s => s.id === subId);
  if (!sub) return;

  sub.status = 'Rejected';
  state.pending = Math.max(0, state.pending - sub.reward);

  state.history.unshift({
    id: Date.now(),
    title: sub.jobTitle,
    reward: sub.reward,
    date: 'Just now',
    status: 'Rejected'
  });

  updateUIStats();
  renderAdminSubmissions();
  renderHistory();
  alert('Task proof rejected.');
}

// Post New Job
function postNewJob() {
  const platform = document.getElementById('post-platform').value;
  const type = document.getElementById('post-type').value;
  const title = document.getElementById('post-title').value.trim();
  const reward = parseFloat(document.getElementById('post-reward').value);
  const link = document.getElementById('post-link').value.trim();

  if (!title || isNaN(reward) || reward <= 0 || !link) {
    alert('Please fill in all job posting details correctly.');
    return;
  }

  const newJob = {
    id: Date.now(),
    platform,
    type,
    title,
    reward,
    link
  };

  state.jobs.unshift(newJob);
  renderJobs();

  // Reset form
  document.getElementById('post-title').value = '';
  document.getElementById('post-reward').value = '';
  document.getElementById('post-link').value = '';

  alert('Microjob successfully published!');
  switchView('tasks', document.querySelector('.nav-item'));
}

// Render History
function renderHistory() {
  const list = document.getElementById('history-list');
  if (!list) return;

  if (state.history.length === 0) {
    list.innerHTML = `<div class="card" style="text-align: center; color: var(--text-muted); padding: 24px;">No history yet.</div>`;
    return;
  }

  list.innerHTML = state.history.map(item => `
    <div class="card" style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px;">
      <div>
        <h4 style="font-size:14px; font-weight:600; margin-bottom:2px;">${item.title}</h4>
        <p class="text-muted" style="font-size:12px;">${item.date}</p>
      </div>
      <div style="text-align:right;">
        <div style="font-size:14px; font-weight:700; color:var(--accent);">+${item.reward.toFixed(4)} USDT</div>
        <span style="font-size:11px; font-weight:600; color:${item.status === 'Approved' ? 'var(--accent)' : 'var(--danger)'};">${item.status}</span>
      </div>
    </div>
  `).join('');
}

// Update Wallet & Stats UI
function updateUIStats() {
  const balEl = document.getElementById('wallet-balance');
  const mainBalEl = document.getElementById('main-balance');
  const pendingEl = document.getElementById('wallet-pending');
  const earningsEl = document.getElementById('wallet-earnings');
  const withdrawnEl = document.getElementById('wallet-withdrawn');
  const refCountEl = document.getElementById('ref-count');
  const refEarningsEl = document.getElementById('ref-earnings');

  if (balEl) balEl.innerText = `${state.balance.toFixed(4)} USDT`;
  if (mainBalEl) mainBalEl.innerText = `${state.balance.toFixed(4)} USDT`;
  if (pendingEl) pendingEl.innerText = `${state.pending.toFixed(4)} USDT`;
  if (earningsEl) earningsEl.innerText = `${state.earnings.toFixed(4)} USDT`;
  if (withdrawnEl) withdrawnEl.innerText = `${state.withdrawn.toFixed(4)} USDT`;
  if (refCountEl) refCountEl.innerText = state.referrals;
  if (refEarningsEl) refEarningsEl.innerText = `${state.refEarnings.toFixed(4)} USDT`;
}

// Copy Referral Link
function copyReferralLink() {
  const input = document.getElementById('ref-link-input');
  if (!input) return;
  input.select();
  document.execCommand('copy');
  alert('Referral link copied to clipboard!');
}

// Simulate Referral Activity
function simulateReferralActivity() {
  state.referrals += 1;
  const bonus = 0.0150;
  state.refEarnings += bonus;
  state.balance += bonus;
  state.earnings += bonus;
  
  updateUIStats();
  alert(`New referral joined! +${bonus.toFixed(4)} USDT commission added live to your wallet.`);
}

// Withdraw Modal logic
function openWithdrawModal() {
  const modal = document.getElementById('withdraw-modal');
  if (modal) modal.classList.add('active');
}

function closeWithdrawModal() {
  const modal = document.getElementById('withdraw-modal');
  if (modal) modal.classList.remove('active');
}

function submitWithdrawal() {
  const amount = parseFloat(document.getElementById('withdraw-amount').value);
  const address = document.getElementById('withdraw-address').value.trim();

  if (isNaN(amount) || amount < 1.0) {
    alert('Minimum withdrawal is 1.0000 USDT.');
    return;
  }

  if (amount > state.balance) {
    alert('Insufficient balance in wallet.');
    return;
  }

  if (!address) {
    alert('Please enter your TRC20 / BEP20 USDT address.');
    return;
  }

  state.balance -= amount;
  state.withdrawn += amount;
  updateUIStats();
  closeWithdrawModal();
  alert(`Withdrawal request of ${amount.toFixed(4)} USDT submitted successfully!`);
}
