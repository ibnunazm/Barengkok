export default (sequelize, DataTypes) => {
  const Lamps = sequelize.define('lamps', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: DataTypes.STRING,
    latitude: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    longitude: {
      type: DataTypes.DOUBLE,
      allowNull: true
    }
  }, {
    tableName: 'lamps',
    timestamps: false
  });

  return Lamps;
};
