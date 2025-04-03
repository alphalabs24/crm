import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';

import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useRecoilValue } from 'recoil';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

export const useConnectedAccounts = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.ConnectedAccount,
  });

  const { records: accounts, loading } = useFindManyRecords<ConnectedAccount>({
    objectNameSingular: CoreObjectNameSingular.ConnectedAccount,
    filter: {
      accountOwnerId: {
        eq: currentWorkspaceMember?.id,
      },
    },
    recordGqlFields: generateDepthOneRecordGqlFields({ objectMetadataItem }),
  });

  return { accounts, loading };
};
