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
                .setDescription("syntax: warn <member> <reason>")
            );
        }

        const _sendUnwarnSyntax = (channel: TextChannel) => {
            channel.send(new RichEmbed()
                .setColor(0xf44542)
                .setDescription("syntax: unwarn <member>")
            );
        }

        const _sendWarningsSyntax = (channel: TextChannel) => {
            channel.send(new RichEmbed()
                .setColor(0xf44542)
                .setDescription("syntax: warnings [<member>]")
            );
        }

        router.RegisterRoute('warn', (c, m) => {
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

            m.channel.send(new RichEmbed()
                .setColor(0xf44542)
                .setDescription(`${warnedMember.user.username} has been warned.`)
            );
        });

        router.RegisterRoute('unwarn', (c, m) => {
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
                    .setDescription("You must be an admin to unwarn someone")
                );
                return;
            }

            if (c.args.length != 1) {
                _sendUnwarnSyntax(channel);
                return;
            }
            
            const memberId = MentionHelper.GetIdFromMention(c.args[0]);
            if (!memberId) {
                _sendUnwarnSyntax(channel);
                return;
            }

            const warnedMember = m.mentions.members.get(memberId);
            if (!warnedMember) {
                _sendUnwarnSyntax(channel);
                return;
            }

            const serverId = guild.id;

            _warningRepo.getByUser(serverId, warnedMember.id, (e, w) => {
                if (w.length === 0) {
                    channel.send(new RichEmbed()
                        .setColor(0xf44542)
                        .setDescription(`${warnedMember.user.username} does not have any warnings`)
                    );
                    return;
                }

                m.channel.send(new RichEmbed()
                    .setColor(0xe8cb29)
                    .setDescription(`Unwarn ${warnedMember.user.username}? say \`yes\` to unwarn.`)
                ).then(() => {
                    const filter = response => 
                        response.author.id === claimant && 
                        response.content.trim().toLowerCase() === 'yes';

                    m.channel.awaitMessages(filter, { maxMatches: 1, time: 30000, errors: ['time'] })
                        .then(collected => {
                            const warningId = w[w.length - 1].id;
                            _warningRepo.delete(warningId);

                            m.channel.send(new RichEmbed()
                                .setColor(0xf44542)
                                .setDescription(`${warnedMember.user.username}'s last warning has been deleted`));
                        });
                });
            });
        });

        router.RegisterRoute('warnings', (c, m) => {
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

                if (w.length === 0) {
                    m.channel.send(new RichEmbed()
                        .setColor(0xe8cb29)
                        .setDescription("There are no warnings issued")
                    );
                    return;
                }

                const warningSets: {[id: string]: Warning[]} = {};
                w.forEach(x => {
                    if (!warningSets[x.user]) {
                        warningSets[x.user] = [];
                    }

                    warningSets[x.user].push(x);
                });

                const warnedUsernames: {[name: string]: string} = {};
                Object.keys(warningSets).forEach(x => {
                    const member = guild.members.get(x);
                    if (member) {
                        warnedUsernames[member.user.username] = x;
                    }
                })

                const embed = new RichEmbed().setColor(0xb2e829);
                Object.keys(warnedUsernames).sort().forEach(username => {
                    const id = warnedUsernames[username];
                    const warnings = warningSets[id];

                    const userDescription = `${username} (${warnings.length})`;
                    const reasons = warnings
                        .map(x => `for ${x.reason} (${new Date(x.date).toLocaleDateString('en-AU')})`)
                        .join('\n');

                    embed.addField(userDescription, reasons);
                });

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