// src/Managers/Messages/MessagesManager.ts
import { Manager } from "../Manager";
import { Context, Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { ContentFilterService, MessageCleanupService } from "../../Services/ContentFilterService";

export class MessagesManager extends Manager {

    private contentFilter: ContentFilterService;
    private messageCleanup: MessageCleanupService;

    constructor(bot: Telegraf<Context>) {
        super(bot);
        this.contentFilter = new ContentFilterService();
        this.messageCleanup = new MessageCleanupService();
        this._setupMessageHandlers();
        console.log('MessagesManager initialized');
    }


    private _setupMessageHandlers() {

        // Handle ALL messages first to log them
        // this._bot.on('message', (ctx, next) => {
        //     // console.log('Raw message received:', JSON.stringify(ctx.message, null, 2));
        //     return next();
        // });

        this._bot.on(message('text'), async (ctx, next) => {
            if (ctx.chat?.type === 'private') {
                return next();
            }

            try {
                if (await this.contentFilter.containsBannedContent(ctx.message.text)) {
                    await this.messageCleanup.handleInappropriateMessage(
                        ctx,
                        ctx.from.id
                    );
                    return;
                }
            } catch (error) {
                console.error('Error in content filter:', error);
            }

            return next();
        });

        // Handle private messages
        this._bot.on(message('text'), async (ctx, next) => {
            if (ctx.chat?.type === 'private' && !ctx.message.text.startsWith('/')) {
                await ctx.reply('You sent a message that is not a registered command');
            }
            return next();
        });

        // Handle web app data specifically
        // this._bot.on('message', async (ctx) => {
        //     // this._bot.on(message('web_app_data'), async (ctx) => { // THIS WONT FUCKING HIT JESUS FUCKING CHRIST

        //     // @ts-ignore
        //     // console.log('Web app data received:', ctx.message?.web_app_data.data);
        //     // console.log(ctx)

        //     // try {

        //     //     // @ts-ignore
        //     //     const data = ctx.message.web_app_data.data;
        //     //     console.log('Parsed web app data:', data);

        //     //     if (data === 'verification_success') {
        //     //         console.log('Processing verification success for user:', data);

        //     //         // Send group invite
        //     //         try {
        //     //             await ctx.reply(
        //     //                 '✅ Verification successful! Click below to join our group:',
        //     //                 {
        //     //                     parse_mode: 'HTML',
        //     //                     reply_markup: {
        //     //                         inline_keyboard: [
        //     //                             [{
        //     //                                 text: '🚀 Join Group',
        //     //                                 url: process.env.GROUP_INVITE_LINK || 'https://t.me/yourgroup'
        //     //                             }]
        //     //                         ]
        //     //                     }
        //     //                 }
        //     //             );
        //     //             console.log('Successfully sent group invite message');
        //     //         } catch (replyError) {
        //     //             console.error('Error sending reply:', replyError);
        //     //             await ctx.reply('Error sending group invite. Please contact support.');
        //     //         }
        //     //     }
        //     // } catch (error) {
        //     //     console.error('Error processing web app data:', error);
        //     //     await ctx.reply('Sorry, something went wrong with the verification. Please try again.');
        //     // }
        // });



        // Handle regular text messages
        this._bot.on(message('text'), async (ctx, next) => {
            if (!ctx.message.text.startsWith('/')) {
                if (ctx.chat?.type === 'private') {
                    await ctx.reply('You sent a message that is not a registered command');
                }
            }
            return next();
        });
    }
}