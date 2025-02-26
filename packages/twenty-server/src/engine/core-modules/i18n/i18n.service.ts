import { Injectable, OnModuleInit } from '@nestjs/common';

import { i18n } from '@lingui/core';
import { APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared';

import { messages as deMessages } from 'src/engine/core-modules/i18n/locales/generated/de-DE';
import { messages as enMessages } from 'src/engine/core-modules/i18n/locales/generated/en';
import { messages as frMessages } from 'src/engine/core-modules/i18n/locales/generated/fr-FR';
import { messages as itMessages } from 'src/engine/core-modules/i18n/locales/generated/it-IT';
import { messages as pseudoEnMessages } from 'src/engine/core-modules/i18n/locales/generated/pseudo-en';

@Injectable()
export class I18nService implements OnModuleInit {
  async loadTranslations() {
    const messages: Record<keyof typeof APP_LOCALES, any> = {
      en: enMessages,
      'pseudo-en': pseudoEnMessages,
      // 'af-ZA': afMessages,
      // 'ar-SA': arMessages,
      // 'ca-ES': caMessages,
      // 'cs-CZ': csMessages,
      // 'da-DK': daMessages,
      'de-DE': deMessages,
      // 'el-GR': elMessages,
      // 'es-ES': esMessages,
      // 'fi-FI': fiMessages,
      'fr-FR': frMessages,
      // 'he-IL': heMessages,
      // 'hu-HU': huMessages,
      'it-IT': itMessages,
      // 'ja-JP': jaMessages,
      // 'ko-KR': koMessages,
      // 'nl-NL': nlMessages,
      // 'no-NO': noMessages,
      // 'pl-PL': plMessages,
      // 'pt-BR': ptBRMessages,
      // 'pt-PT': ptPTMessages,
      // 'ro-RO': roMessages,
      // 'ru-RU': ruMessages,
      // 'sr-Cyrl': srMessages,
      // 'sv-SE': svMessages,
      // 'tr-TR': trMessages,
      // 'uk-UA': ukMessages,
      // 'vi-VN': viMessages,
      // 'zh-CN': zhHansMessages,
      // 'zh-TW': zhHantMessages,
    };

    (Object.entries(messages) as [keyof typeof APP_LOCALES, any][]).forEach(
      ([locale, message]) => {
        i18n.load(locale, message);
      },
    );

    i18n.activate(SOURCE_LOCALE);
  }

  async onModuleInit() {
    this.loadTranslations();
  }
}
