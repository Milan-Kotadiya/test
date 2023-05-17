import { io } from '../../Connections/Socket';
import { CallBackInterface } from '../../Interface/CallBackInterface';

export const CallBack = (CALLBACK: CallBackInterface) => {
  try {
    // Logger.info(
    //   `RES SEND ====> UserID:: ${CALLBACK.SendTo}, EVENTNAME :: ${
    //     CALLBACK.EventName
    //   }, EVENTDETAILS :: ${JSON.stringify(CALLBACK.EventDetails)}`
    // );
    io.to(CALLBACK.SendTo).emit(
      'RES',
      JSON.stringify({
        EventName: CALLBACK.EventName,
        EventDetails: CALLBACK.EventDetails,
        Message: CALLBACK.Message,
      }),
    );
  } catch (error: any) {
    // Logger.error(`Error At CallBack: ${error.message}`);
  }
};
