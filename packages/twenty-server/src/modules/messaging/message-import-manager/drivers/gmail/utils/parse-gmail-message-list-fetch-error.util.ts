import { Logger } from '@nestjs/common';

import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';

const logger = new Logger('GmailMessageListFetchError');

export const parseGmailMessageListFetchError = (error: {
  code?: number;
  errors: {
    reason: string;
    message: string;
  }[];
}): MessageImportDriverException => {
  const { code, errors } = error;

  const reason = errors?.[0]?.reason;
  const message = errors?.[0]?.message;

  logger.error(
    `Gmail message list fetch error: code=${code}, reason=${reason}, message=${message}\nError: ${JSON.stringify(error)}`,
  );

  switch (code) {
    case 400:
      if (reason === 'invalid_grant') {
        return new MessageImportDriverException(
          message,
          MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
        );
      }
      if (reason === 'failedPrecondition') {
        return new MessageImportDriverException(
          message,
          MessageImportDriverExceptionCode.TEMPORARY_ERROR,
        );
      }

      return new MessageImportDriverException(
        message,
        MessageImportDriverExceptionCode.UNKNOWN,
      );

    case 404:
      return new MessageImportDriverException(
        message,
        MessageImportDriverExceptionCode.NOT_FOUND,
      );

    case 429:
      return new MessageImportDriverException(
        message,
        MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      );

    case 403:
      if (
        reason === 'rateLimitExceeded' ||
        reason === 'userRateLimitExceeded' ||
        reason === 'dailyLimitExceeded'
      ) {
        return new MessageImportDriverException(
          message,
          MessageImportDriverExceptionCode.TEMPORARY_ERROR,
        );
      }
      if (reason === 'domainPolicy') {
        return new MessageImportDriverException(
          message,
          MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
        );
      }

      break;

    case 401:
      return new MessageImportDriverException(
        message,
        MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      );

    case 500:
      // we set it to temporary in every case, because we don't know the exact reason
      // let's see if this fixes the issue
      // if (reason === 'backendError') {
      return new MessageImportDriverException(
        message,
        MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      );
    // }

    // break;

    default:
      break;
  }

  return new MessageImportDriverException(
    message,
    MessageImportDriverExceptionCode.UNKNOWN,
  );
};
