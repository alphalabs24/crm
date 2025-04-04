import { Modal } from '@/ui/layout/modal/components/Modal';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { MOBILE_VIEWPORT } from 'twenty-ui';

export const StyledModalContainer = styled.div<{ adaptiveHeight?: boolean }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: ${(p) => (p.adaptiveHeight ? 'unset' : '70vh')};

  @media only screen and (min-width: ${MOBILE_VIEWPORT}px) {
    max-height: 80vh;
  }
`;

export const StyledModalContent = styled(motion.div)`
  background: ${({ theme }) => theme.background.secondary};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(4)};
  height: 100%;
  flex: 1;
  padding-bottom: ${({ theme }) => theme.spacing(20)};

  @media only screen and (min-width: ${MOBILE_VIEWPORT}px) {
    padding-bottom: ${({ theme }) => theme.spacing(4)};
  }
`;

export const StyledModalHeader = styled(Modal.Header)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  padding: 0 ${({ theme }) => theme.spacing(4)};
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
  flex-shrink: 0;
`;

export const StyledModalHeaderButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const StyledModalTitle = styled.div`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

export const StyledModalTitleContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;
