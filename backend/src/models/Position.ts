import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface PositionAttributes {
  id: number;
  portfolioId: number;
  ticker: string;
  quantity: number;
  buyPrice: number;
  buyDate: Date;
  sellPrice: number | null;
  sellDate: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PositionCreationAttributes extends Optional<PositionAttributes, 'id' | 'sellPrice' | 'sellDate' | 'createdAt' | 'updatedAt'> {}

class Position extends Model<PositionAttributes, PositionCreationAttributes> implements PositionAttributes {
  public id!: number;
  public portfolioId!: number;
  public ticker!: string;
  public quantity!: number;
  public buyPrice!: number;
  public buyDate!: Date;
  public sellPrice!: number | null;
  public sellDate!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Position.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    portfolioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'portfolios', key: 'id' },
    },
    ticker: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: false,
    },
    buyPrice: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: false,
    },
    buyDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    sellPrice: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: true,
    },
    sellDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'positions',
    modelName: 'Position',
  }
);

export default Position;
