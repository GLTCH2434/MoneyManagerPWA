const amt = document.getElementById("amt");
const type = document.getElementById("type");
const cat = document.getElementById("cat");
const note = document.getElementById("note");

const bal = document.getElementById("bal");
const inc = document.getElementById("inc");
const exp = document.getElementById("exp");

const list = document.getElementById("list");
const toast = document.getElementById("toast");

let tx = JSON.parse(localStorage.getItem("tx")) || [];

let budgets = JSON.parse(localStorage.getItem("budgets")) || {};

function save() {
    localStorage.setItem("tx", JSON.stringify(tx));
    render();
}

function money(x) {
    return "₹" + Number(x).toLocaleString("en-IN");
}

function showToast(msg, type = "success") {
    toast.innerText = msg;
    toast.className = "show " + type;

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}

function addTx() {

    if (amt.value === "") {
        alert("Enter amount");
        return;
    }

    tx.unshift({

        id: Date.now(),

        amount: Number(amt.value),

        type: type.value,

        category: cat.value,

        note: note.value,

        date: new Date().toISOString()

    });

    amt.value = "";
    note.value = "";

    save();

    showToast("Transaction Added ✓");

}

function deleteTx(id) {

    if (!confirm("Delete transaction?"))
        return;

    tx = tx.filter(t => t.id !== id);

    save();

    showToast("Deleted", "error");

}

function openModal(){

document.getElementById("modal").classList.add("show");

document.getElementById("overlay").classList.add("show");

}

function closeModal(){

document.getElementById("modal").classList.remove("show");

document.getElementById("overlay").classList.remove("show");

}

function saveTransaction(){

addTx();

closeModal();

}

function render() {

    list.innerHTML = "";

    let income = 0;
    let expense = 0;

    tx.forEach(t => {

        if (t.type === "Income")
            income += t.amount;
        else
            expense += t.amount;

        let li = document.createElement("li");
        li.className = t.type === "Income" ? "income-item" : "";

       li.innerHTML = `

<div class="txCard">

    <div class="txLeft">

        <div class="txIcon">

            ${
                t.category.includes("Food") ? "🍔" :
                t.category.includes("Transport") ? "🚗" :
                t.category.includes("Shopping") ? "🛍️" :
                t.category.includes("Bills") ? "💡" :
                t.category.includes("Entertainment") ? "🎬" :
                t.category.includes("Salary") ? "💼" :
                t.category.includes("Medical") ? "🏥" :
                t.category.includes("Travel") ? "✈️" :
                t.category.includes("Savings") ? "🏦" :
                t.category.includes("EMI") ? "💳" :
                t.category.includes("Gifts") ? "🎁" :
                "📦"
            }

        </div>

        <div>

            <div class="txCategory">

                ${t.category}

            </div>

            <div class="txNote">

                ${t.note || "No notes"}

            </div>

            <div class="txDate">

                ${t.date}

            </div>

        </div>

    </div>

    <div class="txRight">

        <div class="${t.type==="Income"?"incomeAmount":"expenseAmount"}">

            ${t.type==="Income" ? "+" : "-"}

            ${money(t.amount)}

        </div>

        <button class="deleteBtn"

        onclick="deleteTx(${t.id})">

            🗑

        </button>

    </div>

</div>

`;

        list.appendChild(li);

    });

    bal.innerText = money(income - expense);

    inc.innerText = money(income);

    exp.innerText = money(expense);

    renderBudgets();

}

function cleanCatName(c){
    return c.replace(/^[^\p{L}\p{N}]+/u, "").trim() || c;
}

function monthKey(dateStr){
    const d = new Date(dateStr);
    return d.getFullYear() + "-" + d.getMonth();
}

function spentThisMonth(category){
    const key = monthKey(new Date());
    return tx
        .filter(t => t.type === "Expense" && t.category === category && monthKey(t.date) === key)
        .reduce((s,t) => s + t.amount, 0);
}

