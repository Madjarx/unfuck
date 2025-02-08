// src/bot.ts
import { Context, Telegraf, session } from "telegraf";
import { config } from "dotenv";
import { message } from 'telegraf/filters';
import { ReferralService } from './Services/ReferralService';

import {
    CommandsManager,
    ScenesManager,
    ButtonsManager,
    MessagesManager,
    GroupEventsManager
} from "./Managers";

/** Load the ENV */
config({
    path: require("path").resolve(__dirname, "../.env")
});

const requiredEnvVars = [
    'BOT_TOKEN',
    'GROUP_INVITE_LINK',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY'
];

// Validate environment variables
for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
        console.error(`Error: ${varName} is not set in environment variables`);
        process.exit(1);
    }
}

async function main() {
    const botToken = process.env.BOT_TOKEN!;
    const bot = new Telegraf<Context>(botToken);
    
    // Enable session middleware
    bot.use(session());

    // Setup services
    // const referralService = new ReferralService(bot);

    // Global error handler
    bot.catch((err, ctx) => {
        console.error('Error while handling update:', err);
    });

    // Debug middleware
    // bot.use(async (ctx, next) => {
    //     const start = new Date();
    //     console.log('New update received:', ctx.update);
        
    //     try {
    //         await next();
    //         const ms = new Date().getTime() - start.getTime();
    //         console.log('Response time: %sms', ms);
    //     } catch (error) {
    //         console.error('Error in middleware:', error);
    //     }
    // });

    /* Initialize Managers */
    new GroupEventsManager(bot);
    new CommandsManager(bot);
    new ButtonsManager(bot);
    new MessagesManager(bot);

    try {
        console.log('Starting the bot...');
        await bot.launch();
        console.log('Bot successfully started!');
    } catch (err) {
        console.error("Error encountered when starting the bot:", err);
        process.exit(1);
    }

    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

export async function launchBot() {
    await main();
}