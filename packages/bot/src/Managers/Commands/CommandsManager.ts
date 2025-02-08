import { Context, Telegraf } from "telegraf";
import { Manager } from "../Manager";
import { startCommandHandler } from "./start";
import { helpCommandHandler } from "./help";
// import { ModerationService } from "../../Services/ModerationService";

/**
 * ### Commands Manager ###
 * 
 * I manage commands that are coming in from the user
 * 
 * I tell the bot how to react to certain commands and
 * what callback fn to call when those events occur
 * 
 */
export class CommandsManager extends Manager {
    // private moderationService: ModerationService;

    constructor(bot: Telegraf<Context>) {
        super(bot);
        // this.moderationService = new ModerationService(bot);
        this._setupCommands(bot);
        this._setupCommandsList();
    }

    private _setupCommandsList() {
        this._bot.telegram.setMyCommands([
            {
                command: "start",
                description: "Start the bot",
            },
            {
                command: "help",
                description: "View help",
            },
            {
                command: "ban",
                description: "Ban a user (admins only)",
            },
            {
                command: "mute",
                description: "Mute a user (admins only)",
            },
            {
                command: "unmute",
                description: "Unmute a user (admins only)",
            }
        ]);
    }

    private _setupCommands(bot: Telegraf<Context>) {
        this._bot.command('start', async (ctx) => startCommandHandler(ctx, bot));
        this._bot.command('help', async (ctx) => helpCommandHandler(ctx));

        // Moderation commands
        this._bot.command('ban', async (ctx) => {
            const args = ctx.message.text.split(' ').slice(1);
            // await this.moderationService.handleBanCommand(ctx, args);
        });

        this._bot.command('mute', async (ctx) => {
            const args = ctx.message.text.split(' ').slice(1);
            // await this.moderationService.handleMuteCommand(ctx, args);
        });

        this._bot.command('unmute', async (ctx) => {
            const args = ctx.message.text.split(' ').slice(1);
            // await this.moderationService.handleUnmuteCommand(ctx, args);
        });
    }
}