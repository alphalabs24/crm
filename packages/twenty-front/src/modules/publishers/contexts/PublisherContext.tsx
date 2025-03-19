import { EditPublisherModal } from '@/publishers/components/modals/EditPublisherModal';
import { ModalRefType } from '@/ui/layout/modal/components/Modal';
import { createContext, useContext, useRef, useState } from 'react';

type PublisherContextType = {
  openModalForPublisher: (publisherId?: string) => void;
};

const PublisherContext = createContext<PublisherContextType>({
  openModalForPublisher: () => {},
});

export const PublishersProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [publisherId, setPublisherId] = useState<string | undefined>(undefined);
  const ref = useRef<ModalRefType>(null);

  const openModalForPublisher = (publisherId?: string) => {
    setPublisherId(publisherId);
    ref.current?.open();
  };

  const closePublisherModal = () => {
    setPublisherId(undefined);
    ref.current?.close();
  };

  return (
    <PublisherContext.Provider value={{ openModalForPublisher }}>
      {children}
      <EditPublisherModal
        ref={ref}
        onClose={closePublisherModal}
        publisherId={publisherId}
      />
    </PublisherContext.Provider>
  );
};

export const usePublishers = () => {
  return useContext(PublisherContext);
};