function renderBudgets(){
    const listEl = document.getElementById("budgetList");
    const entries = Object.entries(budgets).filter(([c,amt]) => Number(amt) > 0);

    let totalBudget = 0, totalSpent = 0;

    if (entries.length === 0){
        listEl.innerHTML = '<p class="budgetEmpty">No budgets set yet. Tap "Set / Update Budgets" to start.</p>';
    } else {
        listEl.innerHTML = "";
        entries.forEach(([c,amt]) => {
            amt = Number(amt);
            const spent = spentThisMonth(c);
            totalBudget += amt;
            totalSpent += spent;
            const pct = amt > 0 ? Math.min(100, Math.round((spent / amt) * 100)) : 0;
            const over = spent > amt;
            listEl.innerHTML += `
                <div class="budgetRow">
                    <div class="budgetRowTop">
                        <span>${cleanCatName(c)}</span>
                        <span class="${over ? "over" : ""}">${money(spent)} / ${money(amt)}</span>
                    </div>
                    <div class="bar"><div class="barFill ${over ? "over" : ""}" style="width:${pct}%"></div></div>
                </div>
            `;
        });
    }

    document.getElementById("budgetTotal").innerText = money(totalBudget);
    document.getElementById("budgetSpent").innerText = money(totalSpent);
}

function openBudgetDialog(){
    renderBudgetDialog();
    document.getElementById("budgetDialog").classList.add("show");
}

function renderBudgetDialog(){
    const box = document.getElementById("budgetInputs");
    box.innerHTML = "";
    
    const cats = Array.from(document.getElementById("cat").options).map(o => o.value);
    
    // Calculate total income for reference
    const totalIncome = tx.filter(t => t.type === "Income").reduce((s, t) => s + t.amount, 0);
    
    cats.forEach(c => {
        const cur = budgets[c] || "";
        const spent = spentThisMonth(c);
        const budgetAmt = Number(cur) || 0;
        const pct = budgetAmt > 0 ? Math.min(100, Math.round((spent / budgetAmt) * 100)) : 0;
        const over = spent > budgetAmt && budgetAmt > 0;
        const hasBudget = budgetAmt > 0;
        
        let statusClass = "";
        let statusText = "No budget set";
        if (hasBudget) {
            if (over) { statusClass = "over"; statusText = "Over budget"; }
            else if (pct >= 80) { statusClass = "warning"; statusText = "Near limit"; }
            else { statusClass = "ok"; statusText = "On track"; }
        }
        
        box.innerHTML += `
            <div class="budgetCard" data-cat="${c}">
                <div class="budgetCardHeader">
                    <span class="budgetCatName">${cleanCatName(c)}</span>
                    <span class="budgetStatus ${statusClass}">${statusText}</span>
                </div>
                <div class="budgetProgress">
                    <div class="budgetProgressBar">
                        <div class="budgetProgressFill ${statusClass}" style="width:${pct}%"></div>
                    </div>
                    <div class="budgetProgressLabels">
                        <span class="spentLabel">Spent: ${money(spent)}</span>
                        <span class="budgetLabel">Budget: ${hasBudget ? money(budgetAmt) : "—"}</span>
                    </div>
                </div>
                <div class="budgetInputWrapper">
                    <label class="budgetInputLabel">Monthly Budget</label>
                    <div class="budgetInputRow">
                        <span class="currencyPrefix">₹</span>
                        <input type="text" class="budgetInput" data-cat="${c}" placeholder="Enter amount" value="${cur}" inputmode="numeric" pattern="[0-9]*" autocomplete="off">
                    </div>
                    ${hasBudget ? `
                        <div class="budgetQuickRow">
                            <button type="button" class="microBtn" onclick="adjustBudget('${c}', 500)">+₹500</button>
                            <button type="button" class="microBtn" onclick="adjustBudget('${c}', -500)">-₹500</button>
                            <button type="button" class="microBtn" onclick="setBudgetToSpent('${c}')">Match Spent</button>
                            <button type="button" class="microBtn danger" onclick="removeBudget('${c}')">Remove</button>
                        </div>
                    ` : ""}
                </div>
            </div>
        `;
    });
    
    // Update summary
    updateBudgetDialogSummary();
}

