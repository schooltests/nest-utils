import { BusEvent, EventBus } from '@events';
import { VkNewMessageEvent, VkNewPaymentEvent } from '@models';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { buildQueryString } from '@utils';
import { asyncScheduler, firstValueFrom } from 'rxjs';
import { vkApi } from './constants';

type IntegrationConfigProps = () => {
  groupId: number;
  groupAccessKey: string;
};

@Injectable()
export class VkLongpollService implements OnModuleInit {
  private server?: string;
  private key?: string;
  private ts?: string;
  private readonly logger = new Logger(VkLongpollService.name);

  constructor(
    private httpService: HttpService,
    @Inject('integration')
    private config: ConfigType<IntegrationConfigProps>,
  ) {}

  async onModuleInit() {
    if (!this.config.groupId || !this.config.groupAccessKey) {
      this.logger.error('Cannot start long poll. Missing required keys: groupId or accessToken');
      return;
    }

    this.logger.debug(`The module has been initialized.`);
    this.init();
  }

  async init() {
    const longPollServer = await this.fetchLongPollServer(Number(this.config.groupId));
    if (!longPollServer) {
      this.logger.log(`No info from fetchLongPollServer`);
      asyncScheduler.schedule(() => {
        this.init();
        this.logger.log(`fetchLongPollServer reInit`);
      }, 5000);
      return;
    }

    this.server = longPollServer.server;
    this.key = longPollServer.key;
    this.ts = longPollServer.ts;

    this.poll();
  }

  async fetchLongPollServer(groupId: number) {
    try {
      const result = await firstValueFrom(
        this.httpService.post(
          `https://api.vk.com/method/groups.getLongPollServer${buildQueryString([
            { group_id: `${groupId}` },
            {
              access_token: this.config.groupAccessKey!,
            },
            { v: vkApi },
          ])}`,
        ),
      );

      if (result.data.error) {
        this.logger.log('fetchLongPollServer failed ' + result.data.error?.error_msg);
        return null;
      }
      if (result.data.response && result.data.response.error) {
        this.logger.log('fetchLongPollServer failed ' + result.data.response?.error);
        return null;
      }

      this.logger.log('fetchLongPollServer done');

      return {
        server: result.data.response?.server,
        key: result.data.response?.key,
        ts: result.data.response?.ts,
      };
    } catch (error) {
      this.logger.error('fetchLongPollServer error');
      console.error(error);
      return null;
    }
  }

  private async poll() {
    try {
      const result = await firstValueFrom(
        this.httpService.get(`${this.server}?act=a_check&key=${this.key}&ts=${this.ts}&wait=25`),
      );

      if (result.data.error) {
        this.logger.log('poll failed ' + result.data.error?.error_msg);
        this.init();
        return;
      }
      if (result.data.response && result.data.response.error) {
        this.logger.log('poll failed ' + result.data.response?.error);
        this.init();
        return;
      }

      if (result.data.failed === 2 || result.data.failed === 3) {
        this.logger.log('poll response failed to do some');
        this.init();
        return;
      }
      this.ts = result.data.ts;
      if (!!result.data.updates?.length) {
        this.logger.log('Push new updates');
        const payments = result.data.updates.filter((u: VkNewPaymentEvent) => u.type === 'vkpay_transaction');
        const messages = result.data.updates.filter((u: VkNewMessageEvent) => u.type === 'message_new');
        if (payments?.length) {
          EventBus.emit(BusEvent.VkLongPollPayments, {
            payments,
          });
        }
        if (messages?.length) {
          EventBus.emit(BusEvent.VkLongPollMessages, {
            messages,
          });
        }
      }

      this.poll();
    } catch (error) {
      this.logger.error('poll error');
      console.error(error);
      this.init();
    }
  }
}
