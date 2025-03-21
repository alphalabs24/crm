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
  // This is a workaround to avoid the modal crashing the page when user logs out.
  const [showModal, setShowModal] = useState(false);
  const [publisherId, setPublisherId] = useState<string | undefined>(undefined);
  const ref = useRef<ModalRefType>(null);

  const openModalForPublisher = (publisherId?: string) => {
    setPublisherId(publisherId);
    setShowModal(true);
    setTimeout(() => {
      ref.current?.open();
    }, 50);
  };

  const closePublisherModal = () => {
    setPublisherId(undefined);
    setShowModal(false);
    ref.current?.close();
  };

  return (
    <PublisherContext.Provider value={{ openModalForPublisher }}>
      {children}
      {showModal && (
        <EditPublisherModal
          ref={ref}
          onClose={closePublisherModal}
          publisherId={publisherId}
        />
      )}
    </PublisherContext.Provider>
  );
};

export const usePublishers = () => {
  return useContext(PublisherContext);
};
