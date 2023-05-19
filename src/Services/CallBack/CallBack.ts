import { io } from '../../Connections/Socket';
import { Player } from '../Constructors/PlayerConstructor';
import { GetUser } from '../RedisFunctions/RedisAll';

export const SendEventToUser = async (UserId: string, EventName: string, EventDetails: any, Message: string) => {
  try {
    const PlayerLAST: Player = await GetUser(UserId);

    io.to(PlayerLAST.soketId).emit(
      EventName,
      JSON.stringify({
        EventDetails,
        Message,
      }),
    );
  } catch (error: any) {
    // Logger.error(`Error At CallBack: ${error.message}`);
  }
};
