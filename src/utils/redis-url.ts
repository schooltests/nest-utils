interface RedisOptions {
  port?: number;
  host?: string;
  /**
   * 4 (IPv4) or 6 (IPv6), Defaults to 4.
   */
  family?: number;
  /**
   * Local domain socket path. If set the port, host and family will be ignored.
   */
  path?: string;
  /**
   * TCP KeepAlive on the socket with a X ms delay before start. Set to a non-number value to disable keepAlive.
   */
  keepAlive?: number;
  connectionName?: string;
  /**
   * If set, client will send AUTH command with the value of this option as the first argument when connected. The `password` option must be set too. Username should only be set for Redis >=6.
   */
  username?: string;
  /**
   * If set, client will send AUTH command with the value of this option when connected.
   */
  password?: string;
  /**
   * Database index to use.
   */
  db?: number;
  /**
   * When a connection is established to the Redis server, the server might still be loading
   * the database from disk. While loading, the server not respond to any commands.
   * To work around this, when this option is true, ioredis will check the status of the Redis server,
   * and when the Redis server is able to process commands, a ready event will be emitted.
   */
  enableReadyCheck?: boolean;
  keyPrefix?: string;
  /**
   * When the return value isn't a number, ioredis will stop trying to reconnect.
   * Fixed in: https://github.com/DefinitelyTyped/DefinitelyTyped/pull/15858
   */
  retryStrategy?(times: number): number | void | null;
  /**
   * By default, all pending commands will be flushed with an error every
   * 20 retry attempts. That makes sure commands won't wait forever when
   * the connection is down. You can change this behavior by setting
   * `maxRetriesPerRequest`.
   *
   * Set maxRetriesPerRequest to `null` to disable this behavior, and
   * every command will wait forever until the connection is alive again
   * (which is the default behavior before ioredis v4).
   */
  maxRetriesPerRequest?: number | null;
  /**
   * 1/true means reconnect, 2 means reconnect and resend failed command. Returning false will ignore
   * the error and do nothing.
   */
  reconnectOnError?(error: Error): boolean | 1 | 2;
  /**
   * By default, if there is no active connection to the Redis server, commands are added to a queue
   * and are executed once the connection is "ready" (when enableReadyCheck is true, "ready" means
   * the Redis server has loaded the database from disk, otherwise means the connection to the Redis
   * server has been established). If this option is false, when execute the command when the connection
   * isn't ready, an error will be returned.
   */
  enableOfflineQueue?: boolean;
  /**
   * The milliseconds before a timeout occurs during the initial connection to the Redis server.
   * default: 10000.
   */
  connectTimeout?: number;
  /**
   * After reconnected, if the previous connection was in the subscriber mode, client will auto re-subscribe these channels.
   * default: true.
   */
  autoResubscribe?: boolean;
  /**
   * If true, client will resend unfulfilled commands(e.g. block commands) in the previous connection when reconnected.
   * default: true.
   */
  autoResendUnfulfilledCommands?: boolean;
  lazyConnect?: boolean;
  /**
   * default: "master".
   */
  role?: 'master' | 'slave';
  /**
   * default: null.
   */
  name?: string;
  sentinelUsername?: string;
  sentinelPassword?: string;
  sentinels?: Array<{ host: string; port: number }>;
  /**
   * If `sentinelRetryStrategy` returns a valid delay time, ioredis will try to reconnect from scratch.
   * default: function(times) { return Math.min(times * 10, 1000); }
   */
  sentinelRetryStrategy?(times: number): number | void | null;
  /**
   * Whether to support the `tls` option when connecting to Redis via sentinel mode.
   * default: false.
   */
  enableTLSForSentinelMode?: boolean;
  /**
   * Update the given `sentinels` list with new IP addresses when communicating with existing sentinels.
   * default: true.
   */
  updateSentinels?: boolean;
  /**
   * Enable READONLY mode for the connection. Only available for cluster mode.
   * default: false.
   */
  readOnly?: boolean;
  /**
   * If you are using the hiredis parser, it's highly recommended to enable this option.
   * Create another instance with dropBufferSupport disabled for other commands that you want to return binary instead of string
   */
  dropBufferSupport?: boolean;
  /**
   * Whether to show a friendly error stack. Will decrease the performance significantly.
   */
  showFriendlyErrorStack?: boolean;
  /**
   * When enabled, all commands issued during an event loop iteration are automatically wrapped in a
   * pipeline and sent to the server at the same time. This can improve performance by 30-50%.
   * default: false.
   */
  enableAutoPipelining?: boolean;

  tls?: object;
}

export const redisOptsFromUrl = (urlString: string): RedisOptions => {
  const redisOpts: RedisOptions = {};
  try {
    const redisUrl = new URL(urlString);
    redisOpts.port = Number(redisUrl.port) || 6379;
    redisOpts.host = redisUrl.hostname;
    redisOpts.db = redisUrl.pathname ? Number(redisUrl.pathname.split('/')[1]) : 0;
    redisOpts.password = redisUrl.password;
    redisOpts.username = redisUrl.username;
    if (redisUrl.protocol === 'rediss:') {
      redisOpts.tls = {};
    }
  } catch (e) {
    throw new Error(e.message);
  }
  return redisOpts;
};
