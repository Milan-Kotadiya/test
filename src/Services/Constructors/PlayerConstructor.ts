export class Player {
  id: string;
  username: string;
  soketId: string;
  TableId: string;
  chips: any;
  GameDetails: {
    isDisconneted: boolean;
    MissedTurn: number;
    DisconnectedAt: string;
  };
  constructor(playerid: string, username: string, soketId: string, chips: any) {
    this.id = playerid;
    this.username = username;
    this.soketId = soketId;
    this.TableId = "";
    this.chips = chips;
    this.GameDetails = {
      isDisconneted: false,
      MissedTurn: 0,
      DisconnectedAt: "",
    };
  }
}
