import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface StockDataAttributes {
  id: number;
  ticker: string;
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StockDataCreationAttributes extends Optional<StockDataAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class StockData extends Model<StockDataAttributes, StockDataCreationAttributes> implements StockDataAttributes {
  public id!: number;
  public ticker!: string;
  public date!: Date;
  public open!: number;
  public high!: number;
  public low!: number;
  public close!: number;
  public volume!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StockData.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ticker: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    open: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: false,
    },
    high: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: false,
    },
    low: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: false,
    },
    close: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: false,
    },
    volume: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'stock_data',
    modelName: 'StockData',
    indexes: [
      { fields: ['ticker', 'date'], unique: true },
      { fields: ['ticker'] },
    ],
  }
);

export default StockData;
