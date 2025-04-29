import {
    inquiryReadState,
    unreadInquiriesSelector,
} from '@/inquiries/states/inquiryReadState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

type ReadState = {
  inquiryId: string;
  lastReadAt: string;
};

export const useInquiryReadState = () => {
  const [inquiryRead, setInquiryRead] = useRecoilState(inquiryReadState);
  const unreadInquiries = useRecoilValue(unreadInquiriesSelector);

  const hasNewMessages = useCallback(
    (inquiry: ObjectRecord) => {
      if (!inquiry.messageThreads?.[0]?.lastMessageReceivedAt) {
        return false;
      }

      const readState = inquiryRead.find(
        (state) => state.inquiryId === inquiry.id,
      );
      if (!readState) {
        return true; // Never read before
      }

      const lastMessageTime = new Date(
        inquiry.messageThreads[0].lastMessageReceivedAt,
      ).getTime();
      const lastReadTime = new Date(readState.lastReadAt).getTime();

      return lastMessageTime > lastReadTime;
    },
    [inquiryRead],
  );

  const markAsUnread = useCallback(
    (inquiryId: string) => {
      setInquiryRead((currentStates) =>
        currentStates.filter((state) => state.inquiryId !== inquiryId),
      );
    },
    [setInquiryRead],
  );

  const markAsRead = useCallback(
    (inquiryId: string) => {
      setInquiryRead((currentStates: ReadState[]) => {
        const existingStateIndex = currentStates.findIndex(
          (state) => state.inquiryId === inquiryId,
        );

        const newState: ReadState = {
          inquiryId,
          lastReadAt: new Date().toISOString(),
        };

        if (existingStateIndex >= 0) {
          const newStates = [...currentStates];
          newStates[existingStateIndex] = newState;
          return newStates;
        }

        return [...currentStates, newState];
      });
    },
    [setInquiryRead],
  );

  const markAllAsRead = useCallback(
    (inquiries: ObjectRecord[]) => {
      const now = new Date().toISOString();
      setInquiryRead((currentStates: ReadState[]) => {
        const newStates = [...currentStates];

        inquiries.forEach((inquiry) => {
          const existingStateIndex = newStates.findIndex(
            (state) => state.inquiryId === inquiry.id,
          );

          const newState: ReadState = {
            inquiryId: inquiry.id,
            lastReadAt: now,
          };

          if (existingStateIndex >= 0) {
            newStates[existingStateIndex] = newState;
          } else {
            newStates.push(newState);
          }
        });

        return newStates;
      });
    },
    [setInquiryRead],
  );

  return {
    isUnread: unreadInquiries,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    hasNewMessages,
  };
};
