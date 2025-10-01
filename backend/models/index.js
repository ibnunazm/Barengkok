import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import LampModel from './lamps.model.js';
import TankModel from './tanks.model.js';
import LampMonitoringModel from './lamp_monitoring.model.js';
import TankMonitoringModel from './tank_monitoring.model.js';

dotenv.config();

const sequelize = new Sequelize(
  "barengkok",
  "cxianz",
  "Kelinci11",
  {
    host: 'localhost',
    dialect: 'postgres',
    logging: false,
  }
);

const Lamp = LampModel(sequelize, DataTypes);
const Tank = TankModel(sequelize, DataTypes);
const LampMonitoring = LampMonitoringModel(sequelize, DataTypes);
const TankMonitoring = TankMonitoringModel(sequelize, DataTypes);

Lamp.hasMany(LampMonitoring, { foreignKey: 'lamp_id' });
LampMonitoring.belongsTo(Lamp, { foreignKey: 'lamp_id' });

Tank.hasMany(TankMonitoring, { foreignKey: 'tank_id' });
TankMonitoring.belongsTo(Tank, { foreignKey: 'tank_id' });

const db = {
  sequelize,
  Sequelize,
  Lamp,
  Tank,
  LampMonitoring,
  TankMonitoring,
};

export default db;
