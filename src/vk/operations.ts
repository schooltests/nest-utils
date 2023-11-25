import * as crypto from 'crypto';

export const isSignValid = <T>(query: T, vkSecretKey: string) => {
  let sign;
  const queryParams: { key: string; value: string }[] = [];

  /**
   * Функция, которая обрабатывает входящий query-параметр. В случае передачи
   * параметра, отвечающего за подпись, подменяет "sign". В случае встречи
   * корректного в контексте подписи параметра добавляет его в массив
   * известных параметров.
   * @param key
   * @param value
   */
  const processQueryParam = <TV>(key: string, value: TV) => {
    if (typeof value === 'string') {
      if (key === 'sign') {
        sign = value;
      } else if (key.startsWith('vk_')) {
        queryParams.push({ key, value });
      }
    }
  };

  if (typeof query === 'string') {
    // Если строка начинается с вопроса (когда передан window.location.search),
    // его необходимо удалить.
    const formattedSearch = query.startsWith('?') ? query.slice(1) : query;

    // Пытаемся спарсить строку как query-параметр.
    for (const param of formattedSearch.split('&')) {
      const [key, value] = param.split('=');
      processQueryParam(key, value);
    }
  } else if (typeof query === 'object') {
    for (const key of Object.keys(query)) {
      const value = query[key as keyof typeof query];
      processQueryParam(key, value);
    }
  } else {
    return false;
  }

  // Обрабатываем исключительный случай, когда не найдена ни подпись в параметрах,
  // ни один параметр, начинающийся с "vk_", дабы избежать
  // излишней нагрузки, образующейся в процессе работы дальнейшего кода.
  if (!sign || !queryParams.length) {
    return false;
  }

  // Снова создаём query в виде строки из уже отфильтрованных параметров.
  const queryString = queryParams
    // Сортируем ключи в порядке возрастания.
    .sort((a, b) => a.key.localeCompare(b.key))
    // Воссоздаём новый query в виде строки.
    .reduce((acc, { key, value }, idx) => {
      return acc + (idx === 0 ? '' : '&') + `${key}=${encodeURIComponent(value)}`;
    }, '');

  // Создаём хеш получившейся строки на основе секретного ключа.
  const paramsHash = crypto
    .createHmac('sha256', vkSecretKey)
    .update(queryString)
    .digest()
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=$/, '');

  return paramsHash === sign;
};
