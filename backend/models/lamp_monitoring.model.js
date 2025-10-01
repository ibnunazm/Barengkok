export default (sequelize, DataTypes) => {
  return sequelize.define('lamp_monitoring', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    lamp_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    battery_capacity: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    input_current: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    light_intensity: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    battery_usage: { 
      type: DataTypes.FLOAT,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'lamp_monitoring',
    timestamps: false
  });
};