function updateBudgetDialogSummary(){
    const entries = Object.entries(budgets).filter(([c,amt]) => Number(amt) > 0);
    let totalBudget = 0, totalSpent = 0;
    
    entries.forEach(([c,amt]) => {
        amt = Number(amt);
        const spent = spentThisMonth(c);
        totalBudget += amt;
        totalSpent += spent;
    });
    
    const remaining = totalBudget - totalSpent;
    
    document.getElementById("dialogBudgetTotal").innerText = money(totalBudget);
    document.getElementById("dialogBudgetSpent").innerText = money(totalSpent);
    document.getElementById("dialogBudgetRemaining").innerText = money(remaining);
    
    const remainingEl = document.getElementById("dialogBudgetRemaining");
    remainingEl.style.color = remaining >= 0 ? "var(--green)" : "var(--red)";
}

function adjustBudget(cat, delta){
    const input = document.querySelector(`.budgetInput[data-cat="${cat}"]`);
    if (input) {
        const current = Number(input.value) || 0;
        const next = Math.max(0, current + delta);
        input.value = next || "";
        updateBudgetDialogSummary();
    }
}

function setBudgetToSpent(cat){
    const spent = spentThisMonth(cat);
    const input = document.querySelector(`.budgetInput[data-cat="${cat}"]`);
    if (input && spent > 0) {
        input.value = spent;
        updateBudgetDialogSummary();
    }
}

function removeBudget(cat){
    const input = document.querySelector(`.budgetInput[data-cat="${cat}"]`);
    if (input) {
        input.value = "";
        updateBudgetDialogSummary();
    }
}

function quickSetBudgets(mode){
    const cats = Array.from(document.getElementById("cat").options).map(o => o.value);
    const totalIncome = tx.filter(t => t.type === "Income").reduce((s, t) => s + t.amount, 0);
    
    if (mode === "percentage" && totalIncome > 0) {
        // Suggest 50/30/20 rule adapted
        const suggested = {
            "🍔 Food": 0.25,
            "🚗 Transport": 0.10,
            "🛍 Shopping": 0.10,
            "💡 Bills": 0.15,
            "🎬 Entertainment": 0.05,
            "💼 Salary": 0,
            "🏥 Medical": 0.05,
            "✈ Travel": 0.05,
            "🏦 Savings": 0.20,
            "💳 EMI": 0.05,
            "🎁 Gifts": 0.05,
            "📦 Other": 0
        };
        cats.forEach(c => {
            const pct = suggested[c] || 0;
            if (pct > 0) {
                const input = document.querySelector(`.budgetInput[data-cat="${c}"]`);
                if (input) input.value = Math.round(totalIncome * pct);
            }
        });
    } else if (mode === "equal" && totalIncome > 0) {
        const expenseCats = cats.filter(c => !c.includes("Salary") && !c.includes("Savings"));
        const perCat = Math.round(totalIncome * 0.5 / expenseCats.length);
        expenseCats.forEach(c => {
            const input = document.querySelector(`.budgetInput[data-cat="${c}"]`);
            if (input) input.value = perCat;
        });
    }
    updateBudgetDialogSummary();
    showToast("Quick budgets applied", "success");
}

function clearAllBudgets(){
    if (!confirm("Clear all budgets?")) return;
    document.querySelectorAll(".budgetInput").forEach(input => {
        input.value = "";
    });
    updateBudgetDialogSummary();
    showToast("All budgets cleared", "success");
}

function closeBudgetDialog(){
    document.getElementById("budgetDialog").classList.remove("show");
}

function saveBudgets(){
    const inputs = document.querySelectorAll(".budgetInput");
    console.log("Found inputs:", inputs.length);
    inputs.forEach(inp => {
        console.log("Input:", inp.dataset.cat, inp.value);
        const c = inp.dataset.cat;
        const v = Number(inp.value);
        if (inp.value !== "" && v > 0) budgets[c] = v;
        else delete budgets[c];
    });
    console.log("Budgets:", budgets);
    localStorage.setItem("budgets", JSON.stringify(budgets));
    renderBudgets();
    closeBudgetDialog();
    showToast("Budgets Saved ✓", "success");
}

