import { createContext, useContext } from 'react';

export const RecordEditContainerContext =
  createContext<RecordEditContainerContextType>({
    cleanUpdatedFields: () => {},
  });

type RecordEditContainerContextType = {
  cleanUpdatedFields: () => void;
};

export const useRecordEditContainerContext = () => {
  return useContext(RecordEditContainerContext);
};
