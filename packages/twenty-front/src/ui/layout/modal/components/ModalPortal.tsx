import { createPortal } from 'react-dom';

export const ModalPortal = ({ children }: React.PropsWithChildren) => {
  return createPortal(children, document.body);
};
