/*
 * timers and cron for account related actions
 */

import { populateRanking } from '../data/sql/RegUser';
import {
  getRanks,
  resetDailyRanks,
  getPrevTop,
  getOnlineUserStats,
  storeOnlinUserAmount,
  getCountryDailyHistory,
  getCountryRanks,
  getTopDailyHistory,
  storeHourlyPixelsPlaced,
  getHourlyPixelStats,
  getDailyPixelStats,
  populateDailyTotal,
} from '../data/redis/ranks';
import socketEvents from '../socket/socketEvents';
import logger from './logger';

import { MINUTE } from './constants';
import { DailyCron, HourlyCron } from '../utils/cron';

class Ranks {
  constructor() {
    this.ranks = {
      // ranking today of users by pixels
      dailyRanking: [],
      // ranking of users by pixels
      ranking: [],
      // ranking today of countries by pixels
      dailyCRanking: [],
      // yesterdays ranking of users by pixels
      prevTop: [],
      // online user amount by hour
      onlineStats: [],
      // ranking of countries by day
      cHistStats: [],
      // ranking of users by day
      histStats: [],
      // pixels placed by hour
      pHourlyStats: [],
      // pixels placed by day
      pDailyStats: [],
    };
    /*
     * we go through socketEvents for sharding
     */
    socketEvents.on('rankingListUpdate', (rankings) => {
      this.ranks = {
        ...this.ranks,
        ...rankings,
      };
    });
  }

  async initialize() {
    await populateDailyTotal();
    try {
      let someRanks = await Ranks.dailyUpdateRanking();
      this.ranks = {
        ...this.ranks,
        ...someRanks,
      };
      someRanks = await Ranks.hourlyUpdateRanking();
      this.ranks = {
        ...this.ranks,
        ...someRanks,
      };
      await Ranks.updateRanking();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`Error initialize ranks: ${err.message}`);
    }
    setInterval(Ranks.updateRanking, 5 * MINUTE);
    HourlyCron.hook(Ranks.setHourlyRanking);
    DailyCron.hook(Ranks.setDailyRanking);
  }

  static async updateRanking() {
    // only main shard does it
    if (!socketEvents.amIImportant()) {
      return null;
    }
    const ranking = await populateRanking(
      await getRanks(
        false,
        1,
        100,
      ));
    const dailyRanking = await populateRanking(
      await getRanks(
        true,
        1,
        100,
      ));
    const dailyCRanking = await getCountryRanks(1, 100);
    const ret = {
      ranking,
      dailyRanking,
      dailyCRanking,
    };
    socketEvents.rankingListUpdate(ret);
    return ret;
  }

  static async hourlyUpdateRanking() {
    const onlineStats = await getOnlineUserStats();
    const cHistStats = await getCountryDailyHistory();
    const histStats = await getTopDailyHistory();
    histStats.users = await populateRanking(histStats.users);
    const pHourlyStats = await getHourlyPixelStats();
    const ret = {
      onlineStats,
      cHistStats,
      histStats,
      pHourlyStats,
    };
    if (socketEvents.amIImportant()) {
      // only main shard sends to others
      socketEvents.rankingListUpdate(ret);
    }
    return ret;
  }

  static async dailyUpdateRanking() {
    const prevTop = await populateRanking(
      await getPrevTop(),
    );
    const pDailyStats = await getDailyPixelStats();
    const ret = {
      prevTop,
      pDailyStats,
    };
    if (socketEvents.amIImportant()) {
      // only main shard sends to others
      socketEvents.rankingListUpdate(ret);
    }
    return ret;
  }

  static async setHourlyRanking() {
    if (!socketEvents.amIImportant()) {
      return;
    }
    const amount = socketEvents.onlineCounter.total;
    await storeOnlinUserAmount(amount);
    await storeHourlyPixelsPlaced();
    await Ranks.hourlyUpdateRanking();
  }

  /*
   * reset daily rankings, store previous rankings
   */
  static async setDailyRanking() {
    if (!socketEvents.amIImportant()) {
      return;
    }
    logger.info('Resetting Daily Ranking');
    await resetDailyRanks();
    await Ranks.dailyUpdateRanking();
  }
}


const rankings = new Ranks();
export default rankings;
