import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { MatchParticipantService } from 'src/modules/match-participant/match-participant.service';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ObjectMetadataEntity], 'metadata'),
    WorkspaceModule,
  ],
  providers: [MatchParticipantService, ScopedWorkspaceContextFactory],
  exports: [MatchParticipantService],
})
export class MatchParticipantModule {}
