import { Manager } from "../Manager";
import { Telegraf, Context } from "telegraf";
import { message } from "telegraf/filters";
import { createClient } from '@supabase/supabase-js';

export class GroupEventsManager extends Manager {
    private supabase;

    constructor(private bot: Telegraf) {
        super(bot);
        this.supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_ANON_KEY!
        );
        this.registerEventHandlers();
    }

    private registerEventHandlers(): void {
        // New member joins the group
        this.bot.on('new_chat_members', async (ctx) => {
            const newMembers = ctx.message.new_chat_members;
            for (const member of newMembers) {
                // if (!member.is_bot) {
                await this.handleNewMember(ctx, member);
                // }
            }
        });


        // this._bot.on('pinned_message', async (ctx) => {
        //     console.log('Pinned message:', ctx.message);
        //     await ctx.reply('Message pinned!');
        // });

        // Member leaves the group
        // this.bot.on(message('left_chat_member'), async (ctx) => {
        //     if (ctx.message.left_chat_member && !ctx.message.left_chat_member.is_bot) {
        //         await this.updateGroupMemberStatus(ctx.message.left_chat_member.id, false);
        //     }
        // });
    }

    private async handleNewMember(ctx: Context, member: any): Promise<void> {
        try {
            console.log(`Processing new member: ${member.id}`);

            // Add to group_members table
            await this.updateGroupMemberStatus(member.id, true);

            // Check referral status
            const referralInfo = await this.checkReferralStatus(member.id);

            if (!referralInfo) {
                // No referral found, just welcome
                await ctx.reply(`Welcome to the group, ${member.first_name}! 👋`);
                return;
            }

            if (referralInfo.status === 'pending') {
                // Complete the referral
                await this.completeReferral(referralInfo.id, member.id);

                // Welcome with referral completion
                await ctx.reply(
                    `Welcome ${member.first_name}! 🎉\nYour referral process has been completed successfully!`
                );

                // Notify referrer
                try {
                    await this.bot.telegram.sendMessage(
                        referralInfo.referrer_id,
                        `🎉 Congratulations! Your referral ${member.first_name} has joined the group!\nYour reward has been credited.`
                    );
                } catch (error) {
                    console.error('Error notifying referrer:', error);
                }
            }

        } catch (error) {
            console.error('Error handling new member:', error);
        }
    }

    private async updateGroupMemberStatus(userId: number, isActive: boolean) {
        const { error } = await this.supabase
            .from('users')
            .upsert({
                is_group_member: true
            });

        if (error) {
            console.error('Error updating group member status:', error);
        }
    }

    private async checkReferralStatus(userId: number) {
        const { data, error } = await this.supabase
            .from('referrals')
            .select('*')
            .eq('referee_id', userId)
            .single();

        if (error) {
            console.error('Error checking referral status:', error);
            return null;
        }

        return data;
    }

    private async completeReferral(referralId: number, userId: number) {
        const { error } = await this.supabase
            .from('referrals')
            .update({
                status: 'completed',
                completed_at: new Date().toISOString()
            })
            .eq('id', referralId);

        if (error) {
            console.error('Error completing referral:', error);
            return;
        }

        // Update rewards table
        await this.updateRewards(userId);
    }

    private async updateRewards(userId: number) {
        // Get reward amount from settings or use default
        const { data: settings } = await this.supabase
            .from('bot_settings')
            .select('default_reward_amount')
            .single();

        const rewardAmount = settings?.default_reward_amount || 100;

        // Update rewards
        const { error } = await this.supabase
            .from('rewards')
            .upsert({
                user_id: userId,
                total_rewards: rewardAmount
            });

        if (error) {
            console.error('Error updating rewards:', error);
        }
    }
}