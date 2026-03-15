import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface AlertAttributes {
  id: number;
  userId: number;
  ticker: string;
  type: 'price_above' | 'price_below' | 'volume_spike' | 'rsi_overbought' | 'rsi_oversold';
  condition: string;
  threshold: number;
  active: boolean;
  lastTriggered: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AlertCreationAttributes extends Optional<AlertAttributes, 'id' | 'active' | 'lastTriggered' | 'createdAt' | 'updatedAt'> {}

class Alert extends Model<AlertAttributes, AlertCreationAttributes> implements AlertAttributes {
  public id!: number;
  public userId!: number;
  public ticker!: string;
  public type!: 'price_above' | 'price_below' | 'volume_spike' | 'rsi_overbought' | 'rsi_oversold';
  public condition!: string;
  public threshold!: number;
  public active!: boolean;
  public lastTriggered!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Alert.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    ticker: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('price_above', 'price_below', 'volume_spike', 'rsi_overbought', 'rsi_oversold'),
      allowNull: false,
    },
    condition: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    threshold: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    lastTriggered: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'alerts',
    modelName: 'Alert',
  }
);

export default Alert;
