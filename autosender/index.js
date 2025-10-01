const express = require("express");
const axios = require("axios");
const cron = require("node-cron");

const app = express();
const PORT = 3000;

// API endpoint
const LAMP_URL = "https://smartvillagebarengkok.com/api/lamp-monitoring";
const TANK_URL = "https://smartvillagebarengkok.com/api/tank-monitoring";

// Basic Auth credentials
const AUTH = {
  username: "cxianz",
  password: "E7r$wT!zKq@2"
};

// Global state baterai (PJU simulasi)
let batteryLevel = 60; // awalnya 60%

// --- UTIL ---
const randomRange = (min, max) => Math.random() * (max - min) + min;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const round2 = v => Math.round(v * 100) / 100;

// Deterministic "random" days per month based on seed
function seededDays(year, month, count, label) {
  const seedStr = `${year}-${month}-${label}`;
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  const days = new Set();
  const maxDay = new Date(year, month, 0).getDate();
  let i = 0;
  while (days.size < count && i < count * 10) {
    h ^= (h << 13) >>> 0;
    h ^= (h >>> 17) >>> 0;
    h ^= (h << 5) >>> 0;
    const day = (h % maxDay) + 1;
    days.add(day);
    i++;
  }
  return Array.from(days);
}

// --- TANK STATE ---
const TANK_CAPACITY = {
  1: 650,   // tank id 1 = 650 L
  2: 1500   // tank id 2 = 1500 L
};
const tankVolume = { 1: 0, 2: 0 };

// Pilihan jadwal bulanan
function getMonthlySchedules() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const refillAfternoonDays = seededDays(year, month, 10, "refill-afternoon");
  const anomalyDays = seededDays(year, month, 5, "anomaly-ph-turb");
  return { refillAfternoonDays, anomalyDays };
}

// Hitung rate per tank
function getRatesForTank(capacity) {
  const fillEarlyRate = capacity / 60.0 * 0.9;
  const moderateUseRate = capacity * 0.0025;
  const peakUseRate = capacity * 0.02;
  const refillAfternoonRate = capacity / (2 * 60);
  return { fillEarlyRate, moderateUseRate, peakUseRate, refillAfternoonRate };
}

// --- GENERATE TANK DATA ---
function generateTankData(tankId) {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const capacity = TANK_CAPACITY[tankId] || 1000;
  const rates = getRatesForTank(capacity);

  const { refillAfternoonDays, anomalyDays } = getMonthlySchedules();
  const todayDate = now.getDate();
  const isRefillAfternoonToday = refillAfternoonDays.includes(todayDate);
  const isAnomalyToday = anomalyDays.includes(todayDate);

  if (hour === 0 && minute === 0) tankVolume[tankId] = 0;
  if (hour < 5) tankVolume[tankId] = 0;

  if (hour >= 5 && hour < 6) {
    const add = rates.fillEarlyRate * randomRange(0.6, 1.1);
    tankVolume[tankId] = clamp(Math.round(tankVolume[tankId] + add), 0, capacity);
  } else if (hour >= 6 && hour < 10) {
    const use = rates.moderateUseRate * randomRange(0.6, 1.2);
    tankVolume[tankId] = clamp(Math.round(tankVolume[tankId] - use), 0, capacity);
  } else if (hour === 10 && minute < 30) {
    const use = rates.peakUseRate * randomRange(0.8, 1.2);
    tankVolume[tankId] = clamp(Math.round(tankVolume[tankId] - use), 0, capacity);
  } else if (hour === 10 && minute >= 30) {
    const use = rates.moderateUseRate * randomRange(0.2, 0.6);
    tankVolume[tankId] = clamp(Math.round(tankVolume[tankId] - use), 0, capacity);
  } else if (hour >= 11 && hour < 12) {
    const add = (capacity * 0.9) / 60 * randomRange(0.6, 1.0);
    tankVolume[tankId] = clamp(Math.round(tankVolume[tankId] + add), 0, capacity);
  } else if (hour >= 12 && hour < 14) {
    const use = rates.moderateUseRate * randomRange(0.5, 1.1);
    tankVolume[tankId] = clamp(Math.round(tankVolume[tankId] - use), 0, capacity);
  } else if (hour >= 14 && hour < 16) {
    if (isRefillAfternoonToday) {
      const add = rates.refillAfternoonRate * randomRange(0.8, 1.2);
      tankVolume[tankId] = clamp(Math.round(tankVolume[tankId] + add), 0, capacity);
    } else {
      const use = rates.moderateUseRate * randomRange(0.4, 1.0);
      tankVolume[tankId] = clamp(Math.round(tankVolume[tankId] - use), 0, capacity);
    }
  } else if (hour >= 16 && hour < 18) {
    const use = rates.moderateUseRate * randomRange(0.3, 0.8);
    tankVolume[tankId] = clamp(Math.round(tankVolume[tankId] - use), 0, capacity);
  } else if (hour >= 18 && hour < 24) {
    const add = (capacity * 0.1) / (6 * 60) * randomRange(0.3, 1.0);
    tankVolume[tankId] = clamp(Math.round(tankVolume[tankId] + add), 0, capacity);
  }

  // --- turbidity & ph ---
  let turbidity = Math.round(randomRange(1, 5)); // integer
  let ph = round2(randomRange(6.5, 8.0));

  if (isAnomalyToday) {
    if (Math.random() < 0.2) turbidity = Math.round(randomRange(6, 15));
    if (Math.random() < 0.15) {
      if (Math.random() < 0.5) ph = round2(randomRange(5.0, 6.4));
      else ph = round2(randomRange(8.1, 9.5));
    }
  }

  return {
    tank_id: tankId,
    turbidity: turbidity,
    ph: ph,
    volume: Math.round(tankVolume[tankId])
  };
}

