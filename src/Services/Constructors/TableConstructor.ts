export class Table {
  id: string;
  CreatedAt: string;
  EndAt: string;
  Players: string[];
  EntryFee?: number;
  constructor(tableid: string, Player: any, GameTime: number, EntryFee?: number) {
    this.id = tableid;
    this.Players = [Player];
    this.CreatedAt = new Date().toString();
    this.EndAt = new Date(new Date().getTime() + GameTime * 60 * 1000).toString();
    if (EntryFee) {
      this.EntryFee = EntryFee;
    }
  }
}
