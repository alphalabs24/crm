import {
  PlatformId,
  PLATFORMS,
} from '@/ui/layout/show-page/components/nm/types/Platform';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import axios from 'axios';
import { Dispatch, SetStateAction, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import {
  Button,
  IconCheck,
  IconWand,
  LARGE_DESKTOP_VIEWPORT,
  IconLayoutGrid,
} from 'twenty-ui';
import { ValidationResult } from '../../../hooks/usePublicationValidation';
const StyledPlatformSelectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledPlatformSelectionTitle = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledPlatformSelectionSubtitle = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledPlatformGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(3)};
  grid-template-columns: 1fr;

  @media only screen and (min-width: ${LARGE_DESKTOP_VIEWPORT}px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StyledPlatformTypeHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledPlatformTypeContainer = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledPlatformTypeActionsContainer = styled.div`
  align-items: flex-end;
  display: flex;
  justify-content: flex-end;
  flex: 1;
`;

const StyledPlatformTypeActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  align-items: center;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledPlatformTypeTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledPlatformTypeDescription = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
`;

const StyledSecondaryPlatformGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(3)};
  grid-template-columns: repeat(2, 1fr);
`;

const StyledPlatformCard = styled.button<{
  isSelected?: boolean;
  selectable?: boolean;
}>`
  background: ${({ theme, isSelected }) =>
    isSelected ? theme.background.secondary : theme.background.primary};
  border: 1px solid
    ${({ theme, isSelected }) =>
      isSelected ? theme.border.color.strong : theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  text-align: left;
  transition: all 0.1s ease-in-out;
  width: 100%;

  &:hover {
    background: ${({ theme, selectable }) =>
      selectable ? theme.background.secondary : theme.background.primary};
  }
`;

const StyledPlatformCardContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledPlatformIconContainer = styled.div<{
  isConnected?: boolean;
  width?: number;
}>`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-shrink: 0;
  height: 100%;
  justify-content: center;
  position: relative;
  width: ${({ width }) => width || 60}px;
`;

const StyledPlatformInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledPlatformName = styled.div<{ comingSoon?: boolean }>`
  align-items: center;
  color: ${({ theme, comingSoon }) =>
    comingSoon ? theme.font.color.tertiary : theme.font.color.primary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledNewTag = styled.span`
  background: ${({ theme }) => theme.color.blue10};
  color: ${({ theme }) => theme.color.blue};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};

  border-radius: ${({ theme }) => theme.border.radius.sm};
  margin-left: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(0.5)}
    ${({ theme }) => theme.spacing(1)};
`;

const StyledPlatformDescription = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  line-height: 1.4;
`;

const StyledPlatformLogo = styled.div`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-shrink: 0;
  height: 100%;
  width: 100%;
  justify-content: flex-end;
  position: relative;
`;

const StyledSmartListingIcon = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  aspect-ratio: 1;
  background-color: ${({ theme }) => theme.color.purple10};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledPlatformLogoImage = styled.img`
  width: 100%;
`;

const StyledValidationDetails = styled.div`
  color: ${({ theme }) => theme.font.color.danger};
  font-size: ${({ theme }) => theme.font.size.sm};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledEditLink = styled(Link)`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

// TODO: Remove this once we have the actual type form standard graphql
type Agency = {
  id: string;
  name: string;
};

type PlatformSelectProps = {
  handlePlatformSelect: (platform: PlatformId) => void;
  selectedPlatforms: PlatformId[] | null;
  setSelectedPlatforms: Dispatch<SetStateAction<PlatformId[] | null>>;
  recordId: string;
  closeModal?: () => void;
  validationDetails?: ValidationResult;
};

