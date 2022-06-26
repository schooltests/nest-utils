import * as ev from 'events';
import { VkDonutEvents, VkNewMessageEvent, VkNewPaymentEvent } from '../models';

export const enum BusEvent {
  VkLongPollMessages = 'vk_long_poll_messages',
  VkLongPollPayments = 'vk_long_poll_payments',
  VkLongPollDonut = 'vk_long_poll_donut',
}

export interface BusEventDto {
  [BusEvent.VkLongPollMessages]: { messages: VkNewMessageEvent[] };
  [BusEvent.VkLongPollPayments]: { payments: VkNewPaymentEvent[] };
  [BusEvent.VkLongPollDonut]: { donut: VkDonutEvents };
}

class ClientCallbackClass extends ev.EventEmitter {
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
