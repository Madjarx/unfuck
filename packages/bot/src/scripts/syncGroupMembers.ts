// // src/scripts/syncGroupMembers.ts
// import { Telegraf } from 'telegraf';
// import { createClient } from '@supabase/supabase-js';
// import { config } from 'dotenv';
// import path from 'path';

// // Load environment variables
// config({
//     path: path.resolve(__dirname, '../../.env')
// });

// const supabase = createClient(
//     process.env.SUPABASE_URL!,
//     process.env.SUPABASE_ANON_KEY!
// );

// async function syncGroupMembers() {
//     try {
//         const bot = new Telegraf(process.env.BOT_TOKEN!);
//         const groupId = process.env.GROUP_ID!;

//         console.log('Starting group members sync...');

//         // Get all members from the group
//         const chatMembers = await bot.telegram.getChatAdministrators(groupId);
        
//         // Get all regular members
//         const allMembers = await bot.telegram.getChatMembersCount(groupId);
//         console.log(`Total members in group: ${allMembers}`);

//         // Get members in chunks (Telegram limit is 200 per request)
//         for (let offset = 0; offset < allMembers; offset += 200) {
//             const members = await bot.telegram.getChatMember(groupId, offset, 200);
            
//             for (const member of members) {
//                 if (!member.user.is_bot) {
//                     // Insert or update member
//                     const { error } = await supabase
//                         .from('group_members')
//                         .upsert({
//                             user_id: member.user.id,
//                             username: member.user.username,
//                             first_name: member.user.first_name,
//                             last_name: member.user.last_name,
//                             is_active: true
//                         });

//                     if (error) {
//                         console.error(`Error updating member ${member.user.id}:`, error);
//                     } else {
//                         console.log(`Updated member: ${member.user.username || member.user.id}`);
//                     }
//                 }
//             }
//         }

//         console.log('Group members sync completed!');
//         process.exit(0);
//     } catch (error) {
//         console.error('Error syncing group members:', error);
//         process.exit(1);
//     }
// }

// // Run the sync
// syncGroupMembers();