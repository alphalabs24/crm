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
import styled from '@emotion/styled';
import { useCallback, useState, ReactNode, useEffect } from 'react';

// --- Styled Grid Layout ---
const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
`;

const StyledGridItemWrapper = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: grab;
  height: 120px;
  overflow: hidden;
  position: relative;
  width: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  &:hover {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }

  .highlight-new {
    animation: highlightNew 1.5s ease-out;
  }

  @keyframes highlightNew {
    0% {
      box-shadow: 0 0 0 3px ${({ theme }) => theme.color.blue};
      opacity: 0.7;
    }
    75% {
      box-shadow: 0 0 0 3px ${({ theme }) => theme.color.blue};
      opacity: 0.7;
    }
    100% {
      box-shadow: 0 0 0 0 transparent;
      opacity: 0;
    }
  }
`;

const StyledImage = styled.img`
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  -webkit-user-drag: none;
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
}: {
  image: { id: string; previewUrl: string };
  renderControls?: (imageId: string, isHovering?: boolean) => ReactNode;
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
    >
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
        id={`image-${image.id}`}
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
}: {
  images: { id: string; previewUrl: string }[];
  onReorder: (newOrder: { id: string; previewUrl: string }[]) => void;
  renderControls?: (imageId: string, isHovering?: boolean) => ReactNode;
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
            />
          ))}
        </StyledGrid>
      </SortableContext>
    </DndContext>
  );
};
