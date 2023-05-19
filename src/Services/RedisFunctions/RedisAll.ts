import { redisClient } from '../../Connections/Redis';
import { REMATCH } from '../../Interface';
import { Game } from '../Constructors/GameConstructor';
import { Player } from '../Constructors/PlayerConstructor';
import { Table } from '../Constructors/TableConstructor';

export const AddUser = async (UserId: string, USERDATA: Player) => {
  try {
    const key = `USER:${UserId}`;
    await redisClient.set(key, JSON.stringify(USERDATA));
    return;
  } catch (error: any) {
    // Logger.error(`Error At AddUser :: ${USERDATA.id} not found`);
  }
};
export const GetUser = async (UserId: string) => {
  try {
    const key = `USER:${UserId}`;
    let User = await redisClient.get(key);
    User = JSON.parse(User);
    if (User) {
      return User;
    }
  } catch (error: any) {
    // Logger.error(`Error At GetUser :: ${UserId} not found`);
  }
};
export const DeleteUser = async (UserId: string) => {
  try {
    const key = `USER:${UserId}`;
    await redisClient.del(key);
    return;
  } catch (error: any) {
    // Logger.error(`Error At DeleteUser :: User id ${UserId} :: ${error.message}`);
  }
};

export const GetEmptyTable = async () => {
  try {
    const key = `EmptyTable:Table`;
    let Table = await redisClient.get(key);
    Table = JSON.parse(Table);
    if (!Table) {
      Table = [];
      return Table;
    } else {
      return Table;
    }
  } catch (error: any) {
    // Logger.error(`Error At GetEmptyTable :: ${error.message}`);
  }
};
export const SetEmptyTable = async (TableData: any) => {
  try {
    const key = `EmptyTable:Table`;
    await redisClient.set(key, JSON.stringify(TableData));
    return;
  } catch (error: any) {
    // Logger.error(`Error At SetEmptyTable :: ${error.message}`);
  }
};

export const SetTable = async (TableData: Table) => {
  try {
    const key = `Table:${TableData.id}`;
    await redisClient.set(key, JSON.stringify(TableData));
    return;
  } catch (error: any) {
    // Logger.error(`Error At SetEmptyTable :: ${error.message}`);
  }
};
export const getTable = async (Tableid: string) => {
  try {
    const key = `Table:${Tableid}`;
    let Table = await redisClient.get(key);
    Table = JSON.parse(Table);
    if (Table) {
      return Table;
    }
  } catch (error: any) {
    // Logger.error(`Error At SetEmptyTable :: ${error.message}`);
  }
};
export const DeleteTable = async (Tableid: string) => {
  try {
    const key = `Table:${Tableid}`;
    await redisClient.del(key);
    return;
  } catch (error: any) {
    // Logger.error(`Error At DeleteTable :: ${error.message}`);
  }
};

export const AddTGP = async (GAME: Game) => {
  try {
    const key = `TGP:${GAME.id}`;
    await redisClient.set(key, JSON.stringify(GAME));
    return;
  } catch (error: any) {
    // Logger.error(`Error At AddTGP :: ${error.message}`);
  }
};
export const GetTGP = async (Gameid: string) => {
  try {
    const key = `TGP:${Gameid}`;
    let GAME = await redisClient.get(key);
    if (GAME) {
      GAME = JSON.parse(GAME);
      return GAME;
    }
  } catch (error: any) {
    // Logger.error(`Error At GetTGP :: ${error.message}`);
  }
};
export const DeleteTGP = async (Gameid: string) => {
  try {
    const key = `TGP:${Gameid}`;
    await redisClient.del(key);
    return;
  } catch (error: any) {
    // Logger.error(`Error At DeleteTGP :: TGP id ${Gameid}, Error :: ${error.message}`);
  }
};

export const GetReMatchResponse = async (Gameid: string) => {
  try {
    const key = `REMATCH:${Gameid}`;
    let ReMatchResponse = await redisClient.get(key);
    ReMatchResponse = JSON.parse(ReMatchResponse);
    if (ReMatchResponse) {
      return ReMatchResponse;
    }
  } catch (error: any) {
    // Logger.error(`Error At GetReMatchResponse :: Error :: ${error.message}`);
  }
};
export const SetReMatchResponse = async (Gameid: string, ReMatchResponse: REMATCH) => {
  try {
    const key = `REMATCH:${Gameid}`;
    await redisClient.set(key, JSON.stringify(ReMatchResponse));
    return;
  } catch (error: any) {
    // Logger.error(`Error At SetReMatchResponse :: Error :: ${error.message}`);
  }
};
export const DeleteReMatchResponse = async (Gameid: string) => {
  try {
    const key = `REMATCH:${Gameid}`;
    await redisClient.del(key);
    return;
  } catch (error: any) {
    // Logger.error(`Error At DeleteTGP :: TGP id ${Gameid} ::, Error :: ${error.message}`);
  }
};

export const AddPGP = async (USERDATA: any) => {
  try {
    const key = `PGP:${USERDATA._id}`;
    await redisClient.set(key, JSON.stringify(USERDATA));
    return;
  } catch (error: any) {
    // Logger.error(`Error At AddPGP :: Error :: ${error.message}`);
  }
};
export const GetPGP = async (UserId: string) => {
  try {
    const key = `PGP:${UserId}`;
    let User = await redisClient.get(key);
    User = JSON.parse(User);
    if (User) {
      return User;
    }
  } catch (error: any) {
    // Logger.error(`Error At GetPGP :: ${UserId}, Error :: ${error.message}`);
  }
};
export const DeletePGP = async (UserId: string) => {
  try {
    const key = `PGP:${UserId}`;
    await redisClient.del(key);
    return;
  } catch (error: any) {
    // Logger.error(`Error At DeletePGP :: PGP id ${UserId}, Error :: ${error.message}`);
  }
};

export const SetKey = async (key: string, Keydata: any) => {
  try {
    await redisClient.set(key, JSON.stringify(Keydata));
    return;
  } catch (error: any) {
    // Logger.error(`Error At SetKey :: ${key} not found`);
  }
};
export const GetKey = async (key: string) => {
  try {
    let User = await redisClient.get(key);
    User = JSON.parse(User);
    if (User) {
      return User;
    }
  } catch (error: any) {
    // Logger.error(`Error At GetKey :: ${key} not found`);
  }
};
export const DeleteKey = async (key: string) => {
  try {
    await redisClient.del(key);
    return;
  } catch (error: any) {
    // Logger.error(`Error At DeleteKey :: ${key}, Error :: ${error.message}`);
  }
};
