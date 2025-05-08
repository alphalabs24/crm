import { useAttachments } from '@/activities/files/hooks/useAttachments';
import { Attachment } from '@/activities/files/types/Attachment';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useEffect, useMemo } from 'react';

type AgencyLogoEffectProps = {
  agencyId: string;
  setAgencyLogo: (logo: Attachment) => void;
  setLoading?: (loading: boolean) => void;
};

// This effect gets and sets the agency logo if the agency exists.
export const AgencyLogoEffect = ({
  setAgencyLogo,
  agencyId,
  setLoading,
}: AgencyLogoEffectProps) => {
  const { attachments, loading } = useAttachments({
    id: agencyId,
    targetObjectNameSingular: CoreObjectNameSingular.Agency,
  });

  const agencyLogo = useMemo(() => {
    if (!attachments) return null;
    return attachments?.find((a) => a.type === 'PublisherLogo');
  }, [attachments]);

  useEffect(() => {
    if (agencyLogo) {
      setAgencyLogo(agencyLogo);
    }
  }, [agencyLogo, setAgencyLogo]);

  useEffect(() => {
    if (loading) {
      setLoading?.(true);
    } else {
      setLoading?.(false);
    }
  }, [loading, setLoading]);

  return null;
};
