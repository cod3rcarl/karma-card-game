const suits = ['♠ ', '♦ ', '♣ ', '♥ '];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const weights = [14, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
const type = ['normal', 'wild', 'wild', 'normal', 'normal', 'normal', 'lower', 'normal', 'normal', 'wild', 'normal', 'normal', 'normal'];
const facing = ['down'];
const disabled = [false];

export const getDeck = () => {
  let cards = [];
  for (var k = 0; k < facing.length; k++) {
    for (var j = 0; j < facing.length; j++) {
      for (var i = 0; i < suits.length; i++) {
        for (var x = 0; x < values.length; x++) {
          var card = { value: `${values[x]}${suits[i]}`, weight: weights[x], type: type[x], facing: facing[j], disabled: disabled[j] };
          cards.push(card);
        }
      }
    }
  }
  return cards;
};

export const shuffleDeck = () => {
  let cards = [];
  for (var k = 0; k < facing.length; k++) {
    for (var j = 0; j < facing.length; j++) {
      for (var i = 0; i < suits.length; i++) {
        for (var x = 0; x < values.length; x++) {
          var card = { value: `${values[x]}${suits[i]}`, weight: weights[x], type: type[x], facing: facing[j], disabled: disabled[j] };
          cards.push(card);
        }
      }
    }
  }

  let count = 52;
  while (count) {
    cards.push(cards.splice(Math.floor(Math.random() * count), 1)[0]);
    count -= 1;
  }
  return cards;
};
