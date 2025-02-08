// src/Services/ContentFilterService.ts
import { createClient } from '@supabase/supabase-js';
import NodeCache from 'node-cache';

export class ContentFilterService {
    private supabase;
    private cache: NodeCache;
    private bannedWords: Set<string> = new Set();
    private readonly CACHE_KEY = 'banned_words';
    private readonly CACHE_TTL = 3600; // 1 hour
    readonly BANNED_WORD_THRESHOLD = 5;
    readonly BANNED_WORD_WARNING = '⚠️ Warning: Your message was removed for containing inappropriate content.';
    readonly BANNED_WORD_BAN = 'User has been banned for repeated violations.';
    readonly WARNING_THRESHOLD = 5;

    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_ANON_KEY!
        );
        this.cache = new NodeCache({ stdTTL: this.CACHE_TTL });
        this.initializeBannedWords();
    }

    private async initializeBannedWords() {
        // Try to get from cache first
        const cached = this.cache.get<Set<string>>(this.CACHE_KEY);
        if (cached) {
            this.bannedWords = cached;
            return;
        }

        // If not in cache, load from database
        await this.refreshBannedWords();
    }

    public async refreshBannedWords() {
        try {
            const { data, error } = await this.supabase
                .from('banned_words')
                .select('word')
                .eq('is_active', true);

            if (error) throw error;

            this.bannedWords = new Set(data.map(row => row.word.toLowerCase()));
            this.cache.set(this.CACHE_KEY, this.bannedWords);
        } catch (error) {
            console.error('Error loading banned words:', error);
        }
    }

    public async containsBannedContent(text: string): Promise<boolean> {
        await this.initializeBannedWords();
        const normalizedText = text.toLowerCase();
        
        // Check for exact matches
        for (const word of this.bannedWords) {
            if (normalizedText.includes(word)) {
                return true;
            }
        }

        // Check for variants (with common substitutions)
        const substitutions: { [key: string]: string[] } = {
            'a': ['@', '4', 'α'],
            'i': ['1', '!', '|'],
            'o': ['0', 'ο', 'θ'],
            'e': ['3', '€'],
            's': ['$', '5']
        };

        for (const word of this.bannedWords) {
            const pattern = this.createPatternWithSubstitutions(word, substitutions);
            if (new RegExp(pattern, 'i').test(normalizedText)) {
                return true;
            }
        }

        return false;
    }

    private createPatternWithSubstitutions(word: string, substitutions: { [key: string]: string[] }): string {
        let pattern = '';
        for (const char of word) {
            if (char in substitutions) {
                pattern += `[${char}${substitutions[char].join('')}]`;
            } else {
                pattern += char;
            }
        }
        return pattern;
    }
}

// src/Services/MessageCleanupService.ts
export class MessageCleanupService {
    private readonly WARNING_THRESHOLD = 3;
    private warnings: Map<number, number> = new Map();

    async handleInappropriateMessage(ctx: any, userId: number) {
        // Delete the message
        try {
            await ctx.deleteMessage();
        } catch (error) {
            console.error('Error deleting message:', error);
        }

        // Increment warning count
        const currentWarnings = (this.warnings.get(userId) || 0) + 1;
        this.warnings.set(userId, currentWarnings);

        // Send warning
        const warningMessage = currentWarnings >= this.WARNING_THRESHOLD
            ? '⚠️ Final warning! Your next violation will result in a ban.'
            : `⚠️ Warning ${currentWarnings}/${this.WARNING_THRESHOLD}: Your message was removed for containing inappropriate content.`;

        try {
            await ctx.reply(warningMessage, {
                reply_to_message_id: ctx.message.message_id
            });
        } catch (error) {
            console.error('Error sending warning:', error);
        }

        // Handle ban if threshold exceeded
        if (currentWarnings > this.WARNING_THRESHOLD) {
            try {
                await ctx.banChatMember(userId);
                await ctx.reply(`User has been banned for repeated violations.`);
            } catch (error) {
                console.error('Error banning user:', error);
            }
        }
    }
}