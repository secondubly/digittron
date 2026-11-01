import { createEvent } from "arcscord";
import { PermissionFlagsBits } from "discord.js";

const HONEYPOT_CHANNEL_ID = Bun.env.HONEYPOT_CHANNEL_ID
const LOG_CHANNEL_ID = Bun.env.DISCORD_LOG_CHANNEL_ID

export const messageHoneypotEvent = createEvent({
    event: 'messageCreate',
    run: async (ctx, message) => {
        if (message.author.bot || !message.guild) return;

        // Check if message was sent in the honeypot channel
        if (message.channelId === HONEYPOT_CHANNEL_ID) {
            const member = message.member;

            if (!member) {
                ctx.client.logger.warn(`Message ${message.id} has no attached member`)
                return
            }

            if (member.permissions.has(PermissionFlagsBits.Administrator)) {
                ctx.client.logger.warn(`Staff member ${message.author.tag} bypassed honeypot.`);
                return;
            }

            try {
                await message.delete();

                await member?.ban({
                    deleteMessageSeconds: 7 * 24 * 60 * 60, // last 7 days
                    reason: 'Triggered Discord Honeypot Channel (Automated Anti-Spam)'
                });

                // Log the action to your moderator channel
                if (LOG_CHANNEL_ID) {
                    const logChannel = await message.guild.channels.fetch(LOG_CHANNEL_ID);
                    if (logChannel && logChannel.isTextBased()) {
                        await logChannel.send({
                            content: `🚨 **Honeypot Triggered!** Banned user \`${message.author.tag}\` (ID: ${message.author.id}) for sending a message in the trap channel.`
                        });

                        ctx.client.logger.info(`Successfully banned ${message.author.tag} via honeypot.`);
                    }                    
                }
            } catch (error) {
                ctx.client.logger.error(`Failed to execute honeypot action:`, error);
                
                // Fallback: Notify mods if the bot lacked permissions to ban
                try {
                    const logChannel = await message.guild.channels.fetch(LOG_CHANNEL_ID);
                    if (logChannel && logChannel.isTextBased()) {
                        await logChannel.send({
                            content: `⚠️ **Honeypot Failure:** Tried to ban \`${message.author.tag}\` but failed. Check bot role permissions.`
                        });
                    }
                } catch (logErr) {
                    ctx.client.logger.error('Could not send failure log to channel:', logErr);
                }
            }
        }
    }
})