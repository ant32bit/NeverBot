import { CommandRouterService } from "../../infrastructure/command-router";
import { MentionHelper } from "../../infrastructure/mention-helper";
import { WarningRepository, Warning } from "./warnings-repo";
import { AdminMessages } from "./messages";

const _warningRepo = new WarningRepository();
const _messages = new AdminMessages();

export abstract class AdminRoutes {

    public static RegisterRoutes(router: CommandRouterService) {
        
        router.RegisterRoute('warn', (c, m) => {
            if (m.author.bot) {return;}

            const guild = m.guild;
            if (!guild) {return;}

            const claimant = m.author.id;
            const guildMember = guild.member(claimant);
            if (!guildMember) {return;}

            if (!guildMember.hasPermission("BAN_MEMBERS")) {
                m.channel.send(_messages.RequiresAdmin("warn someone"));
                return;
            }

            if (c.args.length < 2) {
                m.channel.send(_messages.Syntax("warn"));
                return;
            }
            
            const memberId = MentionHelper.GetIdFromMention(c.args[0]);
            if (!memberId) {
                m.channel.send(_messages.Syntax("warn"));
                return;
            }

            const warnedMember = m.mentions.members.get(memberId);
            if (!warnedMember) {
                m.channel.send(_messages.Syntax("warn"));
                return;
            }

            const reason = c.args.slice(1).join(" ");
            const serverId = guild.id;

            _warningRepo.add(serverId, warnedMember.id, reason);

            m.channel.send(_messages.UserWarned(warnedMember.user.username));
        });

        router.RegisterRoute('unwarn', (c, m) => {
            if (m.author.bot) {return;}

            const guild = m.guild;
            if (!guild) {return;}

            const claimant = m.author.id;
            const guildMember = guild.member(claimant);
            if (!guildMember) {return;}

            if (!guildMember.hasPermission("BAN_MEMBERS")) {
                m.channel.send(_messages.RequiresAdmin("unwarn someone"));
                return;
            }

            if (c.args.length != 1) {
                m.channel.send(_messages.Syntax("unwarn"));
                return;
            }
            
            const memberId = MentionHelper.GetIdFromMention(c.args[0]);
            if (!memberId) {
                m.channel.send(_messages.Syntax("unwarn"));
                return;
            }

            const warnedMember = m.mentions.members.get(memberId);
            if (!warnedMember) {
                m.channel.send(_messages.Syntax("unwarn"));
                return;
            }

            const serverId = guild.id;

            _warningRepo.getByUser(serverId, warnedMember.id, (e, w) => {
                if (w.length === 0) {
                    m.channel.send(_messages.NoWarnings(warnedMember.user.username));
                    return;
                }

                const confirmCommand = "yes";
                m.channel.send(_messages.ConfirmUnwarn(warnedMember.user.username, confirmCommand)).then(() => {
                    const filter = response => 
                        response.author.id === claimant && 
                        response.content.trim().toLowerCase() === confirmCommand;

                    m.channel.awaitMessages(filter, { maxMatches: 1, time: 30000, errors: ['time'] })
                        .then(collected => {
                            const warningId = w[w.length - 1].id;
                            _warningRepo.delete(warningId);

                            m.channel.send(_messages.UserUnwarned(warnedMember.user.username));
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
                    m.channel.send(_messages.DatabaseError("Couldn't get warnings"));
                    return;
                }

                if (w.length === 0) {
                    m.channel.send(_messages.NoWarnings());
                    return;
                }

                const warningSets: {[id: string]: Warning[]} = {};
                m.channel.send(_messages.DisplayWarnings(w, id => {
                    const member = guild.members.get(id);
                    if (!member) { return null; }
                    return member.user.username;
                }));
            }

            if (c.args.length === 0) {
                _warningRepo.get(guild.id, f);
                return;
            }

            if (c.args.length > 1) {
                m.channel.send(_messages.Syntax("warnings"));
                return;
            }
            
            const memberId = MentionHelper.GetIdFromMention(c.args[0]);
            if (!memberId) {
                m.channel.send(_messages.Syntax("warnings"));
                return;
            }

            const warnedMember = m.mentions.members.get(memberId);
            if (!warnedMember) {
                m.channel.send(_messages.Syntax("warnings"));
                return;
            }

            _warningRepo.getByUser(guild.id, warnedMember.id, f);
        });


    }
}