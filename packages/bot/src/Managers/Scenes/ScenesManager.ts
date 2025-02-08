// #region Module imports

/* General imports */
import { Context, Scenes, Telegraf } from "telegraf";
import { Manager } from "../Manager";

import { exampleScene } from "./exampleScene";

// #endregion

/**
 * Scenes Manager
 * 
 * I manage the scenes and dialogs that the user enters
 * I mostly leverage the scene wizzard from telegraf
 * 
 * ref: https://github.com/telegraf/telegraf/issues/705
 * More documentation and guidance on scenes
 * 
 */
export class ScenesManager extends Manager {

    _stage;


    constructor(bot: Telegraf<Context>) {
        super(bot);

        this._stage = new Scenes.Stage([

            /**
             * Example - You would import the scene object and pass it in here
             */
            exampleScene,
            // more scenes go in here...
        ]);

        // @ts-ignore - DO NOT REMOVE THIS LINE
        this._bot.use(this._stage.middleware());
    };

};