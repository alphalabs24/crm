import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { RestApiCoreBatchController } from 'src/engine/api/rest/core/controllers/rest-api-core-batch.controller';
import { RestApiCoreController } from 'src/engine/api/rest/core/controllers/rest-api-core.controller';
import { RestApiExtensionController } from 'src/engine/api/rest/core/controllers/rest-api-extension.controller';
import { CoreQueryBuilderModule } from 'src/engine/api/rest/core/query-builder/core-query-builder.module';
import { RestApiCoreServiceV2 } from 'src/engine/api/rest/core/rest-api-core-v2.service';
import { RestApiCoreService } from 'src/engine/api/rest/core/rest-api-core.service';
import { EndingBeforeInputFactory } from 'src/engine/api/rest/input-factories/ending-before-input.factory';
import { LimitInputFactory } from 'src/engine/api/rest/input-factories/limit-input.factory';
import { StartingAfterInputFactory } from 'src/engine/api/rest/input-factories/starting-after-input.factory';
import { MetadataQueryBuilderModule } from 'src/engine/api/rest/metadata/query-builder/metadata-query-builder.module';
import { RestApiMetadataController } from 'src/engine/api/rest/metadata/rest-api-metadata.controller';
import { RestApiMetadataService } from 'src/engine/api/rest/metadata/rest-api-metadata.service';
import { RestApiService } from 'src/engine/api/rest/rest-api.service';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { GoogleOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client-manager.service';
import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { GmailClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/gmail-client.provider';
import { SendEmailActionModule } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/send-email-action.module';
import { SendEmailWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/send-email.workflow-action';

@Module({
  imports: [
    CoreQueryBuilderModule,
    MetadataQueryBuilderModule,
    WorkspaceCacheStorageModule,
    AuthModule,
    HttpModule,
    TwentyORMModule,
    SendEmailActionModule,
  ],
  controllers: [
    RestApiExtensionController,
    RestApiMetadataController,
    RestApiCoreBatchController,
    RestApiCoreController,
  ],
  providers: [
    RestApiMetadataService,
    RestApiCoreService,
    RestApiCoreServiceV2,
    RestApiService,
    StartingAfterInputFactory,
    EndingBeforeInputFactory,
    LimitInputFactory,
    GmailClientProvider,
    ScopedWorkspaceContextFactory,
    OAuth2ClientManagerService,
    GoogleOAuth2ClientManagerService,
    SendEmailWorkflowAction,
  ],
  exports: [RestApiMetadataService],
})
export class RestApiModule {}
