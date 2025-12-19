const canvas = document.getElementById("grafik");
const ctx = canvas.getContext("2d");

const pilihan = document.getElementById("pilihan");
const fungsi = document.getElementById("fungsi");
const aInput = document.getElementById("a");
const bInput = document.getElementById("b");
const customArea = document.getElementById("customArea");
const info = document.getElementById("info");

// ===== WORLD COORDINATE =====
let scale = 40;
let offsetX = canvas.width / 2;
let offsetY = canvas.height / 2;

// ===== PAN =====
let isDragging = false;
let lastX, lastY;

// ===== MULTI GRAFIK =====
let grafikList = [];

// ===== UI =====
function ubahMode() {
    customArea.style.display =
        (pilihan.value === "custom") ? "block" : "none";
}

function tambah(s) {
    fungsi.value += s;
    fungsi.focus();
}

// ===== FUNGSI =====
function fungsiBawaan(x, jenis) {
    switch (jenis) {
        case "x2": return x * x;
        case "x3": return x * x * x;
        case "linear": return 2 * x + 1;

        case "abs": return Math.abs(x);
        case "xsinx": return x * Math.sin(x);

        case "sin": return Math.sin(x);
        case "cos": return Math.cos(x);
    }
}

    


// ===== KOORDINAT =====
const toScreenX = x => offsetX + x * scale;
const toScreenY = y => offsetY - y * scale;
const toWorldX = px => (px - offsetX) / scale;
const toWorldY = py => (offsetY - py) / scale;

// ===== GRID STEP =====
function gridStep() {
    let raw = 80 / scale;
    let p = Math.pow(10, Math.floor(Math.log10(raw)));
    if (raw / p > 5) p *= 5;
    else if (raw / p > 2) p *= 2;
    return p;
}

// ===== GRID =====
function gambarGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let step = gridStep();

    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;

    let left = toWorldX(0);
    let right = toWorldX(canvas.width);

    for (let x = Math.floor(left / step) * step; x <= right; x += step) {
        let px = toScreenX(x);
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, canvas.height);
        ctx.stroke();
        ctx.fillText(x.toFixed(2), px + 2, offsetY + 12);
    }

    let top = toWorldY(0);
    let bottom = toWorldY(canvas.height);

    for (let y = Math.floor(bottom / step) * step; y <= top; y += step) {
        let py = toScreenY(y);
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(canvas.width, py);
        ctx.stroke();
        ctx.fillText(y.toFixed(2), offsetX + 4, py - 4);
    }

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, offsetY);
    ctx.lineTo(canvas.width, offsetY);
    ctx.moveTo(offsetX, 0);
    ctx.lineTo(offsetX, canvas.height);
    ctx.stroke();
}

// ===== TAMBAH GRAFIK =====
function tambahGrafik() {
    let jenis = pilihan.value;
    let a = parseFloat(aInput.value) || 0;
    let b = parseFloat(bInput.value) || 0;

    let f;
    if (jenis === "custom") {
        if (!fungsi.value.trim()) return alert("Isi fungsi dulu");
        let exp = fungsi.value.replace(/\^/g, "**");
        f = x => Function("x", "with(Math){return " + exp + "}")(x);
    } else {
        f = x => fungsiBawaan(x, jenis);
    }

    grafikList.push({ f, a, b, color: randomColor() });
    gambar();
}

// ===== DRAW =====
function gambar() {
    gambarGrid();

    grafikList.forEach(g => {
        ctx.strokeStyle = g.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        let first = true;

        for (let px = 0; px <= canvas.width; px += 2) {
            let x = toWorldX(px);
            let y = g.f(x + g.a) + g.b;
            let py = toScreenY(y);

            if (first) {
                ctx.moveTo(px, py);
                first = false;
            } else ctx.lineTo(px, py);
        }
        ctx.stroke();
    });
}

// ===== CLEAR =====
function clearGrafik() {
    grafikList = [];
    gambar();
}

// ===== ZOOM =====
canvas.addEventListener("wheel", e => {
    e.preventDefault();
    scale *= e.deltaY < 0 ? 1.1 : 0.9;
    gambar();
});

// ===== PAN =====
canvas.addEventListener("mousedown", e => {
    isDragging = true;
    lastX = e.offsetX;
    lastY = e.offsetY;
});
canvas.addEventListener("mouseup", () => isDragging = false);
canvas.addEventListener("mousemove", e => {
    if (!isDragging) return;
    offsetX += e.offsetX - lastX;
    offsetY += e.offsetY - lastY;
    lastX = e.offsetX;
    lastY = e.offsetY;
    gambar();
});

// ===== KLIK TITIK =====
canvas.addEventListener("click", e => {
    let x = toWorldX(e.offsetX);
    let y = toWorldY(e.offsetY);
    info.innerText = `Titik: ( ${x.toFixed(3)} , ${y.toFixed(3)} )`;
});

// ===== WARNA =====
function randomColor() {
    return `hsl(${Math.random() * 360}, 70%, 50%)`;
}

// ===== INIT =====
gambar();

function openCredits() {
    document.getElementById("creditsModal").style.display = "block";
}

function closeCredits() {
    document.getElementById("creditsModal").style.display = "none";
}
