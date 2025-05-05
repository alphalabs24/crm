import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { css, keyframes, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useCallback, useState, ReactNode, useEffect } from 'react';
import { AppTooltip } from 'twenty-ui';

// --- Styled Grid Layout ---
const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
`;

// Define keyframes for the highlight animation dynamically with theme colors
const createHighlightPulse = (color: string) => keyframes`
  0% {
    box-shadow: 0 0 0 0 ${color};
  }
   30% {
    box-shadow: 0 0 0 4px ${color};
  }
  80% {
    box-shadow: 0 0 0 4px ${color};
  }
  100% {
    box-shadow: 0 0 0 0 ${color};
  }
`;

const StyledGridItemWrapper = styled.div<{
  isNew?: boolean;
  highlightAnimation?: any;
}>`
  background: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: grab;
  height: 120px;
  position: relative;
  width: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  &:hover {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }

  ${({ isNew, highlightAnimation }) =>
    isNew &&
    highlightAnimation &&
    css`
      animation: ${highlightAnimation} 2s ease-out;
    `}
`;

const StyledImage = styled.img`
  -webkit-user-drag: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  user-select: none;
  width: 100%;
`;

const StyledControlsWrapper = styled.div`
  position: absolute;
  right: 4px;
  top: 4px;
  z-index: 10;
`;

// --- Sortable Item Component ---
/* eslint-disable react/jsx-props-no-spreading */
const SortableImage = ({
  image,
  renderControls,
  isNew,
}: {
  image: { id: string; previewUrl: string; tooltipContent?: string };
  renderControls?: (imageId: string, isHovering?: boolean) => ReactNode;
  isNew?: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const [isHovering, setIsHovering] = useState(false);
  const theme = useTheme();
  const highlightAnimation = createHighlightPulse(theme.color.blue);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <StyledGridItemWrapper
      ref={setNodeRef}
      style={style}
      data-handler-id={image.id}
      className={isHovering ? 'is-hovering' : ''}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      {...attributes}
      id={`image-container-${image.id}`}
      isNew={isNew}
      highlightAnimation={highlightAnimation}
    >
      {/* Tooltip with explicit control to ensure it's visible */}
      {isHovering && (
        <AppTooltip
          anchorSelect={`#image-container-${image.id}`}
          content={image.tooltipContent || 'No description'}
          place="top"
          isOpen={true}
          width="200px"
        />
      )}

      {/* Dedicated drag handle that covers the whole image but not controls */}
      <div
        {...listeners}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          cursor: 'grab',
        }}
        className="drag-handle"
      />

      <StyledImage
        src={image.previewUrl}
        alt="preview"
        draggable={false}
        style={{ position: 'relative', zIndex: 0 }}
      />

      {/* Controls rendered in a container with higher z-index */}
      {renderControls && (
        <StyledControlsWrapper className="no-drag">
          {typeof renderControls === 'function'
            ? renderControls(image.id, isHovering)
            : renderControls}
        </StyledControlsWrapper>
      )}
    </StyledGridItemWrapper>
  );
};

// --- Main Component ---
export const ImageGridDnd = ({
  images,
  onReorder,
  renderControls,
  newImageIds,
}: {
  images: { id: string; previewUrl: string; tooltipContent?: string }[];
  onReorder: (
    newOrder: { id: string; previewUrl: string; tooltipContent?: string }[],
  ) => void;
  renderControls?: (imageId: string, isHovering?: boolean) => ReactNode;
  newImageIds?: Set<string>;
}) => {
  const [items, setItems] = useState(images);

  // Update items when images prop changes
  useEffect(() => {
    setItems(images);
  }, [images]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (active.id !== over?.id) {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over?.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        setItems(reordered);
        onReorder(reordered);
      }
    },
    [items, onReorder],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={rectSortingStrategy}
      >
        <StyledGrid>
          {items.map((image) => (
            <SortableImage
              key={image.id}
              image={image}
              renderControls={renderControls}
              isNew={newImageIds?.has(image.id)}
            />
          ))}
        </StyledGrid>
      </SortableContext>
    </DndContext>
  );
};
