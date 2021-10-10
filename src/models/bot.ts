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
