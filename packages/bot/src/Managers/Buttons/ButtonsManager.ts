import { Context, Telegraf } from "telegraf";
import { Manager } from "../Manager";
import { navCallbacks, sceneCallbacks, sceneIds } from "../../Components";
import { NavHandler } from "./navigation";


export class ButtonsManager extends Manager {


    /** Constructor */
    constructor(bot: Telegraf<Context>) {
        super(bot);

        /* Setup navigation buttons */
        this._setupNavButtons();

        /* Setup scene buttons */
        this._setupSceneButtons();
    };

    
    /** Nav handlers */
    private _setupNavButtons() {

        this._bot.action(navCallbacks.help, (ctx) => NavHandler.handleNavHelp(ctx));
        this._bot.action(navCallbacks.home, (ctx) => NavHandler.handleNavStart(ctx));
    };


    /* Scene buttons s*/
    private _setupSceneButtons() {

        this._bot.action(sceneCallbacks.example, async (ctx) => {
            // @ts-ignore
            await ctx.scene.enter(sceneIds.example);
        })
    };

};