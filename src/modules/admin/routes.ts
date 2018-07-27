import { CommandRouterService } from "../../infrastructure/command-router";
import { RichEmbed, TextChannel } from "discord.js";
import { MentionHelper } from "../../infrastructure/mention-helper";
import { WarningRepository, Warning } from "./warnings-repo";

export abstract class AdminRoutes {

    public static RegisterRoutes(router: CommandRouterService) {

        const _warningRepo = new WarningRepository();
        
        const _sendWarnSyntax = (channel: TextChannel) => {
            channel.send(new RichEmbed()
                .setColor(0xf44542)
                .setDescription("syntax: n$warn <member> <reason>")
            );
        }

        const _sendWarningsSyntax = (channel: TextChannel) => {
            channel.send(new RichEmbed()
                .setColor(0xf44542)
                .setDescription("syntax: n$warnings [<member>]")
            );
        }

        router.RegisterRoute('n$warn', (c, m) => {
            if (m.author.bot) {return;}

            const guild = m.guild;
            if (!guild) {return;}

            const claimant = m.author.id;
            const guildMember = guild.member(claimant);
            if (!guildMember) {return;}

            const channel = <TextChannel>(m.channel);

            if (!guildMember.hasPermission("BAN_MEMBERS")) {
                channel.send(new RichEmbed()
                    .setColor(0xf44542)
                    .setDescription("You must be an admin to warn someone")
                );
                return;
            }

            if (c.args.length < 2) {
                _sendWarnSyntax(channel);
                return;
            }
            
            const memberId = MentionHelper.GetIdFromMention(c.args[0]);
            if (!memberId) {
                _sendWarnSyntax(channel);
                return;
            }

            const warnedMember = m.mentions.members.get(memberId);
            if (!warnedMember) {
                _sendWarnSyntax(channel);
                return;
            }

            const reason = c.args.slice(1).join(" ");
            const serverId = guild.id;

            _warningRepo.add(serverId, warnedMember.id, reason);
        });

        router.RegisterRoute('n$warnings', (c, m) => {
            if (m.author.bot) {return;}

            const guild = m.guild;
            if (!guild) {return;}

            const f = (e: Error, w: Warning[]) => {
                if (e) {
                    m.channel.send(new RichEmbed()
                        .setColor(0xf44542)
                        .setDescription("Couldn't get warnings")
                    );

                    return;
                }

                const embed = new RichEmbed().setColor(0xb2e829);
                w.forEach(x => {
                    const member = guild.members.get(x.user);
                    if (member) {
                        embed.addField(
                            `${member.user.username} - ${new Date(x.date).toLocaleDateString('en-AU')}`, 
                            `for ${x.reason}\n`
                        );
                    }
                })

                m.channel.send(embed);
            }

            if (c.args.length === 0) {
                _warningRepo.get(guild.id, f);
                return;
            }

            const channel = <TextChannel>(m.channel);

            if (c.args.length > 1) {
                _sendWarningsSyntax(channel);
                return;
            }
            
            const memberId = MentionHelper.GetIdFromMention(c.args[0]);
            if (!memberId) {
                _sendWarningsSyntax(channel);
                return;
            }

            const warnedMember = m.mentions.members.get(memberId);
            if (!warnedMember) {
                _sendWarningsSyntax(channel);
                return;
            }

            _warningRepo.getByUser(guild.id, warnedMember.id, f);
        });
    }
}