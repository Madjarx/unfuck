import { Markup } from "telegraf";
import { navLabels, sceneLabels } from "../utils/labels";
import { navCallbacks, referralCallbacks, sceneCallbacks } from "../utils/callbacks";
import { HelpMenus } from "./help";



export class Menus {

    /** Properties */
    helpMenus: HelpMenus; // Example how to use the outside classes in master Menu class

    /* Constructor */
    constructor() {
        this.helpMenus = new HelpMenus();
    };


    /** Start Menu */
    static getStartMenu() {
    
        /** Construct the menu */
        const menuButtons = [
            // [
            //     Markup.button.callback(sceneLabels.example, sceneCallbacks.example),
            // ],
            [
                Markup.button.callback(navLabels.help, navCallbacks.help),
            ],
        ];
        const menu = Markup.inlineKeyboard(menuButtons);

        return {
            buttons: menuButtons,
            constructedMenu: menu,
        }
    };


    static getReferralMenu() {
        const menuButtons = [
          [
            Markup.button.callback('🔄 Customize Link', referralCallbacks.customizeLink),
            Markup.button.callback('📊 My Referrals', referralCallbacks.viewReferrals)
          ],
          [
            Markup.button.callback('💰 Rewards', referralCallbacks.viewRewards),
            Markup.button.callback('❓ Help', navCallbacks.help)
          ]
        ];
    
        return {
          buttons: menuButtons,
          constructedMenu: Markup.inlineKeyboard(menuButtons)
        };
      }

}