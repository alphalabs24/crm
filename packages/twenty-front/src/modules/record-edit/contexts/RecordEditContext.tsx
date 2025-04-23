import { useAttachments } from '@/activities/files/hooks/useAttachments';
import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import {
  Attachment,
  PropertyAttachmentType,
} from '@/activities/files/types/Attachment';
import { Note } from '@/activities/types/Note';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useAttachRelatedRecordFromRecord } from '@/object-record/hooks/useAttachRelatedRecordFromRecord';
import { useDestroyOneRecord } from '@/object-record/hooks/useDestroyOneRecord';
import { useDetachRelatedRecordFromRecord } from '@/object-record/hooks/useDetachRelatedRecordFromRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useParams } from 'react-router-dom';
import { isDefined, isPublicAttachmentType } from 'twenty-shared';
import { getEnv } from '~/utils/get-env';

type FieldUpdate = {
  fieldName: string;
  value: unknown;
};

export type RecordEditPropertyImage = {
  id: string;
  isAttachment: boolean;
  attachment?: Attachment;
  file?: File;
  previewUrl: string;
  description: string;
  fileName?: string;
};

export type RecordEditPropertyDocument = {
  id: string;
  file?: File;
  description?: string;
  previewUrl: string;
  type: PropertyAttachmentType;
  isAttachment: boolean;
  attachment?: Attachment;
  orderIndex?: number;
  fileName?: string;
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
  loading: boolean;
  saveRecord: () => Promise<Error | undefined>;
  propertyDocuments: RecordEditPropertyDocument[];
  addPropertyDocument: (document: RecordEditPropertyDocument) => void;
  removePropertyDocument: (document: RecordEditPropertyDocument) => void;
  updatePropertyDocumentOrder: (
    documents: RecordEditPropertyDocument[],
  ) => void;
  refreshPropertyDocumentUrls: () => void;
  updatePropertyDocument: (
    documentId: string,
    updates: Partial<RecordEditPropertyDocument>,
  ) => void;
  emailTemplate: Note | null;
  setEmailTemplate: (template: Note | null) => void;
  updateDraftValue: (fieldName: string, value: unknown) => void;
  draftValues: Record<string, unknown>;
};

export const RecordEditContext = createContext<RecordEditContextType | null>(
  null,
);

type RecordEditProviderProps = {
  objectMetadataItem: ObjectMetadataItem;
  initialRecord: ObjectRecord | null;
} & PropsWithChildren;

const geocodeAddress = async (address: {
  addressStreet1?: string | null;
  addressStreet2?: string | null;
  addressCity?: string | null;
  addressState?: string | null;
  addressPostcode?: string | null;
  addressCountry?: string | null;
}) => {
  const apiKey = getEnv('REACT_APP_MAPBOX_ACCESS_TOKEN');
  if (!apiKey) return null;

  // Only geocode if we have at least a street and city
  if (!address.addressStreet1 || !address.addressCity) return null;

  const addressString = [
    address.addressStreet1,
    address.addressStreet2,
    address.addressCity,
    address.addressState,
    address.addressPostcode,
    address.addressCountry,
  ]
    .filter(Boolean)
    .join(', ');

  const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    addressString,
  )}.json?access_token=${apiKey}&types=address&country=ch,de,fr,it&proximity=8.5417,47.3769&limit=1`;

  try {
    const response = await fetch(endpoint);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].geometry.coordinates;
      return { addressLat: lat, addressLng: lng };
    }
  } catch (error) {
    console.error('Error geocoding address:', error);
  }

  return null;
};

const hasAddressChanged = (updates: Record<string, unknown>) => {
  return 'address' in updates;
};

export const RecordEditProvider = ({
  children,
  objectMetadataItem,
  initialRecord,
}: RecordEditProviderProps) => {
  const [loading, setLoading] = useState(false);
  const [fieldUpdates, setFieldUpdates] = useState<Record<string, unknown>>({});
  const [draftValues, setDraftValues] = useState<Record<string, unknown>>({});
  const [isDirty, setIsDirty] = useState(false);
  const { objectRecordId, objectNameSingular } = useParams();

  const [attachmentsToDelete, setAttachmentsToDelete] = useState<Attachment[]>(
    [],
  );

  // Track both current and previous email template
  const [emailTemplate, setEmailTemplate] = useState<Note | null>(null);
  const [previousEmailTemplate, setPreviousEmailTemplate] =
    useState<Note | null>(null);

  // Update previous template when current template changes
  const handleSetEmailTemplate = useCallback((template: Note | null) => {
    setEmailTemplate(template);
    setIsDirty(true);
  }, []);

  // Record Handling
  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: objectNameSingular ?? '',
  });

  // Email Template Relations
  const { updateOneRecordAndAttachRelations: attachTemplateToProperty } =
    useAttachRelatedRecordFromRecord({
      recordObjectNameSingular: CoreObjectNameSingular.Note,
      fieldNameOnRecordObject: 'emailTemplateForProperties',
    });

  const { updateOneRecordAndAttachRelations: attachTemplateToPublication } =
    useAttachRelatedRecordFromRecord({
      recordObjectNameSingular: CoreObjectNameSingular.Note,
      fieldNameOnRecordObject: 'emailTemplateForPublications',
    });

  const { updateOneRecordAndDetachRelations: detachTemplateFromProperty } =
    useDetachRelatedRecordFromRecord({
      recordObjectNameSingular: CoreObjectNameSingular.Note,
      fieldNameOnRecordObject: 'emailTemplateForProperties',
    });

  const { updateOneRecordAndDetachRelations: detachTemplateFromPublication } =
    useDetachRelatedRecordFromRecord({
      recordObjectNameSingular: CoreObjectNameSingular.Note,
      fieldNameOnRecordObject: 'emailTemplateForPublications',
    });

  // Attachment Handling
  const { uploadAttachmentFile } = useUploadAttachmentFile();
  const { updateOneRecord: updateOneAttachment } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Attachment,
  });
  const { destroyOneRecord: destroyOneAttachment } = useDestroyOneRecord({
    objectNameSingular: CoreObjectNameSingular.Attachment,
  });
  const { attachments } = useAttachments({
    id: objectRecordId ?? '',
    targetObjectNameSingular: objectNameSingular ?? '',
  });
  const attachmentImages = useMemo(() => {
    return attachments
      ?.filter((attachment: Attachment) => attachment.type === 'PropertyImage')
      .sort((a, b) => a.orderIndex - b.orderIndex)
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
            description: attachment.description ?? '',
          },
        }),
        {},
      );
  }, [attachments]);

  const attachmentDocuments = useMemo(() => {
    return attachments
      ?.filter(
        (attachment: Attachment) =>
          attachment.type === 'PropertyDocument' ||
          attachment.type === 'PropertyDocumentation' ||
          attachment.type === 'PropertyFlyer',
      )
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((attachment: Attachment) => ({
        ...attachment,
        isAttachment: true,
        attachment,
        file: undefined,
        previewUrl: attachment.fullPath,
        description: attachment.description ?? '',
        fileName: attachment.name,
      }));
  }, [attachments]);

  const [propertyImages, setPropertyImages] = useState<
    RecordEditPropertyImage[]
  >([]);

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
    (update: FieldUpdate) => {
      const { fieldName, value } = update;

      if (initialRecord?.[fieldName] === value) {
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
    [initialRecord],
  );

  const addPropertyImage = useCallback((image: RecordEditPropertyImage) => {
    setIsDirty(true);
    setPropertyImages((prev) => [...prev, image]);
  }, []);

  const removePropertyImage = useCallback((image: RecordEditPropertyImage) => {
    setIsDirty(true);
    const attachment = image.attachment;

    if (isDefined(attachment)) {
      setAttachmentsToDelete((prev) => [...prev, attachment]);
    }

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
    setPropertyImages(Object.values(attachmentImages));
  }, [attachmentImages]);

  const resetDocuments = useCallback(() => {
    setPropertyDocuments(
      Object.values(attachmentDocuments) as RecordEditPropertyDocument[],
    );
  }, [attachmentDocuments]);

  const resetFields = useCallback(() => {
    setFieldUpdates({});
    setIsDirty(false);
  }, []);

  const [propertyDocuments, setPropertyDocuments] = useState<
    RecordEditPropertyDocument[]
  >([]);

  const [documentsToDelete, setDocumentsToDelete] = useState<Attachment[]>([]);

  // Document handling functions
  const addPropertyDocument = useCallback(
    async (document: Omit<RecordEditPropertyDocument, 'id'>) => {
      setIsDirty(true);

      if (
        document.type === 'PropertyDocumentation' ||
        document.type === 'PropertyFlyer'
      ) {
        const existingIndex = propertyDocuments.findIndex(
          (doc) => doc.type === document.type,
        );
        // replace existing document of same type if it exists
        if (existingIndex !== -1) {
          const updatedDocuments = [...propertyDocuments];
          updatedDocuments.splice(existingIndex, 1);
          setPropertyDocuments(updatedDocuments);
        }
      }

      const newDocument: RecordEditPropertyDocument = {
        ...document,
        // local id
        id: crypto.randomUUID(),
      };

      setPropertyDocuments((prev) => [...prev, newDocument]);
    },
    [propertyDocuments],
  );

  const removePropertyDocument = useCallback(
    (document: RecordEditPropertyDocument) => {
      const attachment = document.attachment;
      setIsDirty(true);

      if (isDefined(attachment)) {
        setDocumentsToDelete((prev) => [...prev, attachment]);
      }

      setPropertyDocuments((prev) => prev.filter((d) => d.id !== document.id));
    },
    [],
  );

  const updatePropertyDocumentOrder = useCallback(
    (orderedDocuments: RecordEditPropertyDocument[]) => {
      setIsDirty(true);
      setPropertyDocuments(orderedDocuments);
    },
    [],
  );

  const refreshPropertyDocumentUrls = useCallback(() => {
    setPropertyDocuments((prev) =>
      prev.map((doc) => ({
        ...doc,
        previewUrl: doc.file ? URL.createObjectURL(doc.file) : doc.previewUrl,
      })),
    );
  }, []);

  const updatePropertyDocument = useCallback(
    (documentId: string, updates: Partial<RecordEditPropertyDocument>) => {
      setIsDirty(true);
      setPropertyDocuments((prev) =>
        prev.map((doc) =>
          doc.id === documentId ? { ...doc, ...updates } : doc,
        ),
      );
    },
    [],
  );

  // This saves the whole record with the updated fields from the form
  const saveRecord = async () => {
    try {
      setLoading(true);
      if (isDirty) {
        const updatedFields = getUpdatedFields();

        // Check if address was modified
        if (hasAddressChanged(updatedFields)) {
          const addressUpdate = updatedFields.address as Record<
            string,
            unknown
          >;

          // Only geocode if coordinates are not already provided
          const coordinates = await geocodeAddress(addressUpdate);
          if (coordinates) {
            updatedFields.address = {
              ...addressUpdate,
              ...coordinates,
            };
          }
        }

        await updateOneRecord({
          idToUpdate: objectRecordId ?? '',
          updateOneRecordInput: updatedFields,
        });

        // Handle email template relations
        if (previousEmailTemplate) {
          // Detach the previous template based on the record type
          if (objectNameSingular === CoreObjectNameSingular.Property) {
            await detachTemplateFromProperty({
              recordId: previousEmailTemplate.id,
              relatedRecordId: objectRecordId ?? '',
            });
          } else if (
            objectNameSingular === CoreObjectNameSingular.Publication
          ) {
            await detachTemplateFromPublication({
              recordId: previousEmailTemplate.id,
              relatedRecordId: objectRecordId ?? '',
            });
          }
        }

        // Attach new template if it exists
        if (emailTemplate) {
          if (objectNameSingular === CoreObjectNameSingular.Property) {
            await attachTemplateToProperty({
              recordId: emailTemplate.id,
              relatedRecordId: objectRecordId ?? '',
            });
          } else if (
            objectNameSingular === CoreObjectNameSingular.Publication
          ) {
            await attachTemplateToPublication({
              recordId: emailTemplate.id,
              relatedRecordId: objectRecordId ?? '',
            });
          }
        }

        // First delete removed images
        await Promise.all(
          attachmentsToDelete.map((attachment: Attachment) => {
            return destroyOneAttachment(attachment.id);
          }),
        );

        // Then process remaining/new images
        let orderIndex = 0;
        for (const image of propertyImages) {
          if (image.isAttachment && isDefined(image.attachment)) {
            await updateOneAttachment({
              idToUpdate: image.attachment.id,
              updateOneRecordInput: {
                orderIndex,
                description: image.description,
              },
            });
          } else if (isDefined(image.file)) {
            if (isDefined(objectRecordId) && isDefined(objectNameSingular)) {
              await uploadAttachmentFile(
                image.file,
                {
                  id: objectRecordId,
                  targetObjectNameSingular: objectNameSingular,
                },
                'PropertyImage',
                orderIndex,
                image.fileName,
                image.description,
              );
            }
          }
          orderIndex++;
        }

        // First delete removed documents
        await Promise.all(
          documentsToDelete.map((attachment: Attachment) => {
            return destroyOneAttachment(attachment.id);
          }),
        );

        // Then process remaining/new documents
        for (const document of propertyDocuments) {
          if (document.isAttachment && isDefined(document.attachment)) {
            await updateOneAttachment({
              idToUpdate: document.attachment.id,
              updateOneRecordInput: {
                orderIndex,
                name:
                  document.fileName ??
                  document.file?.name ??
                  document.attachment.name,
                description: document.description,
              },
            });
          } else if (isDefined(document.file)) {
            const isPublic = isPublicAttachmentType(document.type);

            await uploadAttachmentFile(
              document.file,
              {
                id: objectRecordId ?? '',
                targetObjectNameSingular: objectNameSingular ?? '',
              },
              document.type ?? 'PropertyDocument',
              orderIndex,
              document.fileName,
              document.description,
              isPublic,
            );
          }
          orderIndex++;
        }

        resetFields();
      }
    } catch (error) {
      return error as Error;
    } finally {
      setLoading(false);
    }
  };

  const updateDraftValue = useCallback((fieldName: string, value: unknown) => {
    setDraftValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  }, []);

  // Initialize email template from the record when loaded
  useEffect(() => {
    if (initialRecord) {
      // Assuming the template relation is loaded with the record
      // You might need to adjust this based on your actual data structure
      const initialTemplate = initialRecord.emailTemplate ?? null;
      setEmailTemplate(initialTemplate);
      setPreviousEmailTemplate(initialTemplate);
    }
  }, [initialRecord]);

  useEffect(() => {
    resetImages();
    resetDocuments();
  }, [resetImages, resetDocuments]);

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
        loading,
        saveRecord,
        propertyDocuments,
        addPropertyDocument,
        removePropertyDocument,
        updatePropertyDocumentOrder,
        refreshPropertyDocumentUrls,
        updatePropertyDocument,
        emailTemplate,
        setEmailTemplate: handleSetEmailTemplate,
        updateDraftValue,
        draftValues,
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