export const PlatformSelect = ({
  handlePlatformSelect,
  selectedPlatforms,
  recordId,
  closeModal,
  validationDetails,
}: PlatformSelectProps) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const tokenPair = useRecoilValue(tokenPairState);
  const { enqueueSnackBar } = useSnackBar();
  const [loading, setLoading] = useState(false);
  const { t } = useLingui();
  const [showError, setShowError] = useState(false);
  const realEstatePlatforms = Object.keys(PLATFORMS)
    .filter(
      (platform) => PLATFORMS[platform as PlatformId].type === 'real_estate',
    )
    .map((platform) => {
      return {
        ...PLATFORMS[platform as PlatformId],
        id: platform as PlatformId,
      };
    });

  const smartListingPlatform = {
    ...PLATFORMS[PlatformId.SmartListing],
    id: PlatformId.SmartListing,
  };

  const socialMediaPlatform = {
    ...PLATFORMS[PlatformId.SocialMedia],
    id: PlatformId.SocialMedia,
  };

  const createDraft = async () => {
    try {
      if (
        validationDetails?.missingFields &&
        validationDetails?.missingFields?.length > 0
      ) {
        setShowError(true);
        return;
      }
      setLoading(true);
      // TODO: This will be changed to a loop that creates all drafts and consolidates them into one show page later. For now only newhome works anyway.
      const response = await axios.post(
        // TODO: Replace the selectedPlatforms with an actual enum of platforms from the backend once we have standard entities.
        `${window._env_?.REACT_APP_PUBLICATION_SERVER_BASE_URL ?? 'http://api.localhost'}/properties/publish?id=${recordId}&platform=${selectedPlatforms?.[0].toUpperCase()}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${tokenPair?.accessToken?.token}`,
          },
        },
      );
      if (response.status !== 201) {
        throw new Error('Failed to create draft, id was not returned');
      }

      enqueueSnackBar(t`Publication Draft created successfully`, {
        variant: SnackBarVariant.Success,
      });

      const route = getLinkToShowPage('publication', {
        id: response.data,
      });

      setTimeout(() => {
        closeModal?.();
      }, 1000);

      navigate(route);
    } catch (error: any) {
      enqueueSnackBar(error?.message, {
        variant: SnackBarVariant.Error,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledPlatformSelectionContainer>
      <div>
        <StyledPlatformSelectionTitle>
          <IconLayoutGrid size={20} color={theme.font.color.primary} />
          {t`Choose a platform`}
        </StyledPlatformSelectionTitle>
        <StyledPlatformSelectionSubtitle>
          {t`Select where you want to publish your property listing`}
        </StyledPlatformSelectionSubtitle>
      </div>

      <StyledPlatformTypeContainer>
        <StyledPlatformTypeHeader>
          <StyledPlatformTypeTitle>
            {t`Real Estate Platforms`}
          </StyledPlatformTypeTitle>
          <StyledPlatformTypeDescription>
            {t`Increase your reach and target potential buyers and tenants through
            the largest real estate platforms. Choose the platforms you want to
            publish on.`}
          </StyledPlatformTypeDescription>
        </StyledPlatformTypeHeader>
        <StyledPlatformGrid>
          {realEstatePlatforms.map((platform) => (
            <StyledPlatformCard
              key={platform.id}
              onClick={() => {
                if (platform.isBeta === true) {
                  return;
                }
                handlePlatformSelect(platform.id);
              }}
              isSelected={selectedPlatforms?.includes(platform.id)}
              selectable={!platform.isBeta}
            >
              <StyledPlatformCardContent>
                <StyledPlatformIconContainer>
                  <StyledPlatformLogo>
                    {platform.logo ? (
                      <StyledPlatformLogoImage
                        src={platform.logo}
                        alt={platform.name}
                      />
                    ) : (
                      platform.name.slice(0, 2)
                    )}
                  </StyledPlatformLogo>
                </StyledPlatformIconContainer>
                <StyledPlatformInfo>
                  <StyledPlatformName comingSoon={platform.isBeta}>
                    {platform.name} {platform.isBeta ? t`(coming soon)` : ''}
                    {platform.isNew && <StyledNewTag>{t`NEW`}</StyledNewTag>}
                  </StyledPlatformName>
                  <StyledPlatformDescription>
                    {platform.description}
                  </StyledPlatformDescription>
                </StyledPlatformInfo>
              </StyledPlatformCardContent>
              <IconCheck
                size={20}
                color={
                  selectedPlatforms?.includes(platform.id)
                    ? theme.font.color.primary
                    : 'transparent'
                }
              />
            </StyledPlatformCard>
          ))}
        </StyledPlatformGrid>
        <StyledPlatformTypeActionsContainer>
          <StyledPlatformTypeActions>
            {showError && (
              <StyledValidationDetails>
                {validationDetails?.message}
                <StyledEditLink
                  to={`${getLinkToShowPage('property', { id: recordId })}/edit`}
                >
                  {t`Edit`}
                </StyledEditLink>
              </StyledValidationDetails>
            )}
            <Button
              variant="primary"
              accent="blue"
              title={t`Create Draft`}
              onClick={createDraft}
              disabled={
                selectedPlatforms?.length === 0 || !selectedPlatforms || loading
              }
            />
          </StyledPlatformTypeActions>
        </StyledPlatformTypeActionsContainer>
      </StyledPlatformTypeContainer>

      <StyledSecondaryPlatformGrid>
        <StyledPlatformTypeContainer>
          <StyledPlatformTypeHeader>
            <StyledPlatformTypeTitle>
              {socialMediaPlatform.name}
              <StyledPlatformIconContainer width={50}>
                <StyledPlatformLogo>
                  <StyledPlatformLogoImage
                    src={socialMediaPlatform.logo}
                    alt={socialMediaPlatform.name}
                  />
                </StyledPlatformLogo>
              </StyledPlatformIconContainer>
            </StyledPlatformTypeTitle>
            <StyledPlatformTypeDescription>
              {socialMediaPlatform.description}
            </StyledPlatformTypeDescription>
          </StyledPlatformTypeHeader>
          <StyledPlatformTypeActionsContainer>
            <StyledPlatformTypeActions>
              <Button
                variant="primary"
                accent="blue"
                title={t`Coming Soon`}
                disabled
              />
            </StyledPlatformTypeActions>
          </StyledPlatformTypeActionsContainer>
        </StyledPlatformTypeContainer>
        <StyledPlatformTypeContainer>
          <StyledPlatformTypeHeader>
            <StyledPlatformTypeTitle>
              {smartListingPlatform.name}
              <StyledPlatformIconContainer width={50}>
                <StyledPlatformLogo>
                  <StyledSmartListingIcon>
                    <IconWand size={18} color={theme.color.purple} />
                  </StyledSmartListingIcon>
                </StyledPlatformLogo>
              </StyledPlatformIconContainer>
            </StyledPlatformTypeTitle>
            <StyledPlatformTypeDescription>
              {smartListingPlatform.description}
            </StyledPlatformTypeDescription>
          </StyledPlatformTypeHeader>
          <StyledPlatformTypeActionsContainer>
            <StyledPlatformTypeActions>
              <Button
                variant="primary"
                accent="blue"
                title={t`Coming Soon`}
                disabled
              />
            </StyledPlatformTypeActions>
          </StyledPlatformTypeActionsContainer>
        </StyledPlatformTypeContainer>
      </StyledSecondaryPlatformGrid>
    </StyledPlatformSelectionContainer>
  );
};
