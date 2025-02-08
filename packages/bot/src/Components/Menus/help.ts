import { Markup } from "telegraf";
import { navLabels } from "../utils/labels";
import { navCallbacks } from "../utils/callbacks";


export class HelpMenus {

    constructor() {}

    getHelpMenu() {
        const menuButtons = [
            [
                Markup.button.callback(navLabels.home, navCallbacks.home),
            ],
        ];
        const menu = Markup.inlineKeyboard(menuButtons);

        return {
            buttons: menuButtons,
            constructedMenu: menu,
        }
    }
}