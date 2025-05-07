import { useEffect, useRef, useState, useCallback, memo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import styled from '@emotion/styled';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useRecoilValue } from 'recoil';
import { mapboxAccessTokenState } from '@/client-config/states/mapboxAccessTokenState';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { useDebounce } from 'use-debounce';
import { MOBILE_VIEWPORT } from 'twenty-ui';

const StyledMapContainer = styled.div`
  width: 100%;
  height: 400px;
  border-radius: ${({ theme }) => theme.border.radius};
  overflow: hidden;
  position: relative;
`;

const StyledSearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledSuggestionsContainer = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ theme }) => theme.boxShadow.light};
  margin-top: -${({ theme }) => theme.spacing(1)};
  max-height: 200px;
  overflow-y: auto;
  position: absolute;
  width: 100%;
  z-index: 1;
`;

const StyledSuggestion = styled.div<{ isHighlighted: boolean }>`
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing(2)};
  transition: all 0.1s ease-in-out;
  color: ${({ theme }) => theme.font.color.primary};

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }

  ${({ isHighlighted, theme }) =>
    isHighlighted &&
    `
    background: ${theme.background.tertiary};
    color: ${theme.font.color.primary};
  `}
`;

type AreaSearchInputProps = {
  onAreaSelect: (feature: any) => void;
};

const AreaSearchInput = memo(({ onAreaSelect }: AreaSearchInputProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchTerm] = useDebounce(searchQuery, 300);
  const mapboxAccessToken = useRecoilValue(mapboxAccessTokenState);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm || !mapboxAccessToken) return;

      const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        searchTerm,
      )}.json?access_token=${mapboxAccessToken}&types=neighborhood,place,locality,district&country=ch&proximity=8.5417,47.3769&limit=5`;

      try {
        const response = await fetch(endpoint);
        const data = await response.json();
        setSuggestions(data.features);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };

    fetchSuggestions();
  }, [searchTerm, mapboxAccessToken]);

  const handleSuggestionClick = async (suggestion: any) => {
    setShowSuggestions(false);
    setSearchQuery('');

    try {
      // Get the full feature details
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          suggestion.place_name,
        )}.json?access_token=${mapboxAccessToken}&types=neighborhood,place,locality,district&country=ch&proximity=8.5417,47.3769&limit=1`,
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        onAreaSelect(data.features[0]);
      }
    } catch (error) {
      console.error('Error fetching area details:', error);
    }
  };

  return (
    <StyledSearchContainer>
      <TextInputV2
        value={searchQuery}
        onChange={(value) => {
          setSearchQuery(value);
          setShowSuggestions(true);
        }}
        placeholder="Search for an area..."
        fullWidth
      />
      {showSuggestions && suggestions.length > 0 && (
        <StyledSuggestionsContainer>
          {suggestions.map((suggestion, index) => (
            <StyledSuggestion
              key={suggestion.id}
              isHighlighted={index === highlightedIndex}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {suggestion.place_name}
            </StyledSuggestion>
          ))}
        </StyledSuggestionsContainer>
      )}
    </StyledSearchContainer>
  );
});

type SearchProfileMapProps = {
  searchProfileId: string;
  initialGeoJson?: GeoJSON.FeatureCollection;
};

export const SearchProfileMap = ({
  searchProfileId,
  initialGeoJson,
}: SearchProfileMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const mapboxAccessToken = useRecoilValue(mapboxAccessTokenState);

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.SearchProfile,
  });

  const fitMapToFeatures = useCallback(
    (features: GeoJSON.FeatureCollection) => {
      if (!map.current || !features.features.length) return;

      const bounds = new mapboxgl.LngLatBounds();
      features.features.forEach((feature) => {
        if (feature.geometry.type === 'Polygon') {
          feature.geometry.coordinates[0].forEach((coord) => {
            if (Array.isArray(coord) && coord.length >= 2) {
              bounds.extend([coord[0], coord[1]]);
            }
          });
        } else if (feature.geometry.type === 'Point') {
          const [lng, lat] = feature.geometry.coordinates;
          if (typeof lng === 'number' && typeof lat === 'number') {
            bounds.extend([lng, lat]);
          }
        }
      });

      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15,
          duration: 0,
        });
      }
    },
    [],
  );

  const handleAreaSelect = useCallback(
    async (feature: any) => {
      if (!draw.current) return;

      try {
        // Create a GeoJSON feature for the area
        const areaFeature: GeoJSON.Feature = {
          type: 'Feature',
          properties: {
            name: feature.place_name,
            id: feature.id,
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [feature.bbox[0], feature.bbox[1]],
                [feature.bbox[2], feature.bbox[1]],
                [feature.bbox[2], feature.bbox[3]],
                [feature.bbox[0], feature.bbox[3]],
                [feature.bbox[0], feature.bbox[1]],
              ],
            ],
          },
        };

        // Add the new feature to the map
        draw.current.add(areaFeature);

        // Get all features and update the record
        const allFeatures = draw.current.getAll();
        if (allFeatures.features.length > 0) {
          updateOneRecord({
            idToUpdate: searchProfileId,
            updateOneRecordInput: {
              geoJson: allFeatures,
            },
          });

          // Fit map to show all features
          fitMapToFeatures(allFeatures);
        }
      } catch (error) {
        console.error('Error adding area to map:', error);
      }
    },
    [draw, searchProfileId, updateOneRecord, fitMapToFeatures],
  );

  useEffect(() => {
    if (!mapContainer.current || !mapboxAccessToken) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [8.5417, 47.3769], // Zurich center
      zoom: 12,
      accessToken: mapboxAccessToken,
      renderWorldCopies: false,
    });

    // Disable map animations
    map.current.on('load', () => {
      if (map.current) {
        map.current.dragRotate.disable();
        map.current.touchZoomRotate.disableRotation();
        map.current.doubleClickZoom.disable();
      }
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl());

    // Initialize draw control
    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
    });
    map.current.addControl(draw.current);

    // Load initial GeoJSON if provided
    if (initialGeoJson && draw.current) {
      draw.current.add(initialGeoJson);
      fitMapToFeatures(initialGeoJson);
    }

    // Handle draw events
    map.current.on('draw.create', () => {
      if (!draw.current) return;
      const features = draw.current.getAll();
      if (features.features.length > 0) {
        updateOneRecord({
          idToUpdate: searchProfileId,
          updateOneRecordInput: {
            geoJson: features,
          },
        });
        fitMapToFeatures(features);
      }
    });

    map.current.on('draw.update', () => {
      if (!draw.current) return;
      const features = draw.current.getAll();
      updateOneRecord({
        idToUpdate: searchProfileId,
        updateOneRecordInput: {
          geoJson: features,
        },
      });
      fitMapToFeatures(features);
    });

    map.current.on('draw.delete', () => {
      updateOneRecord({
        idToUpdate: searchProfileId,
        updateOneRecordInput: {
          geoJson: null,
        },
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [
    searchProfileId,
    initialGeoJson,
    updateOneRecord,
    mapboxAccessToken,
    fitMapToFeatures,
  ]);

  return (
    <>
      <AreaSearchInput onAreaSelect={handleAreaSelect} />
      <StyledMapContainer>
        <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      </StyledMapContainer>
    </>
  );
};
