import { Context, Markup, Telegraf } from "telegraf";
import { Pages } from "../../Components/Pages/Pages";
import { UserService } from "../../Services/UserService";
import { ReferralService } from "../../Services/ReferralService";
import { VerificationService } from "../../Services/VerificationService";

export const startCommandHandler = async (ctx: Context, bot: Telegraf<Context>) => {
    if (!ctx.from || !ctx.chat || ctx.chat.type != 'private') return;

    try {
        const userService = new UserService();
        const referralService = new ReferralService(bot);
        const memberStatus = await bot.telegram.getChatMember(process.env.GROUP_ID!, ctx.from.id);
        const is_member = memberStatus.status === 'left' ? false : true;
        // Check if the user is already in the group
        
        // Get or create user
        const { user, isNew } = await userService.getOrCreateUser(
            ctx.from.id,
            ctx.from.username || null,
            ctx.chat.id,
            is_member
        );

        // if (is_member) {


        // Check if this is a referral click
        const startPayload = (ctx.message as any)?.text?.split(' ')[1];
        if (startPayload && !is_member) { // Only allow referral for non-group members
            const referrerId = referralService.parseReferralCode(startPayload);
            const isReferrerInGroup = await bot.telegram.getChatMember(process.env.GROUP_ID!, referrerId!);
            if (isReferrerInGroup.status === 'left') {
                await ctx.reply(`You're being invited by someone who is no longer in the group. Process will abort`);
                return;
            }

            if (referrerId) {
                const canBeReferred = await referralService.canBeReferred(user.id);
                
                if (!canBeReferred) {
                    await ctx.reply('You have already been referred by someone else.');
                    return;
                }

                // Create the referral
                const success = await referralService.createReferral(referrerId, user.id);
                
                if (success) {
                    // Show mini app verification button
                    await ctx.reply(
                        '🤖 Please verify that you\'re human to continue.',
                        Markup.inlineKeyboard([
                            [Markup.button.webApp(
                                '🔍 Verify Me',
                                `${process.env.MINIAPP_URL}?user=${user.id}`
                            )]
                        ])
                    );
                    return;
                }
            }
        }

        // Normal welcome flow...
        const defaultLink = userService.generateDefaultLink(user.id);
        const page = isNew 
            ? Pages.getNewUserPage(ctx.from.username || 'there', defaultLink)
            : Pages.getReturningUserPage(ctx.from.username || 'there', defaultLink);

        await ctx.reply(page.screen, {
            parse_mode: 'HTML',
            ...page.menu.constructedMenu
        });

    // } else {
    //     // You're not a member, please join the group before making the referral
    //     await ctx.reply('You need to join the group before making a referral. Click below to join the group:', Markup.inlineKeyboard([
    //         [Markup.button.url('🚀 Join Group', process.env.GROUP_INVITE_LINK!)]
    //     ]));
    // }
 

    } catch (error) {
        console.error('Error in start command:', error);
        await ctx.reply('Sorry, something went wrong. Please try again later.');
    }
};

// // Handle mini app data
/**
 * FUCK YOU DUROV BROTHERS
 */
// export const handleWebAppData = async (ctx: Context) => {
//     if (!ctx.message || !('web_app_data' in ctx.message)) return;

//     try {
//         const data = JSON.parse(ctx.message.web_app_data.data);
//         if (data.event === 'verification_success') {
//             const verificationService = new VerificationService();
//             await verificationService.handleVerificationSuccess(data.userId);

//             // Send group invite
//             await ctx.reply(
//                 '✅ Verification successful! Click below to join our group:',
//                 Markup.inlineKeyboard([
//                     [Markup.button.url('🚀 Join Group', process.env.GROUP_INVITE_LINK!)]
//                 ])
//             );
//         }
//     } catch (error) {
//         console.error('Error handling web app data:', error);
//         await ctx.reply('Sorry, something went wrong with the verification.');
//     }
// };