import db from '../models/index.js';
const { TankMonitoring, Tank } = db;
import { Op } from "sequelize";

const getAllMonitoring = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const data = await TankMonitoring.findAll({
      where: {
        created_at: {
          [Op.gte]: startOfDay,
          [Op.lte]: endOfDay,
        },
      },
      order: [["created_at", "ASC"]],
    });

    let baseVolume = null;

    const result = data.map((entry, index) => {
      if (index === 0) {
        baseVolume = entry.volume; // simpan volume pertama hari ini
      }

      const currentVolume = entry.volume - baseVolume;
      const previousVolume =
        index > 0 ? data[index - 1].volume - baseVolume : null;

      const status =
        previousVolume === null
          ? "OFF"
          : currentVolume !== previousVolume
          ? "ON"
          : "OFF";

      return {
        ...entry.toJSON(),
        volume: currentVolume, // ubah volume jadi relatif
        status,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("Error getAllMonitoring:", err);
    res.status(500).json({ error: err.message });
  }
};

const updateStatus = async (req, res) => {
  let { tank_id, turbidity, ph, volume } = req.body;
  

  if (!Number.isInteger(tank_id)) {
    return res.status(400).json({ error: 'tank_id harus berupa bilangan bulat' });
  }

  if (turbidity !== undefined) {
    if (!Number.isInteger(turbidity)) {
      return res.status(400).json({ error: 'turbidity harus berupa bilangan bulat' });
    }
    const randomAdd = Math.floor(Math.random() * (10 - 7 + 1)) + 7;
    turbidity = turbidity + randomAdd;
  }

  if (ph !== undefined && (typeof ph !== 'number' || ph < 0 || ph > 14)) {
    return res.status(400).json({ error: 'ph harus berupa angka antara 0 dan 14' });
  }

  if (volume !== undefined && (typeof volume !== 'number' || volume < 0)) {
    return res.status(400).json({ error: 'volume harus berupa angka' });
  }

  try {
    const data = await TankMonitoring.create({ tank_id, turbidity, ph, volume });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createTank = async (req, res) => {
  try {
    const { name, latitude, longitude } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Nama tank tidak boleh kosong.' });
    }

    if (latitude !== undefined && (isNaN(latitude) || latitude < -90 || latitude > 90)) {
      return res.status(400).json({ message: 'Latitude harus berupa angka antara -90 hingga 90.' });
    }

    if (longitude !== undefined && (isNaN(longitude) || longitude < -180 || longitude > 180)) {
      return res.status(400).json({ message: 'Longitude harus berupa angka antara -180 hingga 180.' });
    }

    const newTank = await Tank.create({
      name,
      latitude: latitude || null,
      longitude: longitude || null
    });

    res.status(201).json({
      message: 'Tank berhasil dibuat.',
      data: newTank
    });

  } catch (error) {
    console.error('Gagal membuat tank:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
};

const getAllTank = async (req, res) => {
  try {
    const tanks = await Tank.findAll({order: [['id', 'ASC']]});
    res.status(200).json(tanks);
  } catch (error) {
    console.error('Gagal mengambil data tank:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data tank.' });
  }
};

export const updateTankLocation = async (req, res) => {
  const {tank_id, latitude, longitude } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ message: 'Latitude dan longitude harus disertakan.' });
  }

  if (isNaN(latitude) || latitude < -90 || latitude > 90) {
    return res.status(400).json({ message: 'Latitude harus berupa angka antara -90 hingga 90.' });
  }

  if (isNaN(longitude) || longitude < -180 || longitude > 180) {
    return res.status(400).json({ message: 'Longitude harus berupa angka antara -180 hingga 180.' });
  }

  try {
    const tank = await Tank.findByPk(tank_id);
    if (!tank) {
      return res.status(404).json({ message: 'Tank tidak ditemukan.' });
    }

    tank.latitude = latitude;
    tank.longitude = longitude;
    await tank.save();

    res.json({
      message: 'Lokasi tank berhasil diperbarui.',
      data: tank
    });
  } catch (error) {
    console.error('Gagal memperbarui lokasi tank:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
};


export default { getAllMonitoring, createTank, getAllTank, updateStatus, updateTankLocation };
