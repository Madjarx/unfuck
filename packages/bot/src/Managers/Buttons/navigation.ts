import { Context } from "telegraf";
import { Pages } from "../../Components/Pages/Pages";



export class NavHandler {

    constructor() {}

    static async handleNavHelp(ctx: Context) {
        try {
            const helpPage = Pages.getHelpPage();
            await ctx.editMessageText(helpPage.screen, {parse_mode: 'HTML', ...helpPage.menu.constructedMenu});

        } catch(error) {
            console.log('Error: NavHandler.handleNavHelp() - ', error);
        }
    };


    static async handleNavStart(ctx: Context) {
        try {
            const homePage = Pages.getHomePage();
            // const homePage = Pages.getReturningUserPage(ctx.from?.username || 'there', 'defaultLink');
            await ctx.editMessageText(homePage.screen, {parse_mode: 'HTML', ...homePage.menu.constructedMenu});
        } catch(error) {
            console.log('Error: NavHandler.handleNavStart() - ', error);
        }
    }
}