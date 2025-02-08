import { Telegraf } from "telegraf"
import { Context } from "telegraf";



/**
 * Manager class
 * 
 * I am a base for all the managers in the bot
 * Managers are event-specific classes that:
 * 1. invoke certain handler
 * 2. for certain event
 * 3. in a certain category
 * 
 * Example:
 * # Help command
 * Commands Manager reacts to /help command by invoking
 * help handler
 * 
 */
export class Manager {

    /* Properties */
    _bot: Telegraf<Context>;

    /**
     * Note on Context -
     * Context Object could be extended to include more properties
     * in scenarios where you might need it
     * 
     */

    /* Constructor */
    constructor(bot: Telegraf<Context>) {
        this._bot = bot;
    };

};