import { atom, selector } from 'recoil';

type ReadInquiryState = {
  inquiryId: string;
  lastReadAt: string;
};

// Load initial state from localStorage
const getInitialReadState = (): ReadInquiryState[] => {
  const stored = localStorage.getItem('inquiryReadStates');
  return stored ? JSON.parse(stored) : [];
};

export const inquiryReadState = atom<ReadInquiryState[]>({
  key: 'inquiryReadState',
  default: getInitialReadState(),
  effects: [
    ({ onSet }) => {
      onSet((newValue) => {
        localStorage.setItem('inquiryReadStates', JSON.stringify(newValue));
      });
    },
  ],
});

export const unreadInquiriesSelector = selector({
  key: 'unreadInquiriesSelector',
  get: ({ get }) => {
    const readStates = get(inquiryReadState);
    return (inquiry: any) => {
      const readState = readStates.find(
        (state) => state.inquiryId === inquiry.id,
      );
      if (!readState) return true;

      const lastMessageAt = inquiry.messageThreads?.[0]?.lastMessageReceivedAt;
      if (!lastMessageAt) return false;

      return new Date(lastMessageAt) > new Date(readState.lastReadAt);
    };
  },
});
