export default (sequelize, DataTypes) => {
  return sequelize.define('tank_monitoring', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    tank_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    turbidity: {
      type: DataTypes.INTEGER
    },
    ph: {
      type: DataTypes.FLOAT
    },
    volume: {
      type: DataTypes.FLOAT
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'tank_monitoring',
    timestamps: false
  });
};
