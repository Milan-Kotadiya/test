export class Game {
  id: string;
  Players: string[];
  CreatedAt: string;
  EndAt: string;
  isWinner: boolean;
  winner: string;
  GameOverReason: string;
  constructor(tableid: string, Players: any) {
    const GameTime = 3;
    this.id = tableid;
    this.Players = Players;
    this.CreatedAt = new Date().toString();
    this.EndAt = new Date(new Date().getTime() + GameTime * 60 * 1000).toString();
    this.isWinner = false;
    this.winner = '';
    this.GameOverReason = '';
  }
}
