import cron from 'node-cron';
import { checkAndProcessSubscriptions } from '../services/subscription.service.js';

export const startSubscriptionCronJob = () => {
  // Run every hour at minute 0 (0 * * * *)
  cron.schedule('0 * * * *', async () => {
    console.log('[Cron Job] Running scheduled subscription status verification...');
    try {
      await checkAndProcessSubscriptions();
      console.log('[Cron Job] Subscription check completed successfully.');
    } catch (error) {
      console.error('[Cron Job Error] Failed to process subscriptions:', error.message);
    }
  });

  console.log('[Cron Job] Subscription verification cron job initialized (hourly).');
};
