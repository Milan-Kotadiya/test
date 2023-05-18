export class Player {
  UserId: string;
  UserName: string;
  Password: string;
  Salt: string;
  soketId: string;
  TableId: string;
  auth: string;
  chips?: number;
  GameDetails: {
    isDisconneted: boolean;
    MissedTurn: number;
    DisconnectedAt: string;
  };

  constructor(
    playerid: string,
    username: string,
    Password: string,
    Salt: string,
    soketId: string,
    chips: number = null,
  ) {
    this.UserId = playerid;
    this.UserName = username;
    this.Password = Password;
    this.Salt = Salt;
    this.soketId = soketId;
    this.auth = '';
    this.TableId = '';
    if (chips) {
      this.chips = chips;
    }
    this.GameDetails = {
      isDisconneted: false,
      MissedTurn: 0,
      DisconnectedAt: '',
    };
  }
}
