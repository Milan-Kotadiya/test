import { EmitDataInterface, REMATCHREQdata, REMATCH } from '../../Interface';
import { Player } from '../Constructors/PlayerConstructor';
import { GetReMatchResponse, GetUser, SetReMatchResponse } from '../RedisFunctions/RedisAll';

export const Rematch = async (EmitData: EmitDataInterface, EntryFee) => {
  try {
    const REQdata: REMATCHREQdata = EmitData.ReqData;
    let ReMatchResponse: REMATCH = await GetReMatchResponse(REQdata.TableId);
    const User: Player = await GetUser(REQdata.UserID);

    if (User.chips > EntryFee && REQdata.Response === true) {
      if (ReMatchResponse) {
        ReMatchResponse.True.push(REQdata.UserID);
        ReMatchResponse = ReMatchResponse;
        await SetReMatchResponse(REQdata.TableId, ReMatchResponse);
      }

      if (!ReMatchResponse) {
        const NewReMatchResponse: REMATCH = {
          id: REQdata.TableId,
          True: [REQdata.UserID],
          False: [],
        };
        await SetReMatchResponse(REQdata.TableId, NewReMatchResponse);
      }
    }
    if (User.chips > EntryFee && REQdata.Response === false) {
      if (ReMatchResponse) {
        ReMatchResponse.False.push(REQdata.UserID);
        ReMatchResponse = ReMatchResponse;
        await SetReMatchResponse(REQdata.TableId, ReMatchResponse);
      }

      if (!ReMatchResponse) {
        const NewReMatchResponse: REMATCH = {
          id: REQdata.TableId,
          False: [REQdata.UserID],
          True: [],
        };
        await SetReMatchResponse(REQdata.TableId, NewReMatchResponse);
      }
    }

    if (User.chips < EntryFee) {
      if (ReMatchResponse) {
        ReMatchResponse.False.push(REQdata.UserID);
        ReMatchResponse = ReMatchResponse;
        await SetReMatchResponse(REQdata.TableId, ReMatchResponse);
      }

      if (!ReMatchResponse) {
        const NewReMatchResponse: REMATCH = {
          id: REQdata.TableId,
          False: [REQdata.UserID],
          True: [],
        };
        await SetReMatchResponse(REQdata.TableId, NewReMatchResponse);
      }
    }
  } catch (error: any) {
    // Error
  }
};
