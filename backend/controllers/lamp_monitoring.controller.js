import db from '../models/index.js';
const { LampMonitoring, Lamp } = db;

const getAllMonitoring = async (req, res) => {
  try {
    const data = await LampMonitoring.findAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateStatus = async (req, res) => {
  const { lamp_id, battery_capacity, input_current, light_intensity, battery_usage } = req.body;

  if (!Number.isInteger(lamp_id)) {
    return res.status(400).json({ error: 'lamp_id harus berupa bilangan bulat' });
  }

  if (typeof battery_capacity !== 'number' || battery_capacity < 0) {
    return res.status(400).json({ error: 'battery_capacity harus berupa angka positif' });
  }

  if (typeof input_current !== 'number') {
    return res.status(400).json({ error: 'input_current harus berupa angka' });
  }

  if (typeof light_intensity !== 'number' || light_intensity < 0) {
    return res.status(400).json({ error: 'light_intensity harus berupa angka >= 0' });
  }

  if (typeof battery_usage !== 'number' || battery_usage < 0) {
    return res.status(400).json({ error: 'battery_usage harus berupa angka >= 0' });
  }

  try {
    const data = await LampMonitoring.create({
      lamp_id,
      battery_capacity,
      input_current,
      light_intensity,
      battery_usage
    });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createLamp = async (req, res) => {
  try {
    const { name, latitude, longitude } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Nama lampu tidak boleh kosong.' });
    }

    if (latitude !== undefined && (isNaN(latitude) || latitude < -90 || latitude > 90)) {
      return res.status(400).json({ message: 'Latitude harus berupa angka antara -90 hingga 90.' });
    }

    if (longitude !== undefined && (isNaN(longitude) || longitude < -180 || longitude > 180)) {
      return res.status(400).json({ message: 'Longitude harus berupa angka antara -180 hingga 180.' });
    }

    const newLamp = await Lamp.create({
      name,
      latitude: latitude || null,
      longitude: longitude || null
    });

    res.status(201).json({
      message: 'Lampu berhasil dibuat.',
      data: newLamp
    });

  } catch (error) {
    console.error('Gagal membuat lampu:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
}

const getAllLamp = async (req, res) => {
  try {
    const lamps = await Lamp.findAll({order: [['id', 'ASC']]});
    res.status(200).json(lamps);
  } catch (error) {
    console.error('Gagal mengambil data lamp:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data lamp.' });
  }
};

const updateLampLocation = async (req, res) => {
  const { lamp_id, latitude, longitude } = req.body;

  if (!Number.isInteger(lamp_id)) {
    return res.status(400).json({ error: 'lamp_id harus berupa bilangan bulat' });
  }

  if (latitude !== undefined && (isNaN(latitude) || latitude < -90 || latitude > 90)) {
    return res.status(400).json({ error: 'Latitude harus berupa angka antara -90 hingga 90.' });
  }

  if (longitude !== undefined && (isNaN(longitude) || longitude < -180 || longitude > 180)) {
    return res.status(400).json({ error: 'Longitude harus berupa angka antara -180 hingga 180.' });
  }

  try {
    const lamp = await Lamp.findByPk(lamp_id);

    if (!lamp) {
      return res.status(404).json({ message: 'Lampu tidak ditemukan.' });
    }

    lamp.latitude = latitude ?? lamp.latitude;
    lamp.longitude = longitude ?? lamp.longitude;

    await lamp.save();

    res.status(200).json({ message: 'Lokasi lampu berhasil diperbarui.', data: lamp });

  } catch (error) {
    console.error('Gagal memperbarui lokasi lampu:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
};

export default { getAllMonitoring, createLamp, getAllLamp, updateStatus, updateLampLocation};
