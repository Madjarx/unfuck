import { dbClient } from "../Database";
import { Telegraf, Context } from 'telegraf';
import { createClient, SupabaseClient } from '@supabase/supabase-js';



// {
//     browser_info: {
//       hardwareConcurrency: 8,
//       language: 'en-GB',
//       platform: 'MacIntel',
//       userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko)',
//       webdriver: false
//     },
//     created_at: '2025-02-08T18:52:09.988942+00:00',
//     graphics_info: { renderer: 'WebKit WebGL', vendor: 'WebKit', version: 'WebGL 1.0' },
//     id: 28,
//     ip_address: null,
//     user_id: 7476352772,
//     verification_passed: true
//   }
interface VerificationAttempt {
    id: number;
    user_id: number;
    created_at: string;
    browser_info: any;
    graphics_info: any;
    verification_passed: boolean;
}



export class ReferralService {
    // Check if user can be referred (not already referred)

    private supabase: SupabaseClient;
    private bot: Telegraf<Context>;
    private processedVerifications = new Set<number>();

    constructor(bot: Telegraf<Context>) {
        this.bot = bot;
        this.supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_ANON_KEY!
        );
        this.setupRealtimeSubscription();
        
    }

    private setupRealtimeSubscription() {
        console.log('Setting up realtime subscription for verification_attempts');

        this.supabase
            .channel('verification-channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'verification_attempts',
                },
                async (payload) => {
                    console.log('Received realtime update:', payload);
                    await this.handleVerificationAttempt(payload.new as VerificationAttempt);
                }
            )
            .subscribe((status) => {
                console.log('Subscription status:', status);
            });
    }

    private async handleVerificationAttempt(verification: VerificationAttempt) {
        try {

            if (this.processedVerifications.has(verification.id)) {
                return;
            }

            console.log('Processing verification attempt:', verification);

            this.processedVerifications.add(verification.id);

            if (verification.verification_passed) {
                // Send message to the user

                // 
                await this.bot.telegram.sendMessage(
                    verification.user_id,
                    '✅ Verification successful! Click below to join our group:',
                    {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: '🚀 Join Group',
                                    url: process.env.GROUP_INVITE_LINK || 'https://t.me/yourgroup'
                                }]
                            ]
                        }
                    }
                );

                console.log('Successfully sent group invite to user:', verification.user_id);
            }
        } catch (error) {
            console.error('Error handling verification attempt:', error);
        }
    }

    // Method to check if a user can be referred
    async canBeReferred(userId: number): Promise<boolean> {
        const { data } = await this.supabase
            .from('verification_attempts')
            .select('id')
            .eq('user_id', userId);

        return !data || data.length === 0;
    }

    // Method to get referral info
    async getReferralInfo(userId: number) {
        const { data } = await this.supabase
            .from('verification_attempts')
            .select('*')
            .eq('user_id', userId)
            .single();

        return data;
    }

    // Create a new referral
    async createReferral(referrerId: number, refereeId: number): Promise<boolean> {
        const { error } = await dbClient
            .from('referrals')
            .insert([
                {
                    referrer_id: referrerId,
                    referee_id: refereeId,
                    status: 'pending'
                }
            ]);

        return !error;
    }

    // Parse referral code from start command
    parseReferralCode(startPayload: string): number | null {
        if (!startPayload?.startsWith('ref_')) return null;
        const referrerId = parseInt(startPayload.replace('ref_', ''));
        return isNaN(referrerId) ? null : referrerId;
    }

    // Complete a referral (after verification)
    async completeReferral(refereeId: number): Promise<boolean> {
        const { error } = await dbClient
            .from('referrals')
            .update({
                status: 'completed',
                completed_at: new Date().toISOString()
            })
            .eq('referee_id', refereeId)
            .eq('status', 'verified');

        return !error;
    }

    // Verify a referral (after anti-bot check)
    async verifyReferral(refereeId: number): Promise<boolean> {
        const { error } = await dbClient
            .from('referrals')
            .update({ status: 'verified' })
            .eq('referee_id', refereeId)
            .eq('status', 'pending');

        return !error;
    }

}
