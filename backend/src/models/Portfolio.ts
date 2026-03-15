import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface PortfolioAttributes {
  id: number;
  name: string;
  type: 'virtual' | 'real';
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PortfolioCreationAttributes extends Optional<PortfolioAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Portfolio extends Model<PortfolioAttributes, PortfolioCreationAttributes> implements PortfolioAttributes {
  public id!: number;
  public name!: string;
  public type!: 'virtual' | 'real';
  public userId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Portfolio.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('virtual', 'real'),
      allowNull: false,
      defaultValue: 'virtual',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
  },
  {
    sequelize,
    tableName: 'portfolios',
    modelName: 'Portfolio',
  }
);

export default Portfolio;