// --- POST TANK ---
async function postTankData(tankId) {
  const data = generateTankData(tankId);
  try {
    const res = await axios.post(TANK_URL, data, { auth: AUTH });
    console.log(`✅ Tank ${tankId} OK [${res.status}]`, data);
  } catch (err) {
    console.error(`❌ Tank ${tankId} Gagal:`, err.response?.data || err.message);
  }
}

// --- LAMPU ---
function generateLampData() {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  let inputCurrent = 0;
  let lightIntensity = 0;
  let batteryUsage = 0;
  let battery = batteryLevel;

  if (hour >= 8 && hour < 16) {
    inputCurrent = randomRange(2, 5);
    lightIntensity = randomRange(50, 90);
    battery = Math.min(100, battery + randomRange(0.2, 0.5));
  } else if (hour >= 16 && hour < 18) {
    inputCurrent = randomRange(0.5, 2);
    lightIntensity = randomRange(10, 40);
    battery = Math.min(100, battery + randomRange(0.1, 0.2));
  } else if ((hour === 18 && minute >= 10) || hour > 18 || hour < 6) {
    inputCurrent = 0;
    lightIntensity = 0;
    batteryUsage = randomRange(45, 60);
    battery = Math.max(20, battery - randomRange(0.2, 0.5));
  } else if (hour >= 6 && hour < 8) {
    inputCurrent = randomRange(1, 3);
    lightIntensity = randomRange(20, 50);
    battery = Math.min(100, battery + randomRange(0.1, 0.3));
  }

  batteryLevel = battery;

  return {
    battery_capacity: Math.round(battery),
    input_current: parseFloat(inputCurrent.toFixed(2)),
    light_intensity: Math.round(lightIntensity),
    battery_usage: Math.round(batteryUsage),
  };
}

async function postLampData(lampId) {
  const data = { lamp_id: lampId, ...generateLampData() };
  try {
    const res = await axios.post(LAMP_URL, data, { auth: AUTH });
    console.log(`✅ Lampu ${lampId} OK [${res.status}]`, data);
  } catch (err) {
    console.error(`❌ Lampu ${lampId} Gagal:`, err.response?.data || err.message);
  }
}

// --- KIRIM SEMUA DATA ---
async function sendData() {
  const now = new Date().toLocaleTimeString();
  console.log(`\n[${now}] Kirim data monitoring...`);
  for (let i = 1; i <= 6; i++) await postLampData(i);
  for (let i = 1; i <= 2; i++) await postTankData(i);
}

// Schedule tiap 1 menit
cron.schedule("0 * * * *", () => sendData());

// Express server monitoring
app.get("/", (req, res) => {
  res.send("🚀 Server simulasi PJU & Tank aktif (Basic Auth enabled, tiap 1 menit)");
});

app.listen(PORT, () => {
  console.log(`✅ Server jalan di http://localhost:${PORT}`);
  console.log("⏱ Mulai auto POST setiap 1 menit...");
});
