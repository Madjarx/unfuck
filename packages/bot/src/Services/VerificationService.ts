import { dbClient } from "../Database";


export class VerificationService {
    async isVerified(userId: number): Promise<boolean> {
        const { data } = await dbClient
            .from('verification_attempts')
            .select('verification_passed')
            .eq('user_id', userId)
            .eq('verification_passed', true)
            .limit(1);

        return !!data?.length;
    }

    async handleVerificationSuccess(userId: number): Promise<void> {
        // Update referral status
        await dbClient
            .from('referrals')
            .update({ status: 'verified' })
            .eq('referee_id', userId)
            .eq('status', 'pending');
    }
}