import { useEffect, useState } from 'react';

// This hook is used to initialize form input values as draft values from the field value, because form inputs handle their own state.
export const useFieldValueAsDraft = <T>(
  fieldName: string,
  fieldValue: T,
  setDraftValue: (fieldName: string, value?: T) => void,
) => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && Boolean(fieldValue)) {
      setDraftValue(fieldName, fieldValue);
    }
    // Artificially makes sure that shown value is not empty

    setTimeout(() => {
      setInitialized(true);
    }, 150);
  }, [fieldName, fieldValue, initialized, setDraftValue]);

  return initialized;
};
