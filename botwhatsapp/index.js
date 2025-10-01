import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} from "@whiskeysockets/baileys";
import { Sequelize, DataTypes, Op } from "sequelize";
import dotenv from "dotenv";
import pino from "pino";
import qrcode from "qrcode-terminal";

dotenv.config();

// === Konfigurasi Database & Model ===
const sequelize = new Sequelize("barengkok", "postgres", "Kelinci11", {
  host: "localhost",
  port: 5432,
  dialect: "postgres",
  logging: false,
});

// Model Lamp
const Lamp = sequelize.define(
  "lamps",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: DataTypes.STRING,
    latitude: DataTypes.DOUBLE,
    longitude: DataTypes.DOUBLE,
  },
  { tableName: "lamps", timestamps: false }
);

// Model Lamp Monitoring
const LampMonitoring = sequelize.define(
  "lamp_monitoring",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    lamp_id: DataTypes.INTEGER,
    battery_capacity: DataTypes.FLOAT,
    input_current: DataTypes.FLOAT,
    light_intensity: DataTypes.FLOAT,
    battery_usage: DataTypes.FLOAT,
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: "lamp_monitoring", timestamps: false }
);

// Model Toren
const Tank = sequelize.define(
  "tanks",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: DataTypes.STRING,
    latitude: DataTypes.DOUBLE,
    longitude: DataTypes.DOUBLE,
  },
  { tableName: "tanks", timestamps: false }
);

// Model Toren Monitoring
const TankMonitoring = sequelize.define(
  "tank_monitoring",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tank_id: DataTypes.INTEGER,
    turbidity: DataTypes.INTEGER,
    ph: DataTypes.FLOAT,
    volume: DataTypes.FLOAT,
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: "tank_monitoring", timestamps: false }
);

// Relasi
Lamp.hasMany(LampMonitoring, { foreignKey: "lamp_id" });
LampMonitoring.belongsTo(Lamp, { foreignKey: "lamp_id" });
Tank.hasMany(TankMonitoring, { foreignKey: "tank_id" });
TankMonitoring.belongsTo(Tank, { foreignKey: "tank_id" });

// === Fungsi Bot ===
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: "silent" }),
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      console.log("📱 Scan QR code berikut di WhatsApp untuk login bot:");
      qrcode.generate(qr, { small: true }); 
    }
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;
      if (shouldReconnect) {
        startBot();
      }
    } else if (connection === "open") {
      console.log("✅ WhatsApp bot terhubung");
    }
  });

  // === Respon Pesan ===
  sock.ev.on("messages.upsert", async (m) => {
    console.log("📝 pesan masuk:", JSON.stringify(m, null, 2));

    const msg = m.messages[0];

    const from = msg.key.remoteJid;
    const text =
      msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    console.log(`Pesan dari ${from}: ${text}`);

    if (text.startsWith("lampu")) {
      const lampId = parseInt(text.replace("lampu", ""), 10);
      if (isNaN(lampId)) {
        return sock.sendMessage(from, {
          text: "❌ Format salah. Contoh: lampu1",
        });
      }

      const lamp = await Lamp.findByPk(lampId, {
        include: [
          { model: LampMonitoring, limit: 1, order: [["created_at", "DESC"]] },
        ],
      });

      if (!lamp) {
        return sock.sendMessage(from, {
          text: `❌ Lampu ID ${lampId} tidak ditemukan.`,
        });
      }

      const latest = lamp.lamp_monitorings?.[0];
      if (!latest) {
        return sock.sendMessage(from, {
          text: `❌ Tidak ada data monitoring untuk Lampu ${lamp.name}`,
        });
      }

      const reply = `💡 ${lamp.name}
Battery: ${latest.battery_capacity}%
Input Current: ${latest.input_current} A
Light Intensity: ${latest.light_intensity} %
Battery Usage: ${latest.battery_usage} A
Waktu: ${latest.created_at}`;
      await sock.sendMessage(from, { text: reply });
    }

    if (text.startsWith("toren")) {
      const tankId = parseInt(text.replace("toren", ""), 10);
      if (isNaN(tankId)) {
        return sock.sendMessage(from, {
          text: "❌ Format salah. Contoh: toren1",
        });
      }

      const tank = await Tank.findByPk(tankId, {
        include: [
          { model: TankMonitoring, limit: 1, order: [["created_at", "DESC"]] },
        ],
      });

      if (!tank) {
        return sock.sendMessage(from, {
          text: `❌ Toren ID ${tankId} tidak ditemukan.`,
        });
      }

      const latest = tank.tank_monitorings?.[0];
      if (!latest) {
        return sock.sendMessage(from, {
          text: `❌ Tidak ada data monitoring untuk Toren ${tank.name}`,
        });
      }

      const reply = `🚰 Toren ${tank.name} (${tank.id})
Volume: ${latest.volume} L
Turbidity: ${latest.turbidity} NTU
pH: ${latest.ph}
Waktu: ${latest.created_at}`;
      await sock.sendMessage(from, { text: reply });
    }
  });

  // === Cek Anomali Tiap Jam ===
  setInterval(async () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const lamps = await Lamp.findAll({
      include: [
        {
          model: LampMonitoring,
          where: { created_at: { [Op.gte]: oneDayAgo } },
        },
      ],
    });

    for (const lamp of lamps) {
      const records = lamp.lamp_monitorings;
      if (records.length > 0) {
        const allBatteryZero = records.every((r) => r.battery_capacity === 0);
        const allCurrentZero = records.every((r) => r.input_current === 0);

        if (allBatteryZero) {
          await sock.sendMessage("6285776509353@s.whatsapp.net", {
            text: `⚠️ Lampu ${lamp.name} battery 0% selama 24 jam!`,
          });
        }
        if (allCurrentZero) {
          await sock.sendMessage("6285776509353@s.whatsapp.net", {
            text: `⚠️ Lampu ${lamp.name} arus masuk 0 selama 24 jam!`,
          });
        }
      }
    }
  }, 60 * 60 * 1000);
}

// === Jalankan Bot ===
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database terhubung");
    startBot();
  })
  .catch((err) => {
    console.error("❌ Gagal koneksi database:", err);
  });