function showMonthDialog(){

    const select=document.getElementById("reportMonth");

    select.innerHTML="";

    const months=new Set();

    tx.forEach(t=>{

        const d=new Date(t.date);

        months.add(

            d.toLocaleString("en-US",{

                month:"long",

                year:"numeric"

            })

        );

    });

    [...months].sort().forEach(m=>{

        select.innerHTML+=`<option>${m}</option>`;

    });

    document
    .getElementById("monthDialog")
    .classList.add("show");

}

function closeMonthDialog(){

    document
    .getElementById("monthDialog")
    .classList.remove("show");

}

function showStatsDialog(){
    renderStats();
    document.getElementById("statsDialog").classList.add("show");
}

function closeStatsDialog(){
    document.getElementById("statsDialog").classList.remove("show");
}

function renderStats(){
    const container = document.getElementById("statsContent");
    let income = 0, expense = 0;
    
    tx.forEach(t => {
        if (t.type === "Income") income += t.amount;
        else expense += t.amount;
    });
    
    const balance = income - expense;
    
    // Category breakdown
    const byCat = {};
    tx.forEach(t => {
        if (!byCat[t.category]) byCat[t.category] = { income: 0, expense: 0 };
        if (t.type === "Income") byCat[t.category].income += t.amount;
        else byCat[t.category].expense += t.amount;
    });
    
    const catRows = Object.entries(byCat)
        .map(([c, v]) => ({ name: cleanCatName(c), income: v.income, expense: v.expense }))
        .sort((a, b) => (b.expense - a.expense) || (b.income - a.income) || a.name.localeCompare(b.name));
    
    const totalExpense = catRows.reduce((sum, r) => sum + r.expense, 0);
    
    let html = `
        <div class="statsGrid">
            <div class="statCard">
                <div class="statLabel">Total Income</div>
                <div class="statValue incomeVal">${money(income)}</div>
            </div>
            <div class="statCard">
                <div class="statLabel">Total Expense</div>
                <div class="statValue expenseVal">${money(expense)}</div>
            </div>
            <div class="statCard">
                <div class="statLabel">Balance</div>
                <div class="statValue ${balance >= 0 ? 'incomeVal' : 'expenseVal'}">${money(balance)}</div>
            </div>
            <div class="statCard">
                <div class="statLabel">Transactions</div>
                <div class="statValue">${tx.length}</div>
            </div>
        </div>
        <div class="statsCategoryTitle">Category Breakdown</div>
        <div class="statsCategoryList">
    `;
    
    if (catRows.length === 0) {
        html += `<div class="statsEmpty">No transactions yet</div>`;
    } else {
        catRows.forEach(r => {
            const pct = totalExpense > 0 ? ((r.expense / totalExpense) * 100).toFixed(1) : '0.0';
            html += `
                <div class="statsCatRow">
                    <div class="statsCatInfo">
                        <span class="statsCatName">${r.name}</span>
                        <span class="statsCatPct">${pct}%</span>
                    </div>
                    <div class="statsCatAmounts">
                        ${r.income > 0 ? `<span class="incomeVal">+${money(r.income)}</span>` : ''}
                        ${r.expense > 0 ? `<span class="expenseVal">-${money(r.expense)}</span>` : ''}
                    </div>
                </div>
            `;
        });
    }
    
    html += `</div>`;
    container.innerHTML = html;
}

function generateMonthlyPDF(){

    const month=document
    .getElementById("reportMonth")
    .value;

    exportPDF(month);

    closeMonthDialog();

}

async function exportPDF(){

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF();

    let income=0;
    let expense=0;

    tx.forEach(t=>{
        if(t.type==="Income")
            income+=t.amount;
        else
            expense+=t.amount;
    });

    const balance=income-expense;

    pdf.setFillColor(41,98,255);
    pdf.rect(0,0,210,35,"F");

    pdf.setTextColor(255);
    pdf.setFontSize(24);
    pdf.setFont("helvetica","bold");
    pdf.text("Money Manager",15,18);

    pdf.setFontSize(11);
    pdf.text("Monthly Financial Report",15,28);

    pdf.setTextColor(0);

    let y = 48;

    // Summary
    pdf.setFontSize(18);
    pdf.text("Summary",15,y);

    y += 12;

    pdf.setFontSize(12);

    pdf.text("Income",20,y);
    pdf.text("Rs. "+income.toLocaleString("en-IN"),90,y);

    y += 10;

    pdf.text("Expense",20,y);
    pdf.text("Rs. "+expense.toLocaleString("en-IN"),90,y);

    y += 10;

    pdf.text("Balance",20,y);
    pdf.text("Rs. "+balance.toLocaleString("en-IN"),90,y);

    y += 22;

    // Category-wise spending
    if (y > 250){ pdf.addPage(); y = 20; }

    pdf.setFontSize(18);
    pdf.text("Category-wise Spending",15,y);

    y += 8;

    const byCat = {};

    tx.forEach(t=>{
        if(!byCat[t.category]) byCat[t.category] = { income:0, expense:0 };
        if(t.type === "Income") byCat[t.category].income += t.amount;
        else byCat[t.category].expense += t.amount;
    });

    const catRows = Object.entries(byCat)
        .map(([c,v]) => ({ name: cleanCatName(c), income:v.income, expense:v.expense }))
        .sort((a,b) => (b.expense - a.expense) || (b.income - a.income) || a.name.localeCompare(b.name));

    // Calculate total expense for percentage
    const totalExpense = catRows.reduce((sum, r) => sum + r.expense, 0);

    // Category table with percentage
    if (y > 250){ pdf.addPage(); y = 20; }

    pdf.autoTable({

        startY: y,

        head:[[
            "Category",
            "Income",
            "Expense",
            "% of Expenses"
        ]],

        body: catRows.map(r => [
            r.name,
            r.income ? "Rs. "+r.income.toLocaleString("en-IN") : "-",
            r.expense ? "Rs. "+r.expense.toLocaleString("en-IN") : "-",
            r.expense && totalExpense > 0 ? ((r.expense / totalExpense) * 100).toFixed(1) + "%" : "-"
        ]),

        headStyles:{
            fillColor:[41,98,255]
        },

        alternateRowStyles:{
            fillColor:[245,245,245]
        },

        styles:{
            fontSize:10
        }

    });

    y = pdf.lastAutoTable.finalY + 22;

    // All transactions
    if (y > 250){ pdf.addPage(); y = 20; }

    pdf.setFontSize(18);
    pdf.text("Transactions",15,y);

    y += 8;

    pdf.autoTable({

        startY: y,

        head:[[
            "Date",
            "Category",
            "Type",
            "Amount",
            "Note"
        ]],

        body:tx.map(t=>[
            t.date,
            t.category.replace(/[^\x00-\x7F]/g,""),
            t.type,
            "Rs. "+t.amount.toLocaleString("en-IN"),
            t.note||"-"
        ]),

        headStyles:{
            fillColor:[41,98,255]
        },

        alternateRowStyles:{
            fillColor:[245,245,245]
        },

        styles:{
            fontSize:10
        }

    });

    pdf.setFontSize(10);

    pdf.setTextColor(120);

    pdf.text(

        "Generated on "+new Date().toLocaleString(),

        15,

        pdf.lastAutoTable.finalY+15

    );

    const now = new Date();

const monthName = now.toLocaleString("en-US", {
    month: "long"
});

const year = now.getFullYear();

pdf.save(`${monthName} ${year} Report.pdf`);

    showToast("PDF Exported", "success");

}

if ("serviceWorker" in navigator) {

    navigator.serviceWorker.register("sw.js");

}

render();
