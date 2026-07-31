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

function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 1800);
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

        date: new Date().toLocaleDateString("en-IN", {

            day: "2-digit",
            month: "short",
            year: "numeric"

        })

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

    showToast("Deleted");

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
                t.category.includes("Education") ? "📚" :
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

    pdf.setFontSize(18);
    pdf.text("Summary",15,48);

    pdf.setFontSize(12);

    pdf.text("Income",20,60);
    pdf.text("Rs. "+income.toLocaleString("en-IN"),90,60);

    pdf.text("Expense",20,70);
    pdf.text("Rs. "+expense.toLocaleString("en-IN"),90,70);

    pdf.text("Balance",20,80);
    pdf.text("Rs. "+balance.toLocaleString("en-IN"),90,80);

    pdf.autoTable({

        startY:95,

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

    showToast("PDF Exported");

}

if ("serviceWorker" in navigator) {

    navigator.serviceWorker.register("sw.js");

}

render();
