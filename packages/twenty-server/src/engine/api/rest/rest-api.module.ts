import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { RestApiCoreBatchController } from 'src/engine/api/rest/core/controllers/rest-api-core-batch.controller';
import { RestApiCoreController } from 'src/engine/api/rest/core/controllers/rest-api-core.controller';
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
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { RestApiNewCoreController } from 'src/engine/api/rest/core/controllers/rest-new-core.controller';
import { SendEmailWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/send-email.workflow-action';
import { GmailClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/gmail-client.provider';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { GoogleOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client-manager.service';

@Module({
  imports: [
    CoreQueryBuilderModule,
    MetadataQueryBuilderModule,
    WorkspaceCacheStorageModule,
    AuthModule,
    HttpModule,
    TwentyORMModule,
  ],
  controllers: [
    RestApiNewCoreController,
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
    SendEmailWorkflowAction,
    GmailClientProvider,
    ScopedWorkspaceContextFactory,
    OAuth2ClientManagerService,
    GoogleOAuth2ClientManagerService,
  ],
  exports: [RestApiMetadataService],
})
export class RestApiModule {}
