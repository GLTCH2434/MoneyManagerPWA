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
    const box = document.getElementById("budgetInputs");
    box.innerHTML = "";
    const cats = Array.from(document.getElementById("cat").options).map(o => o.value);
    cats.forEach(c => {
        const cur = budgets[c] || "";
        box.innerHTML += `
            <label class="budgetLabel">
                <span>${cleanCatName(c)}</span>
                <input type="number" class="budgetInput" data-cat="${c}" placeholder="—" value="${cur}">
            </label>
        `;
    });
    document.getElementById("budgetDialog").classList.add("show");
}

function closeBudgetDialog(){
    document.getElementById("budgetDialog").classList.remove("show");
}

function saveBudgets(){
    document.querySelectorAll(".budgetInput").forEach(inp => {
        const c = inp.dataset.cat;
        const v = Number(inp.value);
        if (inp.value !== "" && v > 0) budgets[c] = v;
        else delete budgets[c];
    });
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

    // Create pie chart for expenses
    const expenseCats = catRows.filter(r => r.expense > 0);
    if (expenseCats.length > 0) {
        const chartCanvas = document.createElement('canvas');
        chartCanvas.width = 400;
        chartCanvas.height = 400;
        const ctx = chartCanvas.getContext('2d');
        
        const chartColors = [
            '#EF4444', '#F97316', '#F59E0B', '#EAB308',
            '#84CC16', '#22C55E', '#10B981', '#14B8A6',
            '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
            '#8B5CF6', '#A855F7', '#D946EF', '#EC4899'
        ];
        
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: expenseCats.map(r => r.name),
                datasets: [{
                    data: expenseCats.map(r => r.expense),
                    backgroundColor: chartColors.slice(0, expenseCats.length),
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                }
            }
        });
        
        // Add pie chart image to PDF
        const chartImgData = chartCanvas.toDataURL('image/png');
        const chartWidth = 80; // mm
        const chartHeight = 80; // mm
        pdf.addImage(chartImgData, 'PNG', 15, y, chartWidth, chartHeight);
        
        // Add legend next to pie chart
        let legendY = y;
        expenseCats.forEach((r, i) => {
            const pct = totalExpense > 0 ? ((r.expense / totalExpense) * 100).toFixed(1) : '0.0';
            pdf.setFillColor(chartColors[i % chartColors.length]);
            pdf.rect(105, legendY + 2, 8, 8, 'F');
            pdf.setFontSize(9);
            pdf.setTextColor(0);
            pdf.text(`${r.name}: ${money(r.expense)} (${pct}%)`, 115, legendY + 8);
            legendY += 12;
        });
        
        y += Math.max(chartHeight, expenseCats.length * 12) + 10;
    }

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
