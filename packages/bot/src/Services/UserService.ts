// src/Services/UserService.ts
import { UserRepository, User } from '../Database/UserRepository';
import { config } from 'dotenv';


config({
    path: __dirname + '/../../.env'
});


export class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async getOrCreateUser(
        telegramId: number,
        username: string | null,
        chatId: number,
        is_group_member: boolean
    ): Promise<{ user: User, isNew: boolean }> {
        const existingUser = await this.userRepository.findById(telegramId);
        // const existsInGroup = existingUser?.chat_id === chatId;

        if (existingUser) {
            return { user: existingUser, isNew: false };
        }

        const newUser = await this.userRepository.createUser(
            telegramId,
            username,
            chatId,
            is_group_member
        );

        if (!newUser) throw new Error('Failed to create user');
        return { user: newUser, isNew: true };
    }

    generateDefaultLink(userId: number): string {
        return `https://t.me/${process.env.BOT_USERNAME}?start=ref_${userId}`;
    }
}