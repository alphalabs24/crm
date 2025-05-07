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
import osmtogeojson from 'osmtogeojson';
import { CircularProgressBar, MOBILE_VIEWPORT, useIsMobile } from 'twenty-ui';
import { useTheme } from '@emotion/react';
import { useSafeColorScheme } from '@/ui/theme/hooks/useSafeColorScheme';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { GeoJsonFeatureList } from './GeoJsonFeatureList';

const StyledLoadingIndicator = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  justify-content: center;
  position: absolute;
  right: ${({ theme }) => theme.spacing(2)};
  top: 8px;
`;

const StyledMapContainer = styled.div`
  width: 100%;
  height: 100%;
  min-height: 250px;
  border-radius: ${({ theme }) => theme.border.radius};
  overflow: hidden;
  position: relative;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    min-height: 400px;
  }
`;

const StyledMap = styled.div`
  width: 100%;
  height: 100%;
  min-height: 250px;
  border-radius: ${({ theme }) => theme.border.radius};
  overflow: hidden;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    min-height: 400px;
  }
`;

const StyledMapWithListContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;

  min-height: 250px;
  position: relative;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    min-height: 400px;
  }
`;

const StyledMapWrapper = styled.div`
  flex: 1;
  min-width: 0;
  height: 100%;
`;

const StyledFeatureListWrapper = styled.div`
  display: flex;
  flex-shrink: 0;
  height: 100%;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

const StyledSearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  position: relative;
`;

const StyledMapLoader = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.strong};
  color: ${({ theme }) => theme.color.gray10};
  bottom: 0;
  display: flex;
  justify-content: center;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 10;
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

const StyledSuggestionsContainer = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ theme }) => theme.boxShadow.light};
  max-height: 200px;
  overflow-y: auto;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 10;
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

type AreaSearchInputProps = {
  onAreaSelect: (feature: any) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
};

// Function to fetch boundary data from OpenStreetMap
const fetchOsmBoundary = async (
  placeName: string,
): Promise<GeoJSON.FeatureCollection | null> => {
  // Clean and encode the place name
  const cleanPlaceName = placeName.split(',')[0].trim();
  console.log('cleanPlaceName', cleanPlaceName);

  // Create Overpass API query for administrative boundary using the correct format
  const overpassQuery = `
    [out:json][timeout:25];
    relation["name"="${cleanPlaceName}"]["boundary"="administrative"];
    out body;
    >;
    out skel qt;
  `;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const osmData = await response.json();
    const geojson = osmtogeojson(osmData);
    console.log('geojson', geojson);

    // Log the result for debugging
    console.log('OpenStreetMap boundary result:', geojson);

    return geojson;
  } catch (error) {
    console.error(`Error fetching boundary for ${placeName}:`, error);
    return null;
  }
};

