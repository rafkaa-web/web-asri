// ================= DATA MENU MAKANAN & MINUMAN =================
const MENU_ITEMS = [
  { id: 1, name: "Nasi Goreng Spesial Nusa", category: "makanan", price: 25000 },
  { id: 2, name: "Ayam Geprek Sambal Matah", category: "makanan", price: 22000 },
  { id: 3, name: "Mie Goreng Jawa Komplit", category: "makanan", price: 20000 },
  { id: 4, name: "Roti Bakar Cokelat Keju", category: "makanan", price: 16000 },
  { id: 5, name: "Kentang Goreng Saus Keju", category: "makanan", price: 15000 },
  { id: 6, name: "Es Kopi Susu Gula Aren", category: "minuman", price: 18000 },
  { id: 7, name: "Matcha Latte Dingin", category: "minuman", price: 21000 },
  { id: 8, name: "Es Teh Leci Segar", category: "minuman", price: 14000 },
  { id: 9, name: "Cokelat Hazelnut Ice", category: "minuman", price: 20000 },
  { id: 10, name: "Air Mineral Botol", category: "minuman", price: 6000 }
];

// ================= STATE APLIKASI =================
let cart = [];
let selectedCategory = "all";
let selectedPayment = "Tunai";

// Data awal penjualan agar laporan sistem langsung terlihat hidup saat dibuka
let salesHistory = [
  {
    id: "TRX-1001",
    time: "09:15",
    channelLabel: "Dine-In / Takeaway",
    isOjol: false,
    itemsSummary: "Es Kopi Susu Gula Aren (2x), Roti Bakar Cokelat Keju (1x)",
    method: "QRIS",
    customerTotal: 52000,
    platformFee: 0,
    netIncome: 52000
  },
  {
    id: "TRX-1002",
    time: "10:05",
    channelLabel: "GoFood",
    isOjol: true,
    itemsSummary: "Ayam Geprek Sambal Matah (2x), Es Teh Leci Segar (2x)",
    method: "E-Wallet",
    customerTotal: 86400,
    platformFee: 17280,
    netIncome: 69120
  },
  {
    id: "TRX-1003",
    time: "11:20",
    channelLabel: "Dine-In / Takeaway",
    isOjol: false,
    itemsSummary: "Nasi Goreng Spesial Nusa (1x), Matcha Latte Dingin (1x)",
    method: "DANA",
    customerTotal: 46000,
    platformFee: 0,
    netIncome: 46000
  }
];

// ================= HELPER FORMAT RUPIAH =================
function formatRupiah(angka) {
  return "Rp " + Math.round(angka).toLocaleString("id-ID");
}

// ================= RENDER DAFTAR MENU =================
const menuGrid = document.getElementById("menuGrid");
const categoryBtns = document.querySelectorAll(".cat-btn");

function renderMenu() {
  menuGrid.innerHTML = "";
  const filtered = selectedCategory === "all"
    ? MENU_ITEMS
    : MENU_ITEMS.filter(item => item.category === selectedCategory);

  filtered.forEach(item => {
    const card = document.createElement("div");
    card.className = "menu-item-card";
    card.innerHTML = `
      <div>
        <div class="menu-item-top">
          <span class="menu-tag ${item.category}">${item.category}</span>
        </div>
        <h4>${item.name}</h4>
      </div>
      <div class="menu-item-bottom">
        <span class="menu-price">${formatRupiah(item.price)}</span>
        <span class="add-pill">+ Tambah</span>
      </div>
    `;
    card.addEventListener("click", () => addToCart(item));
    menuGrid.appendChild(card);
  });
}

categoryBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    categoryBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedCategory = btn.dataset.category;
    renderMenu();
  });
});

// ================= LOGIKA KERANJANG & KALKULASI OJOL =================
const cartItemsEl = document.getElementById("cartItems");
const orderChannelEl = document.getElementById("orderChannel");
const channelNoteEl = document.getElementById("channelNote");

function addToCart(item) {
  const existing = cart.find(c => c.id === item.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  updateCartUI();
}

function updateQty(id, delta) {
  const idx = cart.findIndex(c => c.id === id);
  if (idx === -1) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) {
    cart.splice(idx, 1);
  }
  updateCartUI();
}

