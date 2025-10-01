import express from "express";
import pino from "pino";
import qrcode from "qrcode-terminal";
import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} from "@whiskeysockets/baileys";

const app = express();
app.use(express.json()); // native express json parser

let sock;

// Objek untuk menyimpan nilai terbaru
let latestData = {
  tds: null,
  flow: null,
  ph: null,
  suhu: null,
};

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");
  sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      console.log("📱 Scan QR code berikut di WhatsApp:");
      qrcode.generate(qr, { small: true });
    }
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        console.log("🔄 Reconnecting...");
        startBot();
      }
    } else if (connection === "open") {
      console.log("✅ Bot WhatsApp berhasil terhubung!");
    }
  });

  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0];
    if (!msg.message) return;

    const sender = msg.key.remoteJid;
    const text =
      msg.message.conversation || msg.message.extendedTextMessage?.text || "";

    console.log(`Pesan masuk dari ${sender}: ${text}`);

    if (text.toLowerCase() === "suhu") {
      await sock.sendMessage(sender, {
        text: `suhu: ${latestData.suhu || "belum ada data"}`,
      });
    } else if (text.toLowerCase() === "ph") {
      await sock.sendMessage(sender, {
        text: `ph: ${latestData.ph || "belum ada data"}`,
      });
    } else if (text.toLowerCase() === "tds") {
      await sock.sendMessage(sender, {
        text: `tds: ${latestData.tds || "belum ada data"}`,
      });
    } else if (text.toLowerCase() === "flow") {
      await sock.sendMessage(sender, {
        text: `flow: ${latestData.flow || "0"}`,
      });
    } else if (text.toLowerCase() === "data") {
      const message = `Data Terbaru:
TDS: ${latestData.tds || "belum ada data"}
Flow: ${latestData.flow || "0"}
PH: ${latestData.ph || "belum ada data"}
Suhu: ${latestData.suhu || "belum ada data"}`;
      await sock.sendMessage(sender, { text: message });
    }
  });
}

// Endpoint API untuk menerima data
app.post("/send-data", (req, res) => {
  const { tds, flow, ph, suhu } = req.body;
  if (!tds || !ph || !suhu) {
    return res
      .status(400)
      .send("Semua parameter (tds, flow, ph, suhu) harus diisi.");
  }

  latestData = { tds, flow, ph, suhu };
  console.log("Data diperbarui:", latestData);
  res.status(200).send("Data berhasil diperbarui.");
});

// Endpoint ambil data
app.get("/get-data", (req, res) => {
  res.status(200).json(latestData);
});

// Jalankan server API
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server API berjalan di http://localhost:${PORT}`);
  startBot();
});
