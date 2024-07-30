const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_PROVIDER_APP_ID = process.env.ONESIGNAL_PROVIDER_APP_ID;
const OneSignal2 = require('onesignal-node');
// With default options
const client2 = new OneSignal2.Client(ONESIGNAL_APP_ID, process.env.ONESIGNAL_REST_API_KEY);
const providerclient2 = new OneSignal2.Client(ONESIGNAL_PROVIDER_APP_ID, process.env.ONESIGNAL_PROVIDER_REST_API_KEY);
var notificationModel = require('../models/notificationModel')
async function createNotification(message, id, type, playerId, user, userId, isFor, requestId, receiver) {
  console.log("notii ", message, id, type, playerId, user, userId, isFor, requestId, receiver)
  console.log(Array.isArray(playerId))
  console.log("playerId ", playerId)
  if (!Array.isArray(playerId)) {
    const newnotfication = await new notificationModel({
      message: message,
      type: type,
      isFor: isFor,
      id: id,
      userId: userId,
      requestId: requestId
    }).save();
    console.log("newnotfication ", newnotfication)
    return null
  }
  if (playerId.length < 1) {
    const newnotfication = await new notificationModel({
      message: message,
      type: type,
      isFor: isFor,
      id: id,
      userId: userId,
      requestId: requestId
    }).save();
    console.log("newnotfication ", newnotfication)
    return null
  }
  const notification = {
    contents: {
      en: message,
    },
    data: {
      id: id,
      type: type,
      isFor: isFor,
      userId: userId,
      requestId: requestId
    },
    include_player_ids: playerId,
    android_channel_id: user === "Customer" ? "8e75f728-bbbb-41ba-b946-003745791f48" : "bab7ccef-12f3-468d-af59-376b2d400a70",
    ios_sound: "buzzersound.wav",
  };
  console.log("notification ",notification)
  if (user === "Customer") {
    const response = await client2.createNotification(notification);
    const newnotfication = await new notificationModel({
      message: message,
      type: type,
      isFor: isFor,
      id: id,
      userId: userId,
      requestId: requestId
    }).save();
    console.log("newnotfication ", newnotfication)
    console.log("response ", response)
    return response
  } else {
    const response = await providerclient2.createNotification(notification);
    const newnotfication = await new notificationModel({
      message: message,
      type: type,
      isFor: isFor,
      id: id,
      userId: userId,
      requestId: requestId
    }).save();
    console.log("newnotfication ", newnotfication)
    console.log("response ", response)
    return response
  }

}
module.exports = {
  createNotification
}