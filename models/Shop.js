const mong = require('mongoose');

const userSche = new mong.Schema({

        picture: {
          type: String
        },
        name: {
          type: String
        },
        email: {
          type: String
        },
        city: {
          type: String
        },
        location: {
          type: {
            type: String
          },
          coordinates: {
            type: []
          }
        }
      
});
const shop = mong.model("shop",userSche);

module.exports = shop;