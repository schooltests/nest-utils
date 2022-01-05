import EventEmitter from 'events';
import { VkNewMessageEvent, VkNewPaymentEvent } from '@models';

export enum BusEvent {
  VkLongPollMessages = 'vk_long_poll_messages',
  VkLongPollPayments = 'vk_long_poll_payments',
}

export type BusEventDto = {
  [BusEvent.VkLongPollMessages]: { messages: VkNewMessageEvent[] };
  [BusEvent.VkLongPollPayments]: { payments: VkNewPaymentEvent[] };
};

class ClientCallbackClass extends EventEmitter {
  constructor() {
    super();
  }

  emit<BE extends BusEvent>(event: BE, data: BusEventDto[BE]): boolean {
    return super.emit(event, data);
  }

  on<BE extends BusEvent>(event: BE, listener: (data: BusEventDto[BE]) => void): this {
    return super.on(event, listener);
  }
}

export const EventBus = new ClientCallbackClass();
