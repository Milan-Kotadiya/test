import Emitter from "../Connections/Emitter";

const LobbyTimer = (callback: (Data: { LobbyTableID: string; UserId: string; MSG: string }) => void)=> {
    Emitter.on('GameTimer', async (Data) => {
      if (Data.TimerTitle === 'LobbyTimer') {
        callback(Data.TimerData);
      }
    });
  }
const GameStarted = (callback: (Data: { TableID: string; MSG: string }) => void) => {
    Emitter.on('GameTimer', async (Data) => {
      if (Data.TimerTitle === 'GameCreated') {
        callback(Data.TimerData);
      }
    });
  }
const  GameTimeOver = (callback: (Data: { TableID: string; MSG: string }) => void) => {
    Emitter.on('GameTimer', async (Data) => {
      if (Data.TimerTitle === 'GameTimeOver') {
        callback(Data.TimerData);
      }
    });
  }
const  RematchTimeOver = (callback: (Data: { TableID: string; ReMatchResponse: any; MSG: string }) => void) =>{
    Emitter.on('GameTimer', async (Data) => {
      if (Data.TimerTitle === 'RematchTimer') {
        callback(Data.TimerData);
      }
    });
  }

export const TimerAll = {
    LobbyTimer,
    GameStarted,
    GameTimeOver,
    RematchTimeOver
}