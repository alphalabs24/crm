import styled from '@emotion/styled';
import { IconButton, IconTrash } from 'twenty-ui';
import { useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Trans } from '@lingui/react/macro';

const StyledContainer = styled.div`
  border-left: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const StyledHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledFeaturesList = styled.div`
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledFeatureItem = styled(motion.div)`
  align-items: center;
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)};

  &:hover {
    background-color: ${({ theme }) => theme.background.tertiary};
    border-color: ${({ theme }) => theme.border.color.medium};
  }
`;

const StyledFeatureName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
`;

const StyledFeatureDetails = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  height: 100%;
  justify-content: center;
  max-width: 200px;
  padding: ${({ theme }) => theme.spacing(4)};
  text-align: center;
`;

const StyledAction = styled.div`
  display: flex;
  align-items: center;
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

type GeoJsonFeatureListProps = {
  geoJson: GeoJSON.FeatureCollection;
  onFeatureDelete: (featureId: string) => void;
  onFeatureSelect: (feature: GeoJSON.Feature) => void;
};

export const GeoJsonFeatureList = ({
  geoJson,
  onFeatureDelete,
  onFeatureSelect,
}: GeoJsonFeatureListProps) => {
  const handleDelete = useCallback(
    (event: React.MouseEvent, featureId: string) => {
      event.stopPropagation();
      onFeatureDelete(featureId);
    },
    [onFeatureDelete],
  );

  const areaCount = useMemo(
    () => geoJson.features.length,
    [geoJson.features.length],
  );

  return (
    <StyledContainer>
      <StyledHeader>
        <StyledTitle>
          <Trans>Areas ({areaCount})</Trans>
        </StyledTitle>
      </StyledHeader>
      {geoJson.features.length > 0 ? (
        <StyledFeaturesList>
          <AnimatePresence>
            {geoJson.features.map((feature) => (
              <StyledFeatureItem
                key={feature.id as string}
                onClick={() => onFeatureSelect(feature)}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20 }}
                layout
              >
                <StyledFeatureDetails>
                  <StyledFeatureName>
                    {feature.properties?.name || 'Custom Area'}
                  </StyledFeatureName>
                </StyledFeatureDetails>
                <StyledAction>
                  <IconButton
                    Icon={IconTrash}
                    variant="tertiary"
                    size="small"
                    onClick={(e) => handleDelete(e, feature.id as string)}
                  />
                </StyledAction>
              </StyledFeatureItem>
            ))}
          </AnimatePresence>
        </StyledFeaturesList>
      ) : (
        <StyledEmptyState>
          <Trans>
            Search for areas or draw polygons on the map to add them to your
            search profile
          </Trans>
        </StyledEmptyState>
      )}
    </StyledContainer>
  );
};
