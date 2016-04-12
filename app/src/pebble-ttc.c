#include <pebble.h>
#include "windows/routes_list.h"
#include "windows/predictions.h"
#include "layers/info.h"
#include "modules/bluetooth.h"

static void app_init();
static void app_deinit();
void inbox_received_callback(DictionaryIterator *iterator, void *context);

int main(void) {
  app_init();
  app_event_loop();
  app_deinit();

  return 0;
}

static void app_init() {
  bluetooth_initialize(inbox_received_callback);
  routes_list_init();
}

static void app_deinit() {
  routes_list_deinit();
}

void inbox_received_callback(DictionaryIterator *iterator, void *context) {
  routes_list_inbox_received(iterator, context);
  predictions_window_inbox_received(iterator, context);
}

