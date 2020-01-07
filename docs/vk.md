# Работа с VK
Класс Vk в Henta наследуется от библиотеки [VK-IO](https://github.com/negezor/vk-io). В конфиг файлах указываются параметры работы с ВК.

## Публичный конфиг (config.json)
* vk.groupId - ИД группы
* vk.apiLimit - лимит API вызовов в секунду (стандартно: 20)
* vk.webhookOptions - настройки webHook для VK-IO
* vk.useWebhook - использовать webHook

## Приватный конфиг (private.json)
* vk.token - токен сообщества
* vk.webhookConfirmation - ключ подтверждения webHook