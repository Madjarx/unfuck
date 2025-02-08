// // src/Services/ModerationService.ts
// import { Context, Telegraf } from 'telegraf';
// import { createClient } from '@supabase/supabase-js';

// export class ModerationService {
//     private supabase;

//     constructor(private bot: Telegraf<Context>) {
//         this.supabase = createClient(
//             process.env.SUPABASE_URL!,
//             process.env.SUPABASE_ANON_KEY!
//         );
//     }

//     async isAdmin(userId: number): Promise<boolean> {
//         const { data } = await this.supabase
//             .from('admin_users')
//             .select('*')
//             .eq('user_id', userId)
//             .single();

//         return !!data;
//     }

//     async canPerformAction(userId: number, action: 'ban' | 'mute'): Promise<boolean> {
//         const { data } = await this.supabase
//             .from('admin_users')
//             .select(action === 'ban' ? 'can_ban' : 'can_mute')
//             .eq('user_id', userId)
//             .single();

//         // @ts-ignore
//         return !!data && data[action === 'ban' ? 'can_ban' : 'can_mute'];
//     }

//     // Helper method to get user ID from username or ID
//     private async resolveUser(ctx: Context, userIdentifier: string): Promise<number | null> {
//         try {
//             // If it's already a number, return it
//             if (!isNaN(Number(userIdentifier))) {
//                 return Number(userIdentifier);
//             }

//             // Remove @ if present
//             const username = userIdentifier.replace('@', '');

//             // Try to get user from chat
//             try {
//                 const chatMember = await ctx.telegram.getChatMember(
//                     ctx.chat!.id,
//                     `@${username}`
//                 );
//                 return chatMember.user.id;
//             } catch (error) {
//                 console.error('Error resolving username:', error);
//                 return null;
//             }
//         } catch (error) {
//             console.error('Error in resolveUser:', error);
//             return null;
//         }
//     }

//     async handleBanCommand(ctx: Context, args: string[]): Promise<void> {
//         if (!ctx.from || !ctx.chat) return;

//         try {
//             // Check if user is admin
//             if (!await this.canPerformAction(ctx.from.id, 'ban')) {
//                 await ctx.reply('❌ You do not have permission to ban users.');
//                 return;
//             }

//             if (args.length < 1) {
//                 await ctx.reply('❌ Usage: /ban @username [reason]');
//                 return;
//             }

//             // Resolve user ID
//             const targetUserId = await this.resolveUser(ctx, args[0]);
//             if (!targetUserId) {
//                 await ctx.reply('❌ Could not find user. Make sure they are in the group.');
//                 return;
//             }

//             const reason = args.slice(1).join(' ') || 'No reason provided';

//             // Check if target is also an admin
//             if (await this.isAdmin(targetUserId)) {
//                 await ctx.reply('❌ Cannot ban other admins.');
//                 return;
//             }

//             // Ban user
//             await ctx.banChatMember(targetUserId);

//             // Log action
//             await this.supabase
//                 .from('moderation_actions')
//                 .insert({
//                     action_type: 'ban',
//                     moderator_id: ctx.from.id,
//                     target_user_id: targetUserId,
//                     reason
//                 });

//             // Get username for confirmation message
//             let targetUser;
//             try {
//                 targetUser = await ctx.telegram.getChat(targetUserId);
//             } catch (error) {
//                 console.error('Error getting target user info:', error);
//             }

//             const userIdentifier = targetUser?.username ? 
//                 `@${targetUser.username}` : 
//                 `User ${targetUserId}`;

//             await ctx.reply(
//                 `🚫 ${userIdentifier} has been banned.\nReason: ${reason}`
//             );

//         } catch (error) {
//             console.error('Error in ban command:', error);
//             await ctx.reply('❌ Failed to ban user. Please check my permissions and try again.');
//         }
//     }

//     async handleMuteCommand(ctx: Context, args: string[]): Promise<void> {
//         if (!ctx.from || !ctx.chat) return;

//         try {
//             if (!await this.canPerformAction(ctx.from.id, 'mute')) {
//                 await ctx.reply('❌ You do not have permission to mute users.');
//                 return;
//             }

//             if (args.length < 2) {
//                 await ctx.reply('❌ Usage: /mute @username <duration_minutes> [reason]');
//                 return;
//             }

//             // Resolve user ID
//             const targetUserId = await this.resolveUser(ctx, args[0]);
//             if (!targetUserId) {
//                 await ctx.reply('❌ Could not find user. Make sure they are in the group.');
//                 return;
//             }

//             const duration = parseInt(args[1]);
//             const reason = args.slice(2).join(' ') || 'No reason provided';

//             if (isNaN(duration) || duration <= 0) {
//                 await ctx.reply('❌ Please provide a valid duration in minutes.');
//                 return;
//             }

//             // Check if target is admin
//             if (await this.isAdmin(targetUserId)) {
//                 await ctx.reply('❌ Cannot mute other admins.');
//                 return;
//             }

//             // Calculate expiry time
//             const expiryDate = new Date();
//             expiryDate.setMinutes(expiryDate.getMinutes() + duration);

//             // Mute user
//             await ctx.restrictChatMember(targetUserId, {
//                 until_date: Math.floor(expiryDate.getTime() / 1000),
//                 permissions: {
//                     can_send_messages: false,
//                     can_send_other_messages: false,
//                     can_add_web_page_previews: false,
//                     can_send_photos: false,
//                 }
//             });

//             // Log action
//             await this.supabase
//                 .from('moderation_actions')
//                 .insert({
//                     action_type: 'mute',
//                     moderator_id: ctx.from.id,
//                     target_user_id: targetUserId,
//                     reason,
//                     duration_minutes: duration,
//                     expires_at: expiryDate.toISOString()
//                 });

//             // Get username for confirmation message
//             let targetUser;
//             try {
//                 targetUser = await ctx.telegram.getChat(targetUserId);
//             } catch (error) {
//                 console.error('Error getting target user info:', error);
//             }

//             const userIdentifier = targetUser?.username ? 
//                 `@${targetUser.username}` : 
//                 `User ${targetUserId}`;

//             await ctx.reply(
//                 `🤐 ${userIdentifier} has been muted for ${duration} minutes.\nReason: ${reason}`
//             );

//         } catch (error) {
//             console.error('Error in mute command:', error);
//             await ctx.reply('❌ Failed to mute user. Please check my permissions and try again.');
//         }
//     }
// }