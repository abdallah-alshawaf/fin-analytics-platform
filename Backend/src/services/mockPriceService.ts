/**
 * Mock price service that returns deterministic historical prices for assets.
 * This is a simple simulator: base price + small sinusoidal variation by date.
 */
import Decimal from 'decimal.js';

const basePrices: Record<string, number> = {
  BTC: 40000,
  ETH: 2000,
  AAPL: 150,
  TSLA: 800
};

const dayMs = 24 * 60 * 60 * 1000;

export const getPriceAt = (symbol: string, date: Date) => {
  const base = basePrices[symbol] ?? 100;
  const days = Math.floor(date.getTime() / dayMs);
  // deterministic pseudo-fluctuation
  const fluct = Math.sin(days / 10) * (base * 0.05); // +/-5%
  const price = new Decimal(base).plus(fluct).toNumber();
  return price;
};

export const getLatestPrice = (symbol: string) => getPriceAt(symbol, new Date());

export default { getPriceAt, getLatestPrice };