const AreaSearchInput = memo(
  ({ onAreaSelect, isLoading, setIsLoading }: AreaSearchInputProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [searchTerm] = useDebounce(searchQuery, 300);
    const mapboxAccessToken = useRecoilValue(mapboxAccessTokenState);
    const inputRef = useRef<HTMLInputElement>(null);

    // Get suggestions for the search query
    useEffect(() => {
      const fetchSuggestions = async () => {
        if (!searchTerm || !mapboxAccessToken) return;

        try {
          const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            searchTerm,
          )}.json?access_token=${mapboxAccessToken}&types=neighborhood,place,locality,district&country=ch&proximity=8.5417,47.3769&limit=5`;

          const response = await fetch(endpoint);
          const data = await response.json();
          setSuggestions(data.features);
          if (data.features && data.features.length > 0) {
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      };

      fetchSuggestions();
    }, [searchTerm, mapboxAccessToken]);

    const handleSuggestionClick = async (suggestion: any) => {
      setShowSuggestions(false);
      setSearchQuery('');
      setIsLoading(true);

      try {
        // First, try to get exact boundary from OpenStreetMap
        const osmBoundary = await fetchOsmBoundary(suggestion.place_name);

        if (
          osmBoundary &&
          osmBoundary.features &&
          osmBoundary.features.length > 0
        ) {
          // Find the most appropriate feature (prefer polygons)
          const polygonFeature = osmBoundary.features.find(
            (f) =>
              f.geometry.type === 'Polygon' ||
              f.geometry.type === 'MultiPolygon',
          );

          if (polygonFeature) {
            // Create a feature with the original place properties and OSM geometry
            const combinedFeature = {
              type: 'Feature',
              properties: {
                ...suggestion.properties,
                name: suggestion.place_name,
                id: suggestion.id,
                source: 'openstreetmap',
              },
              geometry: polygonFeature.geometry,
            };

            onAreaSelect(combinedFeature);
            return;
          }
        }

        // Fallback to Mapbox API
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${suggestion.id}.json?access_token=${mapboxAccessToken}&types=neighborhood,place,locality,district&country=ch`,
        );

        const data = await response.json();
        if (data.features && data.features.length > 0) {
          onAreaSelect(data.features[0]);
        }
      } catch (error) {
        console.error('Error fetching area details:', error);
      } finally {
        setIsLoading(false);
        // Return focus to input after selection
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    };

    // Handle input focus
    const handleInputFocus = () => {
      if (suggestions.length > 0) {
        setShowSuggestions(true);
      }
    };

    // Handle input blur with timeout (like in AddressInput)
    const handleInputBlur = () => {
      // Use timeout to allow clicking on suggestions
      setTimeout(() => {
        setShowSuggestions(false);
      }, 200);
    };

    // Handle keyboard navigation in suggestions
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!showSuggestions || !suggestions.length) return;

      // Arrow down
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev,
        );
      }
      // Arrow up
      else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      }
      // Enter to select
      else if (e.key === 'Enter' && highlightedIndex >= 0) {
        e.preventDefault();
        handleSuggestionClick(suggestions[highlightedIndex]);
      }
      // Escape to close
      else if (e.key === 'Escape') {
        e.preventDefault();
        setShowSuggestions(false);
      }
    };

    return (
      <StyledSearchContainer>
        <div style={{ position: 'relative' }}>
          <TextInputV2
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              if (value) {
                setShowSuggestions(true);
              }
            }}
            placeholder="Search for an area..."
            fullWidth
            disabled={isLoading}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            ref={inputRef}
          />
          {isLoading && (
            <StyledLoadingIndicator>
              <CircularProgressBar barWidth={2} size={16} />
            </StyledLoadingIndicator>
          )}
        </div>
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
  },
);

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
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useSafeColorScheme();
  const [initialized, setInitialized] = useState(false);
  const theme = useTheme();
  const isNavigationDrawerExpanded = useRecoilValue(
    isNavigationDrawerExpandedState,
  );

  const isMobile = useIsMobile();
  const [localGeoJson, setLocalGeoJson] = useState<GeoJSON.FeatureCollection>(
    initialGeoJson || {
      type: 'FeatureCollection',
      features: [],
    },
  );

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
          duration: 500,
        });
      }
    },
    [],
  );

  const fitMapToFeature = useCallback(
    (feature: GeoJSON.Feature) => {
      if (!map.current) return;

      // Create a temporary FeatureCollection with just this feature
      const tempFeatureCollection = {
        type: 'FeatureCollection',
        features: [feature],
      } as GeoJSON.FeatureCollection;

      fitMapToFeatures(tempFeatureCollection);
    },
    [fitMapToFeatures],
  );

  const handleAreaSelect = useCallback(
    async (feature: any) => {
      if (!draw.current) return;

      try {
        // Add the new feature to the map
        draw.current.add(feature);

        // Get all features and update the record
        const allFeatures = draw.current.getAll();
        if (allFeatures.features.length > 0) {
          setLocalGeoJson(allFeatures);

          // Save to database
          await updateOneRecord({
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
    [draw, fitMapToFeatures, searchProfileId, updateOneRecord],
  );

  const handleFeatureDelete = useCallback(
    async (featureId: string) => {
      if (!draw.current) return;

      // Delete the feature from the draw control
      draw.current.delete(featureId);

      // Get the updated features
      const updatedFeatures = draw.current.getAll();
      setLocalGeoJson(updatedFeatures);

      // Save to database
      await updateOneRecord({
        idToUpdate: searchProfileId,
        updateOneRecordInput: {
          geoJson: updatedFeatures,
        },
      });
    },
    [draw, searchProfileId, updateOneRecord],
  );

  // Initialize Map and Draw Control
  useEffect(() => {
    if (!mapContainer.current || !mapboxAccessToken || !initialized) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style:
        colorScheme === 'Light'
          ? 'mapbox://styles/mapbox/streets-v12'
          : 'mapbox://styles/mapbox/dark-v11',
      center: [8.5417, 47.3769], // Zurich center
      zoom: 12,
      accessToken: mapboxAccessToken,
      renderWorldCopies: false,
    });

    // Initialize draw control
    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
    });

    const mapInstance = map.current;

    // Clean up function
    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
      map.current = null;
      draw.current = null;
    };
  }, [colorScheme, initialized, mapboxAccessToken]);

  useEffect(() => {
    if (!initialized || !map.current || !draw.current) return;

    const mapInstance = map.current;
    const drawInstance = draw.current;

    // Setup once map is loaded
    const setupMap = () => {
      if (!mapInstance || !drawInstance) return;

      // Disable map animations
      mapInstance.dragRotate.disable();
      mapInstance.touchZoomRotate.disableRotation();
      mapInstance.doubleClickZoom.disable();

      // Add navigation controls
      mapInstance.addControl(new mapboxgl.NavigationControl());

      // Only add draw control if it hasn't been added yet
      if (!mapInstance.hasControl(drawInstance)) {
        mapInstance.addControl(drawInstance);
      }

      // Load initial GeoJSON if provided
      if (initialGeoJson) {
        drawInstance.add(initialGeoJson);
        setLocalGeoJson(initialGeoJson);
        fitMapToFeatures(initialGeoJson);
      }
    };

    // If map is already loaded, setup immediately
    if (mapInstance.loaded()) {
      setupMap();
    } else {
      // Otherwise wait for load event
      mapInstance.once('load', setupMap);
    }

    // Handle draw events
    const createHandler = async () => {
      if (!drawInstance) return;
      const features = drawInstance.getAll();
      if (features.features.length > 0) {
        setLocalGeoJson(features);

        // Save to database
        await updateOneRecord({
          idToUpdate: searchProfileId,
          updateOneRecordInput: {
            geoJson: features,
          },
        });

        fitMapToFeatures(features);
      }
    };

    const updateHandler = async () => {
      if (!drawInstance) return;
      const features = drawInstance.getAll();
      setLocalGeoJson(features);

      // Save to database
      await updateOneRecord({
        idToUpdate: searchProfileId,
        updateOneRecordInput: {
          geoJson: features,
        },
      });

      fitMapToFeatures(features);
    };

    const deleteHandler = async () => {
      if (!drawInstance) return;
      const features = drawInstance.getAll();
      setLocalGeoJson(features);

      // Save to database
      await updateOneRecord({
        idToUpdate: searchProfileId,
        updateOneRecordInput: {
          geoJson: features,
        },
      });
    };

    mapInstance.on('draw.create', createHandler);
    mapInstance.on('draw.update', updateHandler);
    mapInstance.on('draw.delete', deleteHandler);

    // Cleanup function
    return () => {
      if (mapInstance) {
        mapInstance.off('draw.create', createHandler);
        mapInstance.off('draw.update', updateHandler);
        mapInstance.off('draw.delete', deleteHandler);
      }
    };
  }, [
    fitMapToFeatures,
    initialGeoJson,
    initialized,
    searchProfileId,
    updateOneRecord,
  ]);

  // Wait for drawer animation to finish before initializing map
  useEffect(() => {
    setTimeout(() => {
      setInitialized(true);
    }, 1200);
  }, []);

  useEffect(() => {
    if (isMobile && isNavigationDrawerExpanded) {
      map.current?.resize();
    }
  }, [isMobile, isNavigationDrawerExpanded]);

  return (
    <>
      <AreaSearchInput
        onAreaSelect={handleAreaSelect}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />

      <StyledMapContainer>
        {initialized ? (
          <StyledMapWithListContainer>
            <StyledMapWrapper>
              <StyledMap ref={mapContainer} />
            </StyledMapWrapper>
            <StyledFeatureListWrapper>
              <GeoJsonFeatureList
                geoJson={localGeoJson}
                onFeatureDelete={handleFeatureDelete}
                onFeatureSelect={fitMapToFeature}
              />
            </StyledFeatureListWrapper>
          </StyledMapWithListContainer>
        ) : (
          <SkeletonTheme
            baseColor={theme.background.tertiary}
            highlightColor={theme.background.transparent.lighter}
            borderRadius={theme.border.radius.sm}
          >
            <Skeleton width={'100%'} height={'100%'} />
          </SkeletonTheme>
        )}
        {isLoading && (
          <StyledMapLoader>
            <CircularProgressBar barWidth={3} size={24} />
          </StyledMapLoader>
        )}
      </StyledMapContainer>
    </>
  );
};
