// controlFlow.js
// Logik für Kartenscanner
const dbFunctions = require('./db_functions.js');

async function handleCardSwipe(card_id_hash, room_id) {
  try {
    const isRegistered = await dbFunctions.checkHashRegistered(card_id_hash);
    if (!isRegistered) {
      
      await dbFunctions.registerHashDefault(card_id_hash); 
      await dbFunctions.assignRoom(card_id_hash, room_id);
    } else {

      const isUserInRoom = await dbFunctions.userInRoom(card_id_hash, room_id);

      if (isUserInRoom) {

        await dbFunctions.leaveRoom(card_id_hash);
      } else {
        const isUserStaff = await dbFunctions.checkStaff(card_id_hash);

        if (isUserStaff) {
          await dbFunctions.clearAndClaimRoom(room_id, card_id_hash);
        } else {
          await dbFunctions.assignRoom(card_id_hash, room_id);
        }
      }
    }
  } catch (error) {
    console.log('Error in handling card swipe: ', error);
  }
}

module.exports = { handleCardSwipe };
