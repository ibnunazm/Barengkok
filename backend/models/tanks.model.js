export default (sequelize, DataTypes) => {
  const Tanks = sequelize.define('tanks', {
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
    tableName: 'tanks',
    timestamps: false
  });

  return Tanks;
};
