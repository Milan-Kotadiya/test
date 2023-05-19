import { GameBasic } from '../Interface';

export class ModelOptions {
  options: GameBasic = {
    GameTime: 3, // Game Time (In Minutes , typeOf Number)
    LobbyWaitTime: 5, // How Many Seconds, Player Wait in lobby For Another Player TO Join Table (In second, typeOf Number)
    PlayersPerTable: 4, // How Many Player's Need On Table TO Start Game (typeOf Number)
    isMinPlayerModeOn: false, // If game Is For 4 Players But we can start if Two Player Join then, Value of isMinPlayerModeOn = true
    MinPlayerToStartGame: 2, // if isMinPlayerModeOn = true then number of Player reuire to start game, else make it 0
    RemacthWaitTime: 60, // After Game Over After How Many Seconds Need To Check Rematch Response (Which Is sent By Player) (In second, typeOf Number),
    isTableWithEntryFee: false, // IF Table is based On entryFee Like Table For 500 Coins, 300 Coins Then (true) else (false) (typeOf boolean)
    ReconnectWithin: 30,
  };

  constructor(options: GameBasic) {
    this.options = options;
  }
}
