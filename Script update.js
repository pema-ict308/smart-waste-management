let userProfile = { 
    name: "Demo User", 
    email: "demo@wastemanagement.com",
    photo: "" 
};
let lastAlertStatus = "";
 
function sendEmailAlert(bin) {
    let emailStatus = "";
    if (bin.isFaulty) {
        emailStatus = "Faulty";
    } else {
        emailStatus = bin.status;
    }

    emailjs.send(
        "service_9hskc3m",
        "template_j0vqz3u",
        {
            bin_id: bin.id,
            location: bin.loc,
            status: emailStatus,
            message: bin.id + " at " + bin.loc + " requires immediate attention."
        }
    )
    .then(function() {
        console.log("Email sent!");
    })
    .catch(function(error) {
        console.log(error);
    });
}
 
let myBins = [];
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
        </div>`,

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
 
    insights: `
        <div class="app-container">
            <h1>Analytics</h1>
            <div class="card">
                <h3>Total Bins: <span id="ins-total"></span></h3>
            </div>
            <button class="btn-main btn-primary-green" style="width:100%; margin-top:20px;" onclick="generatePDFReport()">Download Audit PDF</button>
        </div>`,
 
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
    
    if (pageId === 'login' || pageId === 'register') {
        document.getElementById('navbar').style.display = 'none';
    } else {
        document.getElementById('navbar').style.display = 'flex';
    }
 
    view.innerHTML = pages[pageId];
 
    if (pageId === 'dashboard') {
        updateDash();
    }
    if (pageId === 'bin') {
        renderBins();
    }
    if (pageId === 'schedule') {
        renderCalendar();
    }
    if (pageId === 'alert') {
        renderAlerts();
    }
    if (pageId === 'reportIssue') {
        populateFaultSelect();
    }
    if (pageId === 'insights') {
        document.getElementById('ins-total').innerText = myBins.length;
    }
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
    let normalCount = 0;
    let warningCount = 0;
    let criticalCount = 0;
    let faultyCount = 0;

    for (let i = 0; i < myBins.length; i++) {
        if (myBins[i].isFaulty) {
            faultyCount++;
        }
        if (myBins[i].status === 'Normal') {
            normalCount++;
        } else if (myBins[i].status === 'Warning') {
            warningCount++;
        } else if (myBins[i].status === 'Critical') {
            criticalCount++;
        }
    }

    document.getElementById('d-total').innerText = normalCount + " Normal";
    document.getElementById('d-warn').innerText = warningCount + " Warning";
    document.getElementById('d-crit').innerText = criticalCount + " Critical";
    document.getElementById('d-faulty').innerText = faultyCount + " Faulty";
}
 
function submitFault() {
    const binId = document.getElementById('fault-bin-select').value;
    let bin = null;

    for (let i = 0; i < myBins.length; i++) {
        if (myBins[i].id === binId) {
            bin = myBins[i];
            break;
        }
    }
 
    if (bin) {
        bin.isFaulty = true;
        sendEmailAlert(bin);
        bin.faultDesc = document.getElementById('fault-desc').value;
        alert("⚠️ Alert sent successfully!");
        
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
 
    let daysOfWeek = ['S','M','T','W','T','F','S'];
    for (let i = 0; i < daysOfWeek.length; i++) {
        const h = document.createElement('div');
        h.style.fontWeight = 'bold';
        h.innerText = daysOfWeek[i];
        grid.appendChild(h);
    }
 
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    head.innerText = currentViewDate.toLocaleString('default', { month: 'long', year: 'numeric' });
 
    let totalDays = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= totalDays; i++) {
        const div = document.createElement('div');
        div.className = 'day-cell';
        const dayOfWeek = new Date(year, month, i).getDay();
 
        if (dayOfWeek === 0) { 
            div.style.background = "#e6fffa"; 
            div.innerHTML = i + '<br><span style="color:#047857; font-size:7px; font-weight:bold;">GENERAL</span>';
        } else if (dayOfWeek === 4) { 
            div.style.background = "#e6fffa"; 
            div.innerHTML = i + '<br><span style="color:#047857; font-size:7px; font-weight:bold;">RECYCLE</span>';
        } else {
            div.innerText = i;
        }
 
        let assigned = null;
        for (let j = 0; j < myBins.length; j++) {
            if (myBins[j].emergencyDate == i && myBins[j].emergencyMonth == month) {
                assigned = myBins[j];
                break;
            }
        }

        if (assigned) {
            div.style.background = "#fffbeb";
            div.style.border = "2px solid #f59e0b";
            let actionText = "";
            if (assigned.isFaulty) {
                actionText = 'FIX: ' + assigned.id;
            } else {
                actionText = 'PICK: ' + assigned.id;
            }
            div.innerHTML = i + '<br><span style="color:#b45309; font-size:7px; font-weight:900;">' + actionText + '</span>';
        }
 
        div.onclick = function() {
            if (activeResolveId) {
                let foundBin = null;
                for (let k = 0; k < myBins.length; k++) {
                    if (myBins[k].id === activeResolveId) {
                        foundBin = myBins[k];
                        break;
                    }
                }
                if (foundBin) {
                    foundBin.emergencyDate = i;
                    foundBin.emergencyMonth = month;
                    if (!foundBin.isFaulty) {
                        foundBin.status = 'Normal';
                    }
                    activeResolveId = null; 
                    renderCalendar();
                }
            }
        };
        grid.appendChild(div);
    }
}
 
function renderAlerts() {
    const tbody = document.getElementById('alert-table-body');
    if (!tbody) return;
 
    const sortedBins = [...myBins].sort((a, b) => {
        const priority = { "Critical": 1, "Warning": 2, "Normal": 3 };
        return priority[a.status] - priority[b.status];
    });
 
    let htmlContent = "";
    for (let i = 0; i < sortedBins.length; i++) {
        let bin = sortedBins[i];
        let statusColor = "green";
        
        if (bin.emergencyDate) {
            statusColor = '#3b82f6';
        } else if (bin.status === 'Critical') {
            statusColor = 'red';
        } else if (bin.status === 'Warning') {
            statusColor = '#facc15';
        }

        let labelText = bin.status;
        if (bin.isFaulty) {
            labelText = 'Faulty';
        } else if (bin.emergencyDate) {
            labelText = 'Scheduled';
        }

        let actionArea = 'No action needed';
        if (bin.emergencyDate) {
            actionArea = '<span style="color:#3b82f6; font-weight:bold;">Scheduled</span>';
        } else if (bin.status !== "Normal" || bin.isFaulty) {
            actionArea = '<button class="btn-small" onclick="startResolve(\'' + bin.id + '\')">Schedule Now</button>';
        }

        htmlContent += '<tr>' +
            '<td style="padding:12px;"><b>' + bin.id + '</b></td>' +
            '<td>' + bin.loc + '</td>' +
            '<td style="font-weight:bold; color:' + statusColor + ';">' + labelText + '</td>' +
            '<td>' + actionArea + '</td>' +
        '</tr>';
    }
    tbody.innerHTML = htmlContent;
}
 
function renderResolvedList() {
    const tbody = document.getElementById('alert-table-body');
    if (!tbody) return;

    let htmlContent = "";
    for (let i = 0; i < window.myBins.length; i++) {
        let b = window.myBins[i];
        let currentStatus = "";
        let actionBtn = "";
 
        if (b.isFaulty && b.emergencyDate) {
            currentStatus = '<span style="color:#d97706">Bin fix scheduled</span>';
        } else if (b.isFaulty) {
            currentStatus = '<span style="color:red">Faulty (Needs Fix)</span>';
            actionBtn = '<button class="btn-main" style="padding:5px 10px; background:#6b7280; font-size:11px;" onclick="startResolve(\'' + b.id + '\')">Schedule Fix</button>';
        } else if (b.emergencyDate) {
            currentStatus = '✅ Pick up scheduled';
        } else if (b.status === 'Normal') {
            if (b.type === 'General Waste') {
                currentStatus = 'General waste collection';
            } else {
                currentStatus = 'Recycle bin collection';
            }
        } else {
            currentStatus = '<span style="color:red">Needs Scheduling (' + b.status + ')</span>';
            actionBtn = '<button class="btn-main" style="padding:5px 10px; background:#6b7280; font-size:11px;" onclick="startResolve(\'' + b.id + '\')">Schedule</button>';
        }
 
        htmlContent += '<tr style="border-bottom:1px solid #eee;"><td style="padding:15px; font-weight:600;">' + b.id + '</td><td>' + b.loc + '</td><td>' + currentStatus + '</td><td>' + actionBtn + '</td></tr>';
    }
    tbody.innerHTML = htmlContent;
}
 
function renderBins() {
    const cont = document.getElementById('bin-list-container');
    if (!cont) return;

    let htmlContent = "";
    for (let i = 0; i < myBins.length; i++) {
        let bin = myBins[i];
        let statusTxt = "";
        
        if (bin.isFaulty) {
            if (bin.emergencyDate) {
                statusTxt = "Bin fix scheduled";
            } else {
                statusTxt = "Faulty";
            }
        } else if (bin.status === "Normal") {
            if (bin.type === "General Waste") {
                statusTxt = "General waste collection";
            } else {
                statusTxt = "Recycle bin collection";
            }
        } else {
            statusTxt = bin.status;
        }

        let borderColor = 'green';
        if (bin.isFaulty) {
            borderColor = '#111827';
        } else if (bin.emergencyDate) {
            borderColor = '#3b82f6';
        } else if (bin.status === 'Critical') {
            borderColor = 'red';
        } else if (bin.status === 'Warning') {
            borderColor = '#facc15';
        }

        let iconStr = '✅';
        if (bin.isFaulty) {
            iconStr = '🛠️';
        }

        htmlContent += '<div class="card" style="display:flex; justify-content:space-between; align-items:center; border-left: 6px solid ' + borderColor + ';">' +
            '<div style="text-align:left;">' +
                '<b>' + bin.id + '</b> (' + bin.type + ')<br>' +
                '<small>' + statusTxt + '<br><b>Location:</b> ' + bin.loc + '</small>' +
            '</div>' +
            '<div style="display:flex; gap:10px; align-items:center;">' +
                '<button onclick="deleteBin(\'' + bin.id + '\')" style="background:none; border:none; cursor:pointer; font-size:16px;" title="Delete Bin">🗑️</button>' +
                '<span>' + iconStr + '</span>' +
            '</div>' +
        '</div>';
    }
    cont.innerHTML = htmlContent;
}
 
function startResolve(id) {
    activeResolveId = id;
    showPage('schedule');
 
    setTimeout(function() {
        const hint = document.getElementById('resolve-hint');
        if (hint) {
            hint.style.display = 'block';
        }
    }, 100);
}
 
function populateFaultSelect() {
    const sel = document.getElementById('fault-bin-select'); 
    if (!sel) return;
    
    let options = "";
    for (let i = 0; i < myBins.length; i++) {
        options += '<option value="' + myBins[i].id + '">' + myBins[i].id + ' - ' + myBins[i].loc + '</option>';
    }
    sel.innerHTML = options;
}
 
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
    doc.text("Generated for: " + userProfile.name + " (" + userProfile.email + ")", 20, 30);
    doc.text("Date: " + new Date().toLocaleDateString(), 20, 35);
    doc.line(20, 38, 190, 38);
 
    let y = 50;
    for (let i = 0; i < myBins.length; i++) {
        let b = myBins[i];
        let dateInfo = "";
        if (b.emergencyDate) {
            dateInfo = b.emergencyDate + " " + months[b.emergencyMonth];
        } else {
            if (b.type.includes('General')) {
                dateInfo = 'Weekly Sunday';
            } else {
                dateInfo = 'Weekly Thursday';
            }
        }

        let statusStr = "";
        if (b.isFaulty) {
            if (b.emergencyDate) {
                statusStr = "FIX SCHEDULED";
            } else {
                statusStr = "FAULTY";
            }
        } else if (b.status === "Normal") {
            statusStr = "ACTIVE";
        } else {
            statusStr = b.status.toUpperCase();
        }
 
        doc.setFont("helvetica", "bold");
        doc.text(b.id, 20, y);
        doc.setFont("helvetica", "normal");
        doc.text("| " + b.loc.padEnd(15) + " | " + statusStr.padEnd(15) + " | Next Action: " + dateInfo, 45, y);
        
        y += 8;
        if (y > 280) { 
            doc.addPage(); 
            y = 20; 
        }
    }
 
    doc.save("Bin_Audit_Report.pdf");
}
 
function changeMonth(offset) {
    currentViewDate.setMonth(currentViewDate.getMonth() + offset);
    renderCalendar(); 
}
 
function deleteBin(binId) {
    if (confirm("Are you sure you want to delete " + binId + "?")) {
        if (binId === "BIN-101") {
            alert("BIN-101 is the live Arduino bin. It cannot be deleted unless Arduino/Firebase live data is removed.");
            return;
        }
 
        if (window.deleteBinFromFirebase) {
            window.deleteBinFromFirebase(binId);
        }
 
        let tempBins = [];
        for (let i = 0; i < myBins.length; i++) {
            if (myBins[i].id !== binId) {
                tempBins.push(myBins[i]);
            }
        }
        myBins = tempBins;

        renderBins();
        updateDash();
    }
}
 
window.onload = function() {
    showPage('login');
 
    if (window.binRef && window.onValue) {
        onValue(binRef, function(snapshot) {
            const data = snapshot.val();
            if (data) {
                window.updateFirebaseDisplay(data);
            }
        });
    }
};