function calculateTotals() {
  const baseTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const selectedOpt = orderChannelEl.options[orderChannelEl.selectedIndex];
  const markupRate = parseFloat(selectedOpt.dataset.markup) || 0;
  const feeRate = parseFloat(selectedOpt.dataset.fee) || 0;
  const isOjol = orderChannelEl.value !== "dinein";

  // Harga di aplikasi ojol dinaikkan sesuai markup agar setelah dipotong komisi, pendapatan bersih toko tetap pas
  const markupAmount = Math.round(baseTotal * markupRate);
  const customerTotal = baseTotal + markupAmount;
  const platformFee = Math.round(customerTotal * feeRate);
  const netIncome = customerTotal - platformFee;

  return {
    baseTotal,
    markupAmount,
    customerTotal,
    platformFee,
    netIncome,
    isOjol,
    channelName: selectedOpt.text.split(" (")[0]
  };
}

function updateCartUI() {
  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<div class="empty-cart">Belum ada menu dipilih. Klik menu di sebelah kiri.</div>`;
  } else {
    cartItemsEl.innerHTML = cart.map(item => `
      <div class="cart-row">
        <div class="cart-row-info">
          <strong>${item.name}</strong>
          <span>${formatRupiah(item.price)} x ${item.qty} = ${formatRupiah(item.price * item.qty)}</span>
        </div>
        <div class="qty-controls">
          <button type="button" class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
          <span>${item.qty}</span>
          <button type="button" class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
        </div>
      </div>
    `).join("");
  }

  const totals = calculateTotals();

  document.getElementById("baseTotal").textContent = formatRupiah(totals.baseTotal);
  document.getElementById("customerTotal").textContent = formatRupiah(totals.customerTotal);
  document.getElementById("netIncome").textContent = formatRupiah(totals.netIncome);

  const markupRow = document.getElementById("markupRow");
  const feeRow = document.getElementById("feeRow");

  if (totals.isOjol && totals.baseTotal > 0) {
    markupRow.style.display = "flex";
    feeRow.style.display = "flex";
    document.getElementById("markupAmount").textContent = "+ " + formatRupiah(totals.markupAmount);
    document.getElementById("platformFee").textContent = "- " + formatRupiah(totals.platformFee);
    channelNoteEl.textContent = `Simulasi ${totals.channelName}: Komisi aplikasi dipotong otomatis, pendapatan bersih tercatat pas.`;
  } else {
    markupRow.style.display = "none";
    feeRow.style.display = "none";
    channelNoteEl.textContent = totals.isOjol
      ? `Simulasi ${totals.channelName}: Komisi aplikasi dipotong otomatis.`
      : "Harga normal toko, pendapatan 100% masuk ke kasir.";
  }

  // Perbarui tampilan QRIS & Kembalian Tunai
  document.getElementById("qrisNominal").textContent = formatRupiah(totals.customerTotal);
  drawDynamicQRIS(totals.customerTotal);
  calculateChange();
}

orderChannelEl.addEventListener("change", updateCartUI);

// ================= METODE PEMBAYARAN & QRIS DINAMIS =================
const payBtns = document.querySelectorAll(".pay-btn");
const cashInputGroup = document.getElementById("cashInputGroup");
const qrisBox = document.getElementById("qrisBox");
const digitalInfoBox = document.getElementById("digitalInfoBox");
const cashReceivedInput = document.getElementById("cashReceived");

payBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    payBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedPayment = btn.dataset.method;

    cashInputGroup.style.display = "none";
    qrisBox.style.display = "none";
    digitalInfoBox.style.display = "none";

    if (selectedPayment === "Tunai") {
      cashInputGroup.style.display = "block";
    } else if (selectedPayment === "QRIS") {
      qrisBox.style.display = "block";
      const totals = calculateTotals();
      drawDynamicQRIS(totals.customerTotal);
    } else {
      digitalInfoBox.style.display = "block";
      const titleEl = document.getElementById("digitalAccountTitle");
      const detailEl = document.getElementById("digitalAccountDetail");
      if (selectedPayment === "DANA") {
        titleEl.textContent = "Pembayaran DANA Merchant";
        detailEl.textContent = "Nomor DANA: 0812-8800-9900 (KasirNusa Official)";
      } else if (selectedPayment === "Transfer Bank") {
        titleEl.textContent = "Transfer Bank (BCA / Mandiri / BRI)";
        detailEl.textContent = "BCA: 8830-1122-33 a.n. PT KasirNusa Kuliner";
      } else {
        titleEl.textContent = "E-Wallet (GoPay / OVO / ShopeePay)";
        detailEl.textContent = "Nomor E-Wallet: 0812-8800-9900 (KasirNusa)";
      }
    }
  });
});

function calculateChange() {
  const totals = calculateTotals();
  const received = parseFloat(cashReceivedInput.value) || 0;
  const change = received - totals.customerTotal;
  const changeEl = document.getElementById("cashChange");
  changeEl.textContent = change >= 0 ? formatRupiah(change) : "Uang kurang";
  changeEl.style.color = change >= 0 ? "#059669" : "#ef4444";
}

cashReceivedInput.addEventListener("input", calculateChange);

// Generator QRIS visual pada Canvas berdasarkan nominal transaksi
function drawDynamicQRIS(amount) {
  const canvas = document.getElementById("qrisCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const size = canvas.width;
  const grid = 21;
  const cell = Math.floor(size / grid);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  // Seed deterministik dari nominal transaksi agar pola QR berubah sesuai total tagihan
  let seed = (amount || 12345) + 98765;
  function pseudoRandom() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  ctx.fillStyle = "#0f172a";

  // Gambar kotak posisi QR (kiri atas, kanan atas, kiri bawah)
  function drawFinder(startX, startY) {
    ctx.fillRect(startX * cell, startY * cell, 7 * cell, 7 * cell);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect((startX + 1) * cell, (startY + 1) * cell, 5 * cell, 5 * cell);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect((startX + 2) * cell, (startY + 2) * cell, 3 * cell, 3 * cell);
  }

  drawFinder(1, 1);
  drawFinder(grid - 8, 1);
  drawFinder(1, grid - 8);

  // Isi modul data QR
  for (let r = 1; r < grid - 1; r++) {
    for (let c = 1; c < grid - 1; c++) {
      const inTopLeft = r < 9 && c < 9;
      const inTopRight = r < 9 && c > grid - 10;
      const inBottomLeft = r > grid - 10 && c < 9;
      if (inTopLeft || inTopRight || inBottomLeft) continue;

      if (pseudoRandom() > 0.48) {
        ctx.fillRect(c * cell, r * cell, cell - 1, cell - 1);
      }
    }
  }
}

// ================= PROSES TRANSAKSI & LAPORAN SISTEM =================
const checkoutBtn = document.getElementById("checkoutBtn");
const resetCartBtn = document.getElementById("resetCartBtn");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

function showToast(message) {
  const toast = document.getElementById("toastNotif");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    showToast("Pilih minimal 1 menu terlebih dahulu!");
    return;
  }

  const totals = calculateTotals();

  if (selectedPayment === "Tunai") {
    const received = parseFloat(cashReceivedInput.value) || 0;
    if (received > 0 && received < totals.customerTotal) {
      showToast("Nominal uang tunai kurang dari total tagihan!");
      return;
    }
  }

  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 5);
  const itemsSummary = cart.map(c => `${c.name} (${c.qty}x)`).join(", ");

  const newTx = {
    id: "TRX-" + (1001 + salesHistory.length),
    time: timeStr,
    channelLabel: totals.channelName,
    isOjol: totals.isOjol,
    itemsSummary,
    method: selectedPayment,
    customerTotal: totals.customerTotal,
    platformFee: totals.platformFee,
    netIncome: totals.netIncome
  };

  salesHistory.unshift(newTx);
  renderSalesReport();

  // Reset keranjang setelah sukses
  cart = [];
  cashReceivedInput.value = "";
  updateCartUI();
  showToast(`Transaksi ${newTx.id} (${selectedPayment}) berhasil masuk ke sistem!`);
});

resetCartBtn.addEventListener("click", () => {
  cart = [];
  cashReceivedInput.value = "";
  updateCartUI();
});

clearHistoryBtn.addEventListener("click", () => {
  salesHistory = [];
  renderSalesReport();
  showToast("Riwayat penjualan dibersihkan.");
});

function renderSalesReport() {
  let netTotal = 0;
  let ojolNetTotal = 0;
  let ojolFeeTotal = 0;
  let qrisTotal = 0;
  let danaTotal = 0;
  let otherEwalletTotal = 0;
  let bankTotal = 0;
  let cashTotal = 0;

  salesHistory.forEach(tx => {
    netTotal += tx.netIncome;
    if (tx.isOjol) {
      ojolNetTotal += tx.netIncome;
      ojolFeeTotal += tx.platformFee;
    }
    if (tx.method === "QRIS") qrisTotal += tx.netIncome;
    else if (tx.method === "DANA") danaTotal += tx.netIncome;
    else if (tx.method === "E-Wallet") otherEwalletTotal += tx.netIncome;
    else if (tx.method === "Transfer Bank") bankTotal += tx.netIncome;
    else if (tx.method === "Tunai") cashTotal += tx.netIncome;
  });

  document.getElementById("repNetTotal").textContent = formatRupiah(netTotal);
  document.getElementById("repTxCount").textContent = `${salesHistory.length} Transaksi Selesai`;
  document.getElementById("repOjolTotal").textContent = formatRupiah(ojolNetTotal);
  document.getElementById("repOjolFee").textContent = `Potongan Komisi: ${formatRupiah(ojolFeeTotal)}`;
  document.getElementById("repQris").textContent = formatRupiah(qrisTotal);
  document.getElementById("repEwallet").textContent = formatRupiah(danaTotal + otherEwalletTotal);
  document.getElementById("repDanaSplit").textContent = `DANA: ${formatRupiah(danaTotal)} | Lainnya: ${formatRupiah(otherEwalletTotal)}`;
  document.getElementById("repBank").textContent = formatRupiah(bankTotal);
  document.getElementById("repCash").textContent = formatRupiah(cashTotal);

  const tbody = document.getElementById("salesTableBody");
  if (salesHistory.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#64748b;">Belum ada data penjualan terekam.</td></tr>`;
    return;
  }

  tbody.innerHTML = salesHistory.map(tx => `
    <tr>
      <td><strong>${tx.id}</strong><br><small>${tx.time} WIB</small></td>
      <td>${tx.channelLabel}</td>
      <td>${tx.itemsSummary}</td>
      <td><span class="badge-method">${tx.method}</span></td>
      <td>${formatRupiah(tx.customerTotal)}</td>
      <td class="text-danger">${tx.platformFee > 0 ? "- " + formatRupiah(tx.platformFee) : "Rp 0"}</td>
      <td><strong class="text-success">${formatRupiah(tx.netIncome)}</strong></td>
    </tr>
  `).join("");
}

// ================= NAVBAR MOBILE, PRICING TOGGLE & FAQ =================
const hamburgerBtn = document.getElementById("hamburgerBtn");
const navMenu = document.getElementById("navMenu");

hamburgerBtn.addEventListener("click", () => {
  navMenu.classList.toggle("active");
});

document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => navMenu.classList.remove("active"));
});

const billingToggle = document.getElementById("billingToggle");
billingToggle.addEventListener("change", () => {
  const isYearly = billingToggle.checked;
  document.querySelectorAll(".price-amount .amount").forEach(el => {
    el.textContent = isYearly ? el.dataset.yearly : el.dataset.monthly;
  });
});

document.querySelectorAll(".faq-question").forEach(btn => {
  btn.addEventListener("click", () => {
    const item = btn.parentElement;
    item.classList.toggle("open");
    const icon = btn.querySelector("span");
    icon.textContent = item.classList.contains("open") ? "−" : "+";
  });
});

// ================= INISIALISASI AWAL =================
renderMenu();
updateCartUI();
renderSalesReport();