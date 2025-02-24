import { Attachment } from '@/activities/files/types/Attachment';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from 'react';
import { useBlocker } from 'react-router-dom';

type FieldUpdate = {
  fieldName: string;
  value: unknown;
  fieldDefinition: FieldDefinition<FieldMetadata>;
};

export type RecordEditPropertyImage = {
  id: string;
  isAttachment: boolean;
  attachment?: Attachment;
  file?: File;
  previewUrl: string;
  orderIndex: number;
  description: string;
};

export type RecordEditContextType = {
  objectMetadataItem: ObjectMetadataItem;
  updateField: (update: FieldUpdate) => void;
  getUpdatedFields: () => Record<string, unknown>;
  isDirty: boolean;
  resetFields: () => void;
  resetImages: () => void;
  initialRecord: ObjectRecord | null;
  propertyImages: RecordEditPropertyImage[];
  addPropertyImage: (image: RecordEditPropertyImage) => void;
  removePropertyImage: (image: RecordEditPropertyImage) => void;
  updatePropertyImageOrder: (images: RecordEditPropertyImage[]) => void;
  refreshPropertyImageUrls: () => void;
  updatePropertyImage: (
    imageId: string,
    updates: Partial<RecordEditPropertyImage>,
  ) => void;
};

export const RecordEditContext = createContext<RecordEditContextType | null>(
  null,
);

type RecordEditProviderProps = {
  objectMetadataItem: ObjectMetadataItem;
  initialRecord: ObjectRecord | null;
} & PropsWithChildren;

export const RecordEditProvider = ({
  children,
  objectMetadataItem,
  initialRecord,
}: RecordEditProviderProps) => {
  const [fieldUpdates, setFieldUpdates] = useState<Record<string, unknown>>({});
  const [isDirty, setIsDirty] = useState(false);

  const [propertyImages, setPropertyImages] = useState<
    RecordEditPropertyImage[]
  >(
    Object.values(
      (initialRecord?.attachments ?? [])
        .filter((attachment: Attachment) => attachment.type === 'PropertyImage')
        .reduce(
          (
            acc: Record<string, RecordEditPropertyImage>,
            attachment: Attachment,
          ) => ({
            ...acc,
            [attachment.id]: {
              id: attachment.id,
              isAttachment: true,
              attachment,
              file: undefined,
              description: attachment.description ?? '',
              previewUrl: attachment.fullPath,
              orderIndex: attachment.orderIndex,
            },
          }),
          {},
        ),
    ),
  );

  const refreshPropertyImageUrls = useCallback(() => {
    setPropertyImages((prev) =>
      prev.map((image) => ({
        ...image,
        previewUrl: image.file
          ? URL.createObjectURL(image.file)
          : image.previewUrl,
      })),
    );
  }, []);

  const updateField = useCallback(
    (update: FieldUpdate, fieldValue?: unknown) => {
      const { fieldName, value } = update;

      if (fieldValue === update.value) {
        setFieldUpdates((prev) => {
          const { [fieldName]: _, ...rest } = prev;
          const hasRemainingUpdates = Object.keys(rest).length > 0;
          setIsDirty(hasRemainingUpdates);
          return rest;
        });
        return;
      }
      setFieldUpdates((prev) => ({
        ...prev,
        [fieldName]: value,
      }));
      setIsDirty(true);
    },
    [],
  );

  const addPropertyImage = useCallback((image: RecordEditPropertyImage) => {
    setIsDirty(true);
    setPropertyImages((prev) => [...prev, image]);
  }, []);

  const removePropertyImage = useCallback((image: RecordEditPropertyImage) => {
    setIsDirty(true);
    setPropertyImages((prev) => prev.filter((i) => i.id !== image.id));
  }, []);

  const updatePropertyImageOrder = useCallback(
    (orderedImages: RecordEditPropertyImage[]) => {
      setIsDirty(true);
      setPropertyImages(orderedImages);
    },
    [],
  );

  const updatePropertyImage = useCallback(
    (imageId: string, updates: Partial<RecordEditPropertyImage>) => {
      setIsDirty(true);
      setPropertyImages((prev) =>
        prev.map((image) =>
          image.id === imageId ? { ...image, ...updates } : image,
        ),
      );
    },
    [],
  );

  const getUpdatedFields = useCallback(() => fieldUpdates, [fieldUpdates]);

  const resetImages = useCallback(() => {
    setPropertyImages(
      Object.values(
        (initialRecord?.attachments ?? [])
          .filter(
            (attachment: Attachment) => attachment.type === 'PropertyImage',
          )
          .reduce(
            (
              acc: Record<string, RecordEditPropertyImage>,
              attachment: Attachment,
            ) => ({
              ...acc,
              [attachment.id]: {
                id: attachment.id,
                isAttachment: true,
                attachment,
                file: undefined,
                previewUrl: attachment.fullPath,
                orderIndex: attachment.orderIndex,
                description: attachment.description ?? '',
              },
            }),
            {},
          ),
      ),
    );
  }, [initialRecord?.attachments]);

  const resetFields = useCallback(() => {
    setFieldUpdates({});
    resetImages();
    setIsDirty(false);
  }, [resetImages]);

  // This is used to block the user from leaving the page if there are unsaved changes
  useBlocker(({ currentLocation, nextLocation }) => {
    // If there are no unsaved changes or the user is navigating to the same page, don't block
    if (!isDirty || nextLocation.pathname.includes(currentLocation.pathname))
      return false;

    const confirmLeave = window.confirm(
      'You have unsaved changes. Are you sure you want to leave?',
    );

    if (confirmLeave) {
      resetFields();
      return false; // Allow navigation
    }

    return true; // Block navigation
  });

  return (
    <RecordEditContext.Provider
      value={{
        objectMetadataItem,
        updateField,
        getUpdatedFields,
        isDirty,
        resetFields,
        resetImages,
        initialRecord,
        propertyImages,
        addPropertyImage,
        removePropertyImage,
        updatePropertyImageOrder,
        refreshPropertyImageUrls,
        updatePropertyImage,
      }}
    >
      {children}
    </RecordEditContext.Provider>
  );
};

export const useRecordEdit = () => {
  const context = useContext(RecordEditContext);

  if (!context) {
    throw new Error('useRecordEdit must be used within a RecordEditProvider');
  }

  return context;
};
