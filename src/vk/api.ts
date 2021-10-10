import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { firstValueFrom } from 'rxjs';
import { buildQueryString } from 'src/utils/api';
import { vkApi } from '.';

export enum Language {
  RU = 'ru',
  EN = 'en',
}

@Injectable()
export class VkApiService {
  private readonly logger = new Logger(VkApiService.name);
  constructor(private httpService: HttpService, private configService: ConfigService) {}

  async updateWithAvatars(userIds: number[], language?: Language) {
    if (!userIds.length) {
      return [];
    }
    try {
      const ids = userIds.join(',');
      const result = await firstValueFrom(
        this.httpService.post(
          `https://api.vk.com/method/users.get${buildQueryString([
            { user_ids: `${ids}` },
            { fields: 'photo_100' },
            {
              access_token: this.configService.get<string>('integration.vkServiceKey', ''),
            },
            { v: vkApi },
            { lang: language ?? Language.RU },
          ])}`,
        ),
      );

      if (result.data.error) {
        this.logger.log(`updateWithAvatars failed ${result.data.error?.error_msg}`);
        return [];
      }
      if (result.data.response && result.data.response.error) {
        this.logger.log(`updateWithAvatars failed ${result.data.response?.error}`);
        return [];
      }

      const avatars: {
        id: number;
        photo_100: string;
        first_name: string;
        last_name: string;
      }[] = result.data.response;

      const updatedUsers: {
        userId: number;
        avatar: string;
        name: string;
        firstName: string;
        lastName: string;
      }[] = avatars.map(a => ({
        userId: a.id,
        avatar: a.photo_100,
        name: `${a.first_name || ''} ${a.last_name || ''}`,
        firstName: a.first_name || '',
        lastName: a.last_name || '',
      }));

      this.logger.log(`updateWithAvatars done`);
      return updatedUsers;
    } catch (error) {
      this.logger.error(`updateWithAvatars error`);
      console.error(error);
      return [];
    }
  }

  async sendPushNotification(userIds: number[], message: string, language?: Language) {
    if (!userIds.length) {
      return;
    }
    try {
      const result = await firstValueFrom(
        this.httpService.post(
          `https://api.vk.com/method/notifications.sendMessage${buildQueryString([
            { user_ids: userIds.join(',') },
            { message },
            {
              access_token: this.configService.get<string>('integration.vkServiceKey', ''),
            },
            { v: vkApi },
          ])}`,
        ),
      );

      if (result.data.error) {
        this.logger.log(`notification failed ${result.data.error?.error_msg}`);
      }

      this.logger.log(`notification sent`);
    } catch (error) {
      this.logger.error(`notification error`);
      console.error(error);
    }
  }

  async sendMessageToAdmins(keyboard: object, additionalText = '') {
    try {
      const url = `https://api.vk.com/method/messages.send${buildQueryString([
        {
          access_token: this.configService.get<string>('integration.groupAccessKey', ''),
        },
        {
          keyboard,
        },
        { v: vkApi },
        {
          peer_id: this.configService.get<string>('integration.botConversationId', '2000000001'),
        },
        {
          random_id: randomBytes(256).readBigInt64BE() as unknown as string,
        },
        { message: additionalText },
      ])}`;
      const result = await firstValueFrom(this.httpService.post(url));

      if (result.data.error) {
        this.logger.log('sendMessageToAdmins failed ' + result.data.error?.error_msg);
        return;
      }
      if (result.data.response && result.data.response.error) {
        this.logger.log('sendMessageToAdmins failed ' + result.data.response?.error);
        return;
      }

      this.logger.log('sendMessageToAdmins done');
    } catch (error) {
      this.logger.error('sendMessageToAdmins error');
      console.error(error);
    }
  }
  async sendMessageToUser(keyboard: object, additionalText = '', peerId: number) {
    try {
      const url = `https://api.vk.com/method/messages.send${buildQueryString([
        {
          access_token: this.configService.get<string>('integration.groupAccessKey', ''),
        },
        {
          keyboard,
        },
        { v: vkApi },
        {
          peer_id: peerId as unknown as string,
        },
        {
          random_id: randomBytes(256).readBigInt64BE() as unknown as string,
        },
        { message: additionalText },
      ])}`;

      const result = await firstValueFrom(this.httpService.post(url));

      if (result.data.error) {
        this.logger.log('sendMessageToUser failed ' + result.data.error?.error_msg);
        return;
      }
      if (result.data.response && result.data.response.error) {
        this.logger.log('sendMessageToUser failed ' + result.data.response?.error);
        return;
      }

      this.logger.log('sendMessageToUser done');
    } catch (error) {
      this.logger.error('sendMessageToUser error');
      console.error(error);
    }
  }
}
