#include "predictions.h"
#include "../layers/info.h"
#include "../layers/predictions.h"
#include <pebble.h>
#include <stdio.h>

enum {
  // Inbound message keys
  KEY_PREDICTION_TITLE           = 202,
  KEY_PREDICTION_SECONDS_1       = 203,
  KEY_PREDICTION_SECONDS_2       = 204,
  KEY_PREDICTION_SECONDS_3       = 205,
  KEY_PREDICTION_SECONDS_4       = 206,
  KEY_PREDICTION_SECONDS_5       = 207,
  KEY_PREDICTION_TTC_ALERT       = 208,
  KEY_PREDICTION_SHOW            = 209,
};

static Window *s_predictions_window;

static DisplayableItem s_displayable_items[10];
static int s_displayable_items_count;

static char* strdup(const char* str);
static void predictions_window_disappear();
static void update_prediction_times(tm *tick_time, TimeUnits units_changed);

void predictions_window_inbox_received(DictionaryIterator *iterator, void *context) {
  for(int key = KEY_PREDICTION_TITLE; key <= KEY_PREDICTION_SHOW; key++) {
    Tuple *tuple = dict_find(iterator, key);
    if (tuple == NULL) {
      continue;
    }
    switch (tuple->key) {
      case KEY_PREDICTION_TITLE:
      case KEY_PREDICTION_TTC_ALERT:
        s_displayable_items_count++;
        s_displayable_items[s_displayable_items_count].text = strdup(tuple->value->cstring);
        s_displayable_items[s_displayable_items_count].times_count = 0;
        s_displayable_items[s_displayable_items_count].is_prediction = tuple->key == KEY_PREDICTION_TITLE;
        break;
      case KEY_PREDICTION_SECONDS_1:
      case KEY_PREDICTION_SECONDS_2:
      case KEY_PREDICTION_SECONDS_3:
      case KEY_PREDICTION_SECONDS_4:
      case KEY_PREDICTION_SECONDS_5:
        s_displayable_items[s_displayable_items_count].times[tuple->key-KEY_PREDICTION_SECONDS_1] = tuple->value->int32;
        s_displayable_items[s_displayable_items_count].times_count++;
        break;
      case KEY_PREDICTION_SHOW:
        s_displayable_items_count++;
        predictions_window_make_visible(PRED_MODE_PREDICTIONS);
        tick_timer_service_subscribe(SECOND_UNIT, update_prediction_times);
        break;
    }
  }
}

void predictions_window_make_visible(int mode) {
  if (!s_predictions_window) {
    s_predictions_window = window_create();
    window_set_window_handlers(s_predictions_window, (WindowHandlers) {
      .disappear = predictions_window_disappear,
    });
    predictions_layer_init(s_predictions_window);
  }
  if (window_stack_get_top_window() != s_predictions_window) {
    window_stack_push(s_predictions_window, true);
  }
  if (mode == PRED_MODE_LOADING) {
    s_displayable_items_count = -1;
    info_show("LOADING PREDICTIONS...");
  } else if (mode == PRED_MODE_PREDICTIONS) {
    predictions_layer_update(s_displayable_items, s_displayable_items_count, true);
    info_hide();
  }
}

static void predictions_window_disappear() {
  tick_timer_service_unsubscribe();
  for(int i = 0; i < s_displayable_items_count; i++) {
    free(s_displayable_items[i].text);
  }
}

static void update_prediction_times(tm *tick_time, TimeUnits units_changed) {
  predictions_layer_update(s_displayable_items, s_displayable_items_count, false);
  layer_mark_dirty(window_get_root_layer(s_predictions_window));
}

static char* strdup(const char* str)
{
  return strcpy(malloc(strlen(str) * sizeof(char) + 1), str);
}
