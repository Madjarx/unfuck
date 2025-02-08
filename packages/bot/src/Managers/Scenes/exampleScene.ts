import { Markup, Scenes } from "telegraf";
import { WizardContext } from "telegraf/typings/scenes";
import { sceneIds } from "../../Components";

const sceneMenuOne = Markup.inlineKeyboard([
        Markup.button.callback('👀 Show More', 'SHOW_MORE'),
        Markup.button.callback('❌ Leave Scene', 'LEAVE_SCENE')
    ]);

const sceneMenuTwo = Markup.inlineKeyboard([
        Markup.button.callback('❌ Leave Scene', 'LEAVE_SCENE')
    ]);

const text = `Welcome to the example scene\n\nWhile in the scene, you are in an isolated environment\n\n`;

/**
 * Example Scene
 */
export const exampleScene = new Scenes.WizardScene(sceneIds.example,
    async (ctx: WizardContext) => { // Step 1
       promptInitialMessage(ctx);
    },
    async (ctx: WizardContext) => { // Step 2
        promptSecondMessage(ctx);
    },
);

// #region Steps
async function promptInitialMessage(ctx: WizardContext) {
    await ctx.reply(text, {parse_mode: 'HTML', ...sceneMenuOne});
    ctx.wizard.next();
}

async function promptSecondMessage(ctx: WizardContext) {
    await ctx.reply('This is the second step', { parse_mode: 'HTML', ...sceneMenuTwo });
    ctx.wizard.next();
}
// #endregion


// #region Button and command handlers
exampleScene.command('leave', async (ctx) => {
    await ctx.reply('You are leaving the example scene');
    ctx.scene.leave();
});

exampleScene.action('SHOW_MORE', async (ctx) => {
    await ctx.reply('You clicked on the show more button');
    await promptSecondMessage(ctx);
    ctx.wizard.next();
});

exampleScene.action('LEAVE_SCENE', async (ctx) => {
    await ctx.reply('You LEFT the example scene, you can now use /start and /help');
    ctx.scene.leave();
});
// #endregion