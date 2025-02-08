




export class Screens {


    constructor() { }


    static getStartText() {
        let message = ``;
        message += `Hello!\n\n`;
        message += `I am a bot\n\n`;
        return message;
    };

    static getHelpText() {
        let message = ``;
        message += `Here are the commands you can use:\n\n`;
        message += `/start - Start the bot\n`;
        message += `/help - Get help\n`;
        return message;
    };

    static getWelcomeNewUserText(username: string, defaultLink: string): string {
        return `
    🎉 Welcome ${username}! 
    
    I'm your referral management assistant. I'll help you invite new members and track your rewards.
    
    🔗 Here's your personal invite link:
    ${defaultLink}
    
    You can:
    • Share this link with friends
    • Track your referrals
    • Customize your link
    • View your rewards
    
    Use the menu below to get started!
    `;
    }

    static getWelcomeBackText(username: string, defaultLink: string): string {
        return `
    👋 Welcome back ${username}!
    
    🔗 Your current invite link:
    ${defaultLink}
    
    Use the menu below to manage your referrals and rewards.
    `;
    }
}
