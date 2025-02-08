import { Menus } from "../Menus/Menus";
import { Screens } from "../Screens/Screens";


const menus = new Menus();
const screens = new Screens();


export class Pages {

    /** Properties */

    /* Constructor */
    constructor() {}


    static getHomePage() {
        const startScreen = Screens.getStartText();
        const startMenu = Menus.getStartMenu();
        return {
            screen: startScreen,
            menu: startMenu
        }
    };

    static getHelpPage() {
        const helpScreen = Screens.getHelpText();
        const helpMenu = menus.helpMenus.getHelpMenu();
        return {
            screen: helpScreen,
            menu: helpMenu
        }
    }


    static getNewUserPage(username: string, defaultLink: string) {
        const screen = Screens.getWelcomeNewUserText(username, defaultLink);
        const menu = Menus.getReferralMenu();
        return {
          screen,
          menu
        };
      }
    
      static getReturningUserPage(username: string, defaultLink: string) {
        const screen = Screens.getWelcomeBackText(username, defaultLink);
        const menu = Menus.getReferralMenu();
        return {
          screen,
          menu
        };
      }

};