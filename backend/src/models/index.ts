import User from './User';
import Portfolio from './Portfolio';
import Position from './Position';
import Alert from './Alert';
import StockData from './StockData';

// User -> Portfolio (one-to-many)
User.hasMany(Portfolio, { foreignKey: 'userId', as: 'portfolios' });
Portfolio.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Portfolio -> Position (one-to-many)
Portfolio.hasMany(Position, { foreignKey: 'portfolioId', as: 'positions' });
Position.belongsTo(Portfolio, { foreignKey: 'portfolioId', as: 'portfolio' });

// User -> Alert (one-to-many)
User.hasMany(Alert, { foreignKey: 'userId', as: 'alerts' });
Alert.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { User, Portfolio, Position, Alert, StockData };
