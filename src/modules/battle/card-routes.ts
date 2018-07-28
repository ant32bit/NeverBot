import { CommandRouterService } from "../../infrastructure/command-router";
import { Message } from "discord.js";
import { PlayersRepo } from "./players";
import { GameDataRepo, CardData } from "./gamedata";

export abstract class CardRoutes {
    public static RegisterRoutes(router: CommandRouterService) {
        
        const _playerRepo = new PlayersRepo();
        const _gameData =  new GameDataRepo();
        const _saveCardState: {[user: string]: SaveCardStateData} = {};
        const _cardIdx = {'1': 0, '2': 1 , '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '8': 7, '9': 8};

        router.RegisterOptionsRoutes(['1', '2', '3', '4', '5', '6', '7', '8', '9', 'discard'], (o: string, m: Message): void => {
            const userId = m.author.id;
            const state = _saveCardState[userId];

            if (!state) { return; }

            if (o === 'discard') {
                state.message.edit(`**${m.author.username}** got a ${state.card.name} and discarded it.\n`);
                delete _saveCardState[userId];
                return;
            }
            
            if (_cardIdx[o] != null) {
                const player = _playerRepo.getPlayer(userId);
                const oldPlayerCard = player.cards[_cardIdx[o]]
                const oldCard = _gameData.GetCardData(oldPlayerCard.id);

                player.cards[_cardIdx[o]] = {
                    id: state.card.id,
                    equipped: false
                };

                _playerRepo.updatePlayer(player);

                state.message.edit(`**${m.author.username}** got a ${state.card.name} and replaced ${oldCard.name}.\n`);
                return;
            }
        });

        router.RegisterSubroute('card', 'daily', (c, m) => {
            let user = m.author;
            if (_playerRepo.getDaily(user.id)) {
                const cardId = _gameData.PickCard();
                const card = _gameData.GetCardData(cardId);
                let player = _playerRepo.getPlayer(user.id);
                let cardIndex = 1;
                for (cardIndex = 0; cardIndex < 9; cardIndex++) {
                    if (!player.cards[cardIndex]) {
                        player.cards[cardIndex] = { id: cardId, equipped: false };
                        _playerRepo.updatePlayer(player);
                        m.channel.send(`**${user.username}** got a ${card.name}.`);
                        return;
                    }
                }

                let choice = `**${user.username}** got a ${card.name} but has no room.\n\nCurrent cards:\n`;
                player.cards.forEach((x, i) => {
                    choice += `${i + 1}. ${_gameData.GetCardData(x.id).name} ${x.equipped ? '(E)' : ''}\n`;
                });
                choice += `\nEnter a slot [1-9] to replace, or type "discard" to discard it.`;

                m.channel.send(choice).then(msg => {
                    _saveCardState[user.id] = {
                        card: card,
                        message: <Message>msg
                    };

                    setTimeout(() => {
                        if (_saveCardState[user.id]) {
                            (<Message>msg).edit(`**${m.author.username}** got a ${card.name} and discarded it.\n`);
                            delete _saveCardState[user.id];
                        }
                    }, 60000);
                });
            }
            else {
                m.channel.send(`**${user.username}**, you've already had a daily today`)
            }
        });

        router.RegisterSubroute('card', 'list', (c, m) => {
            const player = _playerRepo.getPlayer(m.author.id);
            
            let response = `**${m.author.username}**'s cards:\n`;
            for (let i = 0; i < 9; i++) {
                if (player.cards[i]) {
                    response += `${i + 1}. ${_gameData.GetCardData(player.cards[i].id).name} ${player.cards[i].equipped ? '(E)' : ''}\n`;
                }
                else {
                    response += `${i + 1}.\n`
                }
            }

            m.channel.send(response);
        });

        router.RegisterSubroute('card', 'equip', (c, m) => {
            const player = _playerRepo.getPlayer(m.author.id);
            const i = _cardIdx[c.args[0]];

            if (i == null) { return; }
            const card = player.cards[i];

            if (!card) {
                m.channel.send(`There is no card in slot ${i + 1}`);
                return;
            }

            if (card.equipped) {
                m.channel.send(`${_gameData.GetCardData(card.id).name} is already equipped.`);
                return;
            }

            player.cards[i].equipped = true;
            _playerRepo.updatePlayer(player);
            m.channel.send(`**${m.author.username}** equipped ${_gameData.GetCardData(card.id).name}.`);
        });

        router.RegisterSubroute('card', 'unequip', (c, m) => {
            const player = _playerRepo.getPlayer(m.author.id);
            const i = _cardIdx[c.args[0]];

            if (i == null) { return; }
            const card = player.cards[i];

            if (!card) {
                m.channel.send(`There is no card in slot ${i + 1}`);
                return;
            }

            if (!card.equipped) {
                m.channel.send(`${_gameData.GetCardData(card.id).name} is already unequipped.`);
                return;
            }

            player.cards[i].equipped = false;
            _playerRepo.updatePlayer(player);
            m.channel.send(`**${m.author.username}** unequipped ${_gameData.GetCardData(card.id).name}.`);
        });
    }
}

class SaveCardStateData {
    card: CardData;
    message: Message;
}