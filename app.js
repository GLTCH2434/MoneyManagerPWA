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

}

function cleanCatName(c){
    return c.replace(/^[^\p{L}\p{N}]+/u, "").trim() || c;
}

function monthKey(dateStr){
    const d = new Date(dateStr);
    return d.getFullYear() + "-" + d.getMonth();
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