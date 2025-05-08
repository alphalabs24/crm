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

export const StyledModalContent = styled(motion.div)<{
  showScrollbar?: boolean;
}>`
  background: ${({ theme }) => theme.background.noisy};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(4)};
  height: 100%;
  flex: 1;
  padding-bottom: ${({ theme }) => theme.spacing(20)};
  backdrop-filter: blur(20px);
  border-radius: 12px;

  &::-webkit-scrollbar {
    width: ${({ showScrollbar = false }) => (showScrollbar ? '8px' : '0px')};
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.scrollBar.track.background};
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    border: none;
    border-radius: 10px;
    background: ${({ theme }) => theme.scrollBar.thumb.background};
    transition: background 0.2s ease;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.scrollBar.thumb.hover};
  }

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
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};

  @media only screen and (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: row-reverse;
  }
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
