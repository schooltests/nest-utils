export type VkNewMessageEvent = {
  type: 'message_new';
  object: {
    message: MessageObject;
    client_info: ClientInfo;
  };
  group_id: number;
};

export type VkNewPaymentEvent = {
  type: 'vkpay_transaction';
  object: {
    from_id: number;
    amount: number;
  };
  group_id: number;
};

export type ClientInfo = {
  button_actions: ['text', 'vkpay', 'open_app', 'location', 'open_link', 'callback'];
  keyboard: boolean;
};

export type MessageObject = {
  from_id: number;
  peer_id: number;
  text: string;
  payload: BotPayloadType;
};

export type BotPayloadType = string;

export type VkAllEvents = VkDonutEvents | VkNewMessageEvent | VkNewPaymentEvent;
export type VkDonutEvents =
  | VkDonutSubCreateEvent
  | VkDonutSubProlongedEvent
  | VkDonutSubExpiredEvent
  | VkDonutSubCancelledEvent
  | VkDonutSubPriceChangeEvent;

export type VkDonutSubCreateEvent = {
  type: 'donut_subscription_create';
  object: {
    amount: number;
    amount_without_fee: number;
    user_id: number;
  };
  group_id: number;
};
export type VkDonutSubProlongedEvent = {
  type: 'donut_subscription_prolonged';
  object: {
    amount: number;
    amount_without_fee: number;
    user_id: number;
  };
  group_id: number;
};
export type VkDonutSubExpiredEvent = {
  type: 'donut_subscription_expired';
  object: {
    user_id: number;
  };
  group_id: number;
};
export type VkDonutSubCancelledEvent = {
  type: 'donut_subscription_cancelled';
  object: {
    user_id: number;
  };
  group_id: number;
};
export type VkDonutSubPriceChangeEvent = {
  type: 'donut_subscription_price_changed';
  object: {
    user_id: number;
    amount_old: number;
    amount_new: number;
    amount_diff: number;
    amount_diff_without_fee: number;
  };
  group_id: number;
};
