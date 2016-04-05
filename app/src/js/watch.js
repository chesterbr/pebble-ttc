// Asynchronous communication with Pebble

var stopsAndRoutes;
var routeSelectedCallback;

function addEventListener(event, callback) {
  if (event == "route_selected") {
    routeSelectedCallback = callback;
  } else {
    Pebble.addEventListener(event, callback);
  }
}

function sendRoutes(routes) {
  stopsAndRoutes = routes;
  buildMenuMessages();
  dispatchMessages();
}

function sendPredictions(predictions) {
  console.log(JSON.stringify(predictions));
  buildPredictionMessages();
  dispatchMessages();
}

module.exports.addEventListener = addEventListener;
module.exports.sendRoutes = sendRoutes;
module.exports.sendPredictions = sendPredictions;

Pebble.addEventListener('appmessage', processIncomingMessage);

// Stops and routes (menu)

function buildMenuMessages() {
  appendToMessage('menu_section_count', stopsAndRoutes.length);
  appendToMessage('menu_string_buffer_size', calcBufferSizeForMenuStrings());

  stopsAndRoutes.forEach(function(stop) {
    routes = stop['routes'];
    appendToMessage('menu_section_items_count', routes.length);
    appendToMessage('menu_section_title', stop['stop']);
    routes.forEach(function(route) {
      appendToMessage('menu_item_title', route['route']);
      appendToMessage('menu_item_subtitle', route['direction']);
    });
    enqueueMessage();
  });

  appendToMessage('menu_show', 0);
  enqueueMessage();
}

function calcBufferSizeForMenuStrings() {
  var size = 0;
  stopsAndRoutes.forEach(function(stop) {
    routes = stop['routes'];
    size += stop['stop'].length + 1;
    routes.forEach(function(route) {
      size += route['route'].length + 1;
      size += route['direction'].length + 1;
    });
  });
  return size;
}

// Predictions (screen)

function buildPredictionMessages() {
  // A prediction for a stop/route can have any number of "direction"s (usually
  // variations of the same line) and TTC "message"s (e.g., for construction)
  var directions = values(predictions, 'direction');
  var ttcAlerts = values(predictions, 'message');

  appendToMessage('prediction_direction_count', Math.max(directions.length, 1));
  appendToMessage('prediction_ttc_alert_count', ttcAlerts.length);

  if (directions.length == 0) {
    appendToMessage('prediction_title', predictions.dirTitleBecauseNoPredictions);
  } else {
    directions.forEach(function(direction) {
      appendToMessage('prediction_title', direction.title);
      var times = values(direction, 'prediction');
      times.forEach(function(time) {
        appendToMessage('prediction_seconds', parseInt(time.seconds));
      });
      enqueueMessage();
    });
  }

  ttcAlerts.forEach(function(alert) {
    appendToMessage('prediction_ttc_alert', alert.text);
    enqueueMessage();
  });

  appendToMessage('prediction_show', 0);
  enqueueMessage();
}

function values(obj, tagName) {
  // Needed because tags that appear multiple times on the TTC API XML
  // are repesented like sometag_1, sometag_2, etc.
  return Object.keys(obj).sort().filter(function (key) {
    return key.indexOf(tagName + "_") == 0;
  }).map(function(key) {
    return obj[key];
  });
}

// Outgoing message queuing/dispatching (for all screens)

var MAX_ITEMS_PER_MESSAGE = 10;

var messageQueue = [];
var message = {};
var keySuffix = 1;

function appendToMessage(type, value) {
  var key = 'KEY_' + type.toUpperCase();
  if (type == 'menu_item_title') {
    key += '_' + keySuffix;
  } else if (type == 'menu_item_subtitle' || type == 'prediction_seconds') {
    key += '_' + keySuffix++;
  }
  message[key] = value;

  if (keySuffix > MAX_ITEMS_PER_MESSAGE) {
    enqueueMessage();
  }
}

function enqueueMessage() {
  if (message && Object.keys(message).length > 0) {
    messageQueue.push(message);
  }
  message = {}
  keySuffix = 1;
}

function dispatchMessages() {
  var dict = messageQueue.shift();
  if (dict) {
    Pebble.sendAppMessage(dict, function(e) {
      dispatchMessages();
    }, function(e) {
      console.log('Error sending message to Pebble!' + JSON.stringify(e));
    });
  }
}

// Incoming message processing

function processIncomingMessage(message) {
  stop = message.payload.KEY_MENU_SELECTED_SECTION;
  route = message.payload.KEY_MENU_SELECTED_ITEM;
  if (typeof(stop) == "number") {
    routeSelectedCallback(stopsAndRoutes[stop].routes[route].uri);
  }
}
