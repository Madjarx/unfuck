import { dbClient } from ".";

export interface User {
    id: number;
    username: string | null;
    chat_id: number | null;
    is_admin: boolean;
    is_group_member: boolean;
    first_seen_at: Date;
}



export class UserRepository {
    async findById(id: number): Promise<User | null> {
        const { data, error } = await dbClient
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return null;
        return data as User;
    }

    async createUser(
        id: number,
        username: string | null,
        chatId: number,
        is_group_member: boolean
    ): Promise<User | null> {
        const { data, error } = await dbClient
            .from('users')
            .insert([
                {
                    id,
                    username,
                    chat_id: chatId,
                    is_group_member,
                }
            ])
            .select()
            .single();

        if (error || !data) return null;
        return data as User;
    }
}