let userProfile = { 
    name: "Demo User", 
    email: "demo@wastemanagement.com",
    photo: "" 
};
let lastAlertStatus = "";


function sendEmailAlert(bin) {

    emailjs.send(
        "service_9hskc3m",
        "template_j0vqz3u",
        {
            bin_id: bin.id,
            location: bin.loc,
            status: bin.isFaulty ? "Faulty" : bin.status,
            message: `${bin.id} at ${bin.loc} requires immediate attention.`
        }
    )
    .then(() => {
        console.log("Email sent!");
    })
    .catch((error) => {
        console.log(error);
    });
}

let myBins = [];
  /*  { id: 'BIN-101', type: 'General Waste', loc: 'Main Lobby', status: 'Normal', isFaulty: false, emergencyDate: null, emergencyMonth: null, faultDesc: "" },
    { id: 'BIN-104', type: 'Recycling', loc: 'Level 1 Hall', status: 'Normal', isFaulty: false, emergencyDate: null, emergencyMonth: null, faultDesc: "" },
    { id: 'BIN-105', type: 'General Waste', loc: 'Office A', status: 'Normal', isFaulty: false, emergencyDate: null, emergencyMonth: null, faultDesc: "" },*/

let currentViewDate = new Date();
let activeResolveId = null; 

const pages = {
    login: `
        <div class="auth-wrapper" style="background: url('bg2login.jpg') no-repeat center center; background-size: cover;">
            <div class="auth-card">
                <h1>Login</h1>
               <input type="text" id="login-email" placeholder="Email" class="form-input">
<input type="password" id="login-pass" placeholder="Password" class="form-input">
                <button class="btn-main btn-primary-green" style="width:100%" onclick="handleLogin()">Sign In</button>
                <p style="text-align:center; margin-top:15px;">New? <a href="#" onclick="showPage('register')">Register</a></p>
            </div>
        </div>`,

    register: `
        <div class="auth-wrapper" style="background: url('bg2login.jpg') no-repeat center center; background-size: cover;">
            <div class="auth-card">
                <h1>Create Account</h1>
                <input type="text" id="reg-name" placeholder="Full Name" class="form-input">
                <input type="email" id="reg-email" placeholder="Email Address" class="form-input">
                <input type="password" id="reg-pass" placeholder="Password" class="form-input">
                <button class="btn-main btn-primary-green" style="width:100%" onclick="handleRegistration()">Complete Registration</button>
                <p style="text-align:center; margin-top:15px;"><a href="#" onclick="showPage('login')">Back to Login</a></p>
            </div>
        </div>`,

    dashboard: `
        <div class="app-container">
            <h1 style="text-align:center;">Dashboard</h1>
            <div class="card">
    <h2>Live Firebase Data</h2>
    <p>Bin ID: <span id="binId"></span></p>
    <p>Distance: <span id="distance"></span></p>
    <p>Status: <span id="status"></span></p>
    <p>Location: <span id="location"></span></p>
</div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin: 25px 0;">
                <div class="status-badge status-green" id="d-total"></div>
                <div class="status-badge status-yellow" id="d-warn"></div>
                <div class="status-badge status-red" id="d-crit"></div>
                <div class="status-badge" style="background:#4b5563; color:white;" id="d-faulty"></div>
            </div>
            <button class="btn-main" style="background:#ef4444; width:100%;" onclick="showPage('reportIssue')">Report Bin Fault</button>
        </div>`,

    reportIssue: `
        <div class="app-container">
            <h1>Report Fault</h1>
            <div class="card">
                <label>Select Bin</label>
                <select id="fault-bin-select" class="form-input"></select>
                <label>Fault Detail</label>
                <textarea id="fault-desc" class="form-input" rows="3" placeholder="Describe the problem..."></textarea>
                <button class="btn-main" style="background:#ef4444; width:100%" onclick="submitFault()">Report Faulty</button>
            </div>
        </div>`,

    alert: `
<div class="app-container">

    <h1>Alerts & Scheduling</h1>

    <div class="card" style="padding:0;">

        <table style="width:100%; border-collapse:collapse; font-size:13px;">

            <thead style="background:#f9fafb;">
                <tr style="text-align:left;">

                    <th style="padding:12px;">ID</th>
                    <th>Loc</th>
                    <th>Status</th>
                    <th>Action</th>

                </tr>
            </thead>

            <tbody id="alert-table-body"></tbody>

        </table>

    </div>

</div>
`,
    schedule: `
        <div class="app-container">
            <h1>Service Calendar</h1>
            <p id="resolve-hint" style="color:red; display:none; font-weight:bold; margin-bottom:10px;">Select a date to schedule FIX/PICKUP:</p>
            <div class="card" style="display:flex; justify-content:space-between; align-items:center;">
                <button onclick="changeMonth(-1)"><</button><b id="month-header"></b><button onclick="changeMonth(1)">></button>
            </div>
            <div class="calendar-grid" id="calendar-grid"></div>
        </div>`,

    bin: `
        <div class="app-container">
            <h1>Bin Registry</h1>
            <button class="btn-main btn-primary-green" style="width:100%;" onclick="showPage('addBin')">+ Add New Bin</button>
            <div id="bin-list-container" style="margin-top:20px;"></div>
        </div>`,

    addBin: `
        <div class="app-container">
            <h1>New Bin</h1>
            <div class="card">
            <label>Bin ID</label>
<input type="text" id="n-id" class="form-input" placeholder="BIN-102">

                <label>Waste Category</label>
                <select id="n-type" class="form-input">
                    <option value="General Waste">General Waste</option>
                    <option value="Recycling">Recycling</option>
                </select>
                <label>Location</label>
                <input type="text" id="n-loc" class="form-input">
                <button class="btn-main btn-primary-green" style="width:100%" onclick="saveBin()">Save Bin</button>
            </div>
        </div>`,

    insights: `<div class="app-container"><h1>Analytics</h1><div class="card"><h3>Total Bins: <span id="ins-total"></span></h3></div><button class="btn-main btn-primary-green" style="width:100%; margin-top:20px;" onclick="generatePDFReport()">Download Audit PDF</button></div>`,

    profile: `
        <div class="app-container" style="text-align:center;">
            <h1>Profile</h1>
            <div class="card">
                <div style="width: 100px; height: 100px; border-radius: 50%; background: #eee; margin: 0 auto 15px; border: 3px solid #00925d; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                    <span style="font-size:40px;">👤</span>
                </div>
                <h2 id="prof-name"></h2>
                <p id="prof-email" style="color:#666;"></p>
                <button class="btn-main" style="background:none; border:1px solid red; color:red; width:100%; margin-top:20px;" onclick="showPage('login')">Logout</button>
            </div>
        </div>`
};

function showPage(pageId) {
    const view = document.getElementById('app-viewport');

    document.getElementById('navbar').style.display =
        (pageId === 'login' || pageId === 'register') ? 'none' : 'flex';

    view.innerHTML = pages[pageId];

    if (pageId === 'dashboard') {
        updateDash();

    
    }

    if (pageId === 'bin') renderBins();
    if (pageId === 'schedule') renderCalendar();
    if (pageId === 'alert') renderAlerts('Critical');
    if (pageId === 'reportIssue') populateFaultSelect();
    if (pageId === 'insights') document.getElementById('ins-total').innerText = myBins.length;

    if (pageId === 'profile') {
        document.getElementById('prof-name').innerText = userProfile.name;
        document.getElementById('prof-email').innerText = userProfile.email;
    }
}

function handleRegistration() {
    if (window.registerUserToFirebase) {
        window.registerUserToFirebase();
    } else {
        alert("Firebase is not ready yet.");
    }
}

function handleLogin() {
    if (window.loginUserFromFirebase) {
        window.loginUserFromFirebase();
    } else {
        alert("Firebase is not ready yet.");
    }
}


function updateDash() {
    document.getElementById('d-total').innerText =
        `${myBins.filter(b => b.status === 'Normal').length} Normal`;

    document.getElementById('d-warn').innerText =
        `${myBins.filter(b => b.status === 'Warning').length} Warning`;

    document.getElementById('d-crit').innerText =
        `${myBins.filter(b => b.status === 'Critical').length} Critical`;

    document.getElementById('d-faulty').innerText =
        `${myBins.filter(b => b.isFaulty).length} Faulty`;
}

function submitFault() {

    const binId =
        document.getElementById('fault-bin-select').value;

    const faultDesc =
        document.getElementById('fault-desc').value;

    const bin =
        myBins.find(b => b.id === binId);

    if (bin) {

        // LOCAL UPDATE
        bin.isFaulty = true;
        bin.status = "Faulty";
        bin.faultDesc = faultDesc;

        // SEND TO FIREBASE
        if (window.firebaseDB) {

            window.firebaseDB
                .ref("smartbin")
                .update({

                    binId: bin.id,
                    location: bin.loc,
                    status: "Faulty",
                    isFaulty: true,
                    faultDetail: faultDesc

                });
        }

        alert("⚠️ Fault report submitted successfully!");

        // REFRESH UI
        renderBins();
        renderAlerts();

        showPage('alert');
    }
}

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const head = document.getElementById('month-header');
    if (!grid) return;
    grid.innerHTML = '';
    ['S','M','T','W','T','F','S'].forEach(d => { const h = document.createElement('div'); h.style.fontWeight='bold'; h.innerText=d; grid.appendChild(h); });

    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    head.innerText = currentViewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    for (let i = 1; i <= new Date(year, month + 1, 0).getDate(); i++) {
        const div = document.createElement('div'); div.className = 'day-cell';
        const dayOfWeek = new Date(year, month, i).getDay();

        if (dayOfWeek === 0) { 
            div.style.background = "#e6fffa"; 
            div.innerHTML = `${i}<br><span style="color:#047857; font-size:7px; font-weight:bold;">GENERAL</span>`;
        } else if (dayOfWeek === 4) { 
            div.style.background = "#e6fffa"; 
            div.innerHTML = `${i}<br><span style="color:#047857; font-size:7px; font-weight:bold;">RECYCLE</span>`;
        } else { div.innerText = i; }

        const assigned = myBins.find(b => b.emergencyDate == i && b.emergencyMonth == month);
        if (assigned) {
            div.style.background = "#fffbeb"; div.style.border = "2px solid #f59e0b";
            div.innerHTML = `${i}<br><span style="color:#b45309; font-size:7px; font-weight:900;">${assigned.isFaulty ? 'FIX: ' + assigned.id : 'PICK: ' + assigned.id}</span>`;
        }

        div.onclick = () => {
            if (activeResolveId) {
                const bin = myBins.find(b => b.id === activeResolveId);
                bin.emergencyDate = i; bin.emergencyMonth = month;
                if(!bin.isFaulty) bin.status = 'Normal'; 
                activeResolveId = null; 
                renderCalendar();
            }
        };
        grid.appendChild(div);
    }
}

function renderAlerts() {

    const tbody = document.getElementById('alert-table-body');

    const sortedBins = [...myBins].sort((a, b) => {

        const priority = {
            "Critical": 1,
            "Warning": 2,
            "Normal": 3
        };

        return priority[a.status] - priority[b.status];
    });

    tbody.innerHTML = sortedBins.map(bin => `

        <tr>

            <td style="padding:12px;">
                <b>${bin.id}</b>
            </td>

            <td>${bin.loc}</td>

            <td style="font-weight:bold; color:${
    bin.emergencyDate
        ? '#3b82f6'
        : bin.status === 'Critical'
        ? 'red'
        : bin.status === 'Warning'
        ? '#facc15'
        : 'green'
};">
    ${
    bin.isFaulty
        ? 'Faulty'
        : bin.emergencyDate
        ? 'Scheduled'
        : bin.status
}
</td>

            <td>
                ${
    bin.emergencyDate
        ? '<span style="color:#3b82f6; font-weight:bold;">Scheduled</span>'

        : (bin.status !== "Normal" || bin.isFaulty)

        ? `<button class="btn-small"
            onclick="startResolve('${bin.id}')">
            Schedule Now
        </button>`

        : 'No action needed'
}
            </td>

        </tr>

    `).join('');
}

function renderResolvedList() {

    const tbody = document.getElementById('alert-table-body');

    // STOP ERRORS
    if (!tbody) return;

    const safeBins = window.myBins || [];

    tbody.innerHTML = safeBins.map(b => {

        let currentStatus = "";
        let actionBtn = "";

        if (b.isFaulty && b.emergencyDate) {

            currentStatus = '<span style="color:#d97706">Bin fix scheduled</span>';

        } else if (b.isFaulty) {

            currentStatus = '<span style="color:red">Faulty (Needs Fix)</span>';

            actionBtn =
                `<button class="btn-main"
                    style="padding:5px 10px; background:#6b7280; font-size:11px;"
                    onclick="startResolve('${b.id}')">
                    Schedule Fix
                </button>`;

        } else if (b.emergencyDate) {

            currentStatus = '✅ Pick up scheduled';

        } else if (b.status === 'Normal') {

            currentStatus =
                b.type === 'General Waste'
                ? 'General waste collection'
                : 'Recycle bin collection';

        } else {

            currentStatus =
                `<span style="color:red">
                    Needs Scheduling (${b.status})
                </span>`;

            actionBtn =
                `<button class="btn-main"
                    style="padding:5px 10px; background:#6b7280; font-size:11px;"
                    onclick="startResolve('${b.id}')">
                    Schedule
                </button>`;
        }

        return `
            <tr style="border-bottom:1px solid #eee;">
                <td style="padding:15px; font-weight:600;">
                    ${b.id}
                </td>

                <td>${b.loc}</td>

                <td>${currentStatus}</td>

                <td>${actionBtn}</td>
            </tr>
        `;

    }).join('');
}

function renderBins() {
    const container = document.getElementById("bin-list-container");

if (!container) return;
    container.innerHTML = myBins.map(bin => {
        let statusTxt = "";
        if (bin.isFaulty) {
            statusTxt = bin.emergencyDate ? "Bin fix scheduled" : "Faulty";
        } else if (bin.status === "Normal") {
            statusTxt = bin.type === "General Waste" ? "General waste collection" : "Recycle bin collection";
        } else {
            statusTxt = bin.status;
        }
        return `
        <div class="card" style="display:flex; justify-content:space-between; align-items:center; 
      border-left: 6px solid ${
   bin.isFaulty
    ? '#111827'
    : bin.emergencyDate
    ? '#3b82f6'
    : bin.status === 'Critical'
    ? 'red'
    : bin.status === 'Warning'
    ? '#facc15'
    : 'green'
};
    <div style="text-align:left;">
        <b>${bin.id}</b> (${bin.type})<br>
        <small>
    ${statusTxt}<br>
    <b>Location:</b> ${bin.loc}
</small>
    </div>
    <div style="display:flex; gap:10px; align-items:center;">
        <button onclick="deleteBin('${bin.id}')" style="background:none; border:none; cursor:pointer; font-size:16px;" title="Delete Bin">🗑️</button>
        <span>${bin.isFaulty ? '🛠️' : '✅'}</span>
    </div>
</div>`
    }).join('');
}

function startResolve(id) {
    activeResolveId = id;
    showPage('schedule');

    setTimeout(() => {
        const hint = document.getElementById('resolve-hint');
        if (hint) hint.style.display = 'block';
    }, 100);
}

function populateFaultSelect() { const sel = document.getElementById('fault-bin-select'); if(sel) sel.innerHTML = myBins.map(b => `<option value="${b.id}">${b.id} - ${b.loc}</option>`).join(''); }

function saveBin() {
    if (window.saveBinToFirebase) {
        window.saveBinToFirebase();
    } else {
        alert("Firebase is not ready yet");
    }
}

function generatePDFReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("WASTE MANAGEMENT AUDIT REPORT", 20, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated for: ${userProfile.name} (${userProfile.email})`, 20, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 35);
    doc.line(20, 38, 190, 38);

    let y = 50;
    myBins.forEach((b, i) => {
        let dateInfo = b.emergencyDate ? `${b.emergencyDate} ${months[b.emergencyMonth]}` : (b.type.includes('General') ? 'Weekly Sunday' : 'Weekly Thursday');
        let statusStr = "";

        if (b.isFaulty) {
            statusStr = b.emergencyDate ? "FIX SCHEDULED" : "FAULTY";
        } else if (b.status === "Normal") {
            statusStr = "ACTIVE";
        } else {
            statusStr = b.status.toUpperCase();
        }

        doc.setFont("helvetica", "bold");
        doc.text(`${b.id}`, 20, y);
        doc.setFont("helvetica", "normal");
        doc.text(`| ${b.loc.padEnd(15)} | ${statusStr.padEnd(15)} | Next Action: ${dateInfo}`, 45, y);
        
        y += 8;
        if (y > 280) { doc.addPage(); y = 20; }
    });

    doc.save("Bin_Audit_Report.pdf");
}

function changeMonth(offset) { currentViewDate.setMonth(currentViewDate.getMonth() + offset); renderCalendar(); 

}

function deleteBin(binId) {
    if (confirm(`Are you sure you want to delete ${binId}?`)) {

        if (binId === "BIN-101") {
            alert("BIN-101 is the live Arduino bin. It cannot be deleted unless Arduino/Firebase live data is removed.");
            return;
        }

        if (window.deleteBinFromFirebase) {
            window.deleteBinFromFirebase(binId);
        }

        myBins = myBins.filter(b => b.id !== binId);
        renderBins();
        updateDash();
    }
}

window.onload = () => {
    showPage('login');

    // ===============================
// LIVE FIREBASE LISTENER
// ===============================

if (window.binRef && window.onValue) {

    onValue(binRef, (snapshot) => {

        const data = snapshot.val();

        if (data) {
            window.updateFirebaseDisplay(data);
        }

    });

}
};
