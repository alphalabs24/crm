import { isPublicAttachmentType } from 'twenty-shared';

import { QueryResultGetterHandlerInterface } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-getter-handler.interface';

import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { FileService } from 'src/engine/core-modules/file/services/file.service';

export class AttachmentQueryResultGetterHandler
  implements QueryResultGetterHandlerInterface
{
  constructor(private readonly fileService: FileService) {}

  async handle(
    attachment: AttachmentWorkspaceEntity,
    workspaceId: string,
  ): Promise<AttachmentWorkspaceEntity> {
    if (!attachment.id || !attachment?.fullPath) {
      return attachment;
    }

    const signedPayload = await this.fileService.encodeFileToken({
      attachmentId: attachment.id,
      workspaceId: workspaceId,
    });

    const isPublic = isPublicAttachmentType(attachment.type);

    const queryParams = !isPublic
      ? `token=${signedPayload}`
      : `workspaceId=${workspaceId}`;

    const fullPath = `${process.env.SERVER_URL}/files/${attachment.fullPath}?${queryParams}`;

    return {
      ...attachment,
      fullPath,
    };
  }
}
