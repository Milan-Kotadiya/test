import { REMATCH } from '../../Interface';
import { Player } from '../Constructors/PlayerConstructor';
import { GetReMatchResponse, GetUser, SetReMatchResponse, getTable } from '../RedisFunctions/RedisAll';
import { Socket } from 'socket.io';

export const Rematch = async (Response: boolean, socket: Socket) => {
  try {
    const UserDetails: { UserId: string; TableId: string } = socket.handshake.auth.UserDetails;
    if (!UserDetails) {
      return { error: true, msg: `Please Login` };
    }
    let ReMatchResponse: REMATCH = await GetReMatchResponse(UserDetails.TableId);
    const User: Player = await GetUser(UserDetails.UserId);
    const LastTable = await getTable(UserDetails.TableId);
    if (!User) {
      return { error: true, msg: `User Not Found` };
    }
    if (!LastTable) {
      return { error: true, msg: `Table Not Found` };
    }
    if (LastTable.EntryFee && User.chips) {
      if (User.chips > LastTable.EntryFee && Response === true) {
        if (ReMatchResponse && !ReMatchResponse.True.includes(UserDetails.UserId)) {
          ReMatchResponse.True.push(UserDetails.UserId);
          ReMatchResponse = ReMatchResponse;
          await SetReMatchResponse(UserDetails.TableId, ReMatchResponse);
          return { error: false, msg: `Rematch Response :: True Submitted!!` };
        }

        if (!ReMatchResponse) {
          const NewReMatchResponse = {
            id: UserDetails.TableId,
            True: [UserDetails.UserId],
            False: [],
          };
          await SetReMatchResponse(UserDetails.TableId, NewReMatchResponse);
          return { error: false, msg: `Rematch Response :: True Submitted!!` };
        }
      }
      if (User.chips > LastTable.EntryFee && Response === false) {
        if (ReMatchResponse && !ReMatchResponse.False.includes(UserDetails.UserId)) {
          ReMatchResponse.False.push(UserDetails.UserId);
          ReMatchResponse = ReMatchResponse;
          await SetReMatchResponse(UserDetails.TableId, ReMatchResponse);
          return { error: false, msg: `Rematch Response :: False Submitted!!` };
        }

        if (!ReMatchResponse) {
          const NewReMatchResponse = {
            id: UserDetails.TableId,
            False: [UserDetails.UserId],
            True: [],
          };
          await SetReMatchResponse(UserDetails.TableId, NewReMatchResponse);
          return { error: false, msg: `Rematch Response :: False Submitted!!` };
        }
      }

      if (User.chips < LastTable.EntryFee) {
        if (ReMatchResponse && !ReMatchResponse.False.includes(UserDetails.UserId)) {
          ReMatchResponse.False.push(UserDetails.UserId);
          ReMatchResponse = ReMatchResponse;
          await SetReMatchResponse(UserDetails.TableId, ReMatchResponse);
          return { error: true, msg: `You Dont have Enough Coins` };
        }

        if (!ReMatchResponse) {
          const NewReMatchResponse = {
            id: UserDetails.TableId,
            False: [UserDetails.UserId],
            True: [],
          };
          await SetReMatchResponse(UserDetails.TableId, NewReMatchResponse);
          return { error: true, msg: `You Dont have Enough Coins` };
        }
      }
    } else {
      if (Response === true) {
        if (ReMatchResponse && !ReMatchResponse.True.includes(UserDetails.UserId)) {
          ReMatchResponse.True.push(UserDetails.UserId);
          ReMatchResponse = ReMatchResponse;
          await SetReMatchResponse(UserDetails.TableId, ReMatchResponse);
          return { error: false, msg: `Rematch Response :: True Submitted!!` };
        }

        if (!ReMatchResponse) {
          const NewReMatchResponse = {
            id: UserDetails.TableId,
            True: [UserDetails.UserId],
            False: [],
          };
          await SetReMatchResponse(UserDetails.TableId, NewReMatchResponse);
          return { error: false, msg: `Rematch Response :: True Submitted!!` };
        }
      }
      if (Response === false) {
        if (ReMatchResponse && !ReMatchResponse.False.includes(UserDetails.UserId)) {
          ReMatchResponse.False.push(UserDetails.UserId);
          ReMatchResponse = ReMatchResponse;
          await SetReMatchResponse(UserDetails.TableId, ReMatchResponse);
          return { error: false, msg: `Rematch Response :: False Submitted!!` };
        }

        if (!ReMatchResponse) {
          const NewReMatchResponse = {
            id: UserDetails.TableId,
            False: [UserDetails.UserId],
            True: [],
          };
          await SetReMatchResponse(UserDetails.TableId, NewReMatchResponse);
          return { error: false, msg: `Rematch Response :: False Submitted!!` };
        }
      }
    }
  } catch (error: any) {
    // Error
  }
};
