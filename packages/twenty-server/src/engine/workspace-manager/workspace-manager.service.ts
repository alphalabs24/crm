import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Not, Repository } from 'typeorm';

import { DEV_SEED_USER_WORKSPACE_IDS } from 'src/database/typeorm-seeds/core/user-workspaces';
import {
  SEED_ACME_WORKSPACE_ID,
  SEED_APPLE_WORKSPACE_ID,
} from 'src/database/typeorm-seeds/core/workspaces';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { PETS_DATA_SEEDS } from 'src/engine/seeder/data-seeds/pets-data-seeds';
import { SURVEY_RESULTS_DATA_SEEDS } from 'src/engine/seeder/data-seeds/survey-results-data-seeds';
import { PETS_METADATA_SEEDS } from 'src/engine/seeder/metadata-seeds/pets-metadata-seeds';
import { SURVEY_RESULTS_METADATA_SEEDS } from 'src/engine/seeder/metadata-seeds/survey-results-metadata-seeds';
import { SeederService } from 'src/engine/seeder/seeder.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { defaultWorkspacePrefillData } from 'src/engine/workspace-manager/default-workspace-prefill-data/default-workspace-prefill-data';
import { seedWorkspaceWithDemoData } from 'src/engine/workspace-manager/demo-objects-prefill-data/seed-workspace-with-demo-data';
import { standardObjectsPrefillData } from 'src/engine/workspace-manager/standard-objects-prefill-data/standard-objects-prefill-data';
import { WorkspaceSyncMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.service';

@Injectable()
export class WorkspaceManagerService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly seederService: SeederService,
    private readonly dataSourceService: DataSourceService,
    private readonly workspaceSyncMetadataService: WorkspaceSyncMetadataService,
    private readonly permissionsService: PermissionsService,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectRepository(RelationMetadataEntity, 'metadata')
    private readonly relationMetadataRepository: Repository<RelationMetadataEntity>,
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
    private readonly roleService: RoleService,
    private readonly userRoleService: UserRoleService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly environmentService: EnvironmentService,
  ) {}

  /**
   * Init a workspace by creating a new data source and running all migrations
   * @param workspaceId
   * @returns Promise<void>
   */
  public async init({
    workspaceId,
    userId,
  }: {
    workspaceId: string;
    userId: string;
  }): Promise<void> {
    const schemaName =
      await this.workspaceDataSourceService.createWorkspaceDBSchema(
        workspaceId,
      );

    const dataSourceMetadata =
      await this.dataSourceService.createDataSourceMetadata(
        workspaceId,
        schemaName,
      );

    let defaultWorkspaceId = this.environmentService.get(
      'DEFAULT_METADATA_WORKSPACE_ID',
    );

    if (
      defaultWorkspaceId &&
      !(await this.workspaceDataSourceService.checkSchemaExists(
        defaultWorkspaceId,
      ))
    ) {
      defaultWorkspaceId = '';
    }

    await this.workspaceSyncMetadataService.synchronize({
      workspaceId,
      dataSourceId: dataSourceMetadata.id,
      defaultWorkspaceId,
    });

    const permissionsEnabled =
      await this.permissionsService.isPermissionsEnabled();

    if (permissionsEnabled === true) {
      await this.initPermissions({ workspaceId, userId });
    }

    if (!defaultWorkspaceId) {
      await this.prefillWorkspaceWithStandardObjects(
        dataSourceMetadata,
        workspaceId,
      );
    } else {
      await this.prefillWorkspaceWithDefaultWorkspaceData(
        dataSourceMetadata,
        workspaceId,
        defaultWorkspaceId,
      );
    }
  }

  /**
   * InitDemo a workspace by creating a new data source and running all migrations
   * @param workspaceId
   * @returns Promise<void>
   */
  public async initDemo(workspaceId: string): Promise<void> {
    const schemaName =
      await this.workspaceDataSourceService.createWorkspaceDBSchema(
        workspaceId,
      );

    const dataSourceMetadata =
      await this.dataSourceService.createDataSourceMetadata(
        workspaceId,
        schemaName,
      );

    await this.workspaceSyncMetadataService.synchronize({
      workspaceId,
      dataSourceId: dataSourceMetadata.id,
    });

    await this.prefillWorkspaceWithDemoObjects(dataSourceMetadata, workspaceId);
  }

  public async initDev(workspaceId: string): Promise<void> {
    const schemaName =
      await this.workspaceDataSourceService.createWorkspaceDBSchema(
        workspaceId,
      );

    const dataSourceMetadata =
      await this.dataSourceService.createDataSourceMetadata(
        workspaceId,
        schemaName,
      );

    await this.workspaceSyncMetadataService.synchronize({
      workspaceId: workspaceId,
      dataSourceId: dataSourceMetadata.id,
    });

    const permissionsEnabled =
      await this.permissionsService.isPermissionsEnabled();

    if (permissionsEnabled === true) {
      await this.initPermissionsDev(workspaceId);
    }
  }

  /**
   *
   * We are prefilling a few standard objects with data to make it easier for the user to get started.
   *
   * @param dataSourceMetadata
   * @param workspaceId
   */
  private async prefillWorkspaceWithStandardObjects(
    dataSourceMetadata: DataSourceEntity,
    workspaceId: string,
  ) {
    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    if (!workspaceDataSource) {
      throw new Error('Could not connect to workspace data source');
    }

    const createdObjectMetadata =
      await this.objectMetadataService.findManyWithinWorkspace(workspaceId);

    await standardObjectsPrefillData(
      workspaceDataSource,
      dataSourceMetadata.schema,
      createdObjectMetadata,
    );
  }

  /**
   *
   * We are prefilling a few standard objects with data to make it easier for the user to get started.
   *
   * @param dataSourceMetadata
   * @param workspaceId
   */
  private async prefillWorkspaceWithDefaultWorkspaceData(
    dataSourceMetadata: DataSourceEntity,
    workspaceId: string,
    defaultWorkspaceId: string,
  ) {
    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    if (!workspaceDataSource) {
      throw new Error('Could not connect to workspace data source');
    }

    const createdObjectMetadata =
      await this.objectMetadataService.findManyWithinWorkspace(workspaceId);

    // the same for the default workspace

    // currently the connection to multiple datasources is not supported
    // so basically the datasource is always connected to core,
    // see: typeorm.service.ts, connectToDataSource method, isMultiDatasourceEnabled = false
    const defaultWorkspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        defaultWorkspaceId,
      );

    if (!defaultWorkspaceDataSource) {
      throw new Error('Could not connect to default workspace data source');
    }

    const defaultWorkspaceDataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        defaultWorkspaceId,
      );

    const defaultWorkspaceObjectMetadata =
      await this.objectMetadataService.findManyWithinWorkspace(
        defaultWorkspaceId,
        {
          where: {
            isCustom: false,
            standardId: Not(IsNull()),
            fields: {
              isCustom: false,
              standardId: Not(IsNull()),
            },
          },
        },
      );

    await defaultWorkspacePrefillData({
      workspaceId,
      workspaceDataSource,
      schemaName: dataSourceMetadata.schema,
      objectMetadata: createdObjectMetadata,
      defaultWorkspaceId: defaultWorkspaceId,
      defaultWorkspaceDataSource,
      defaultWorkspaceDataSourceSchemaName:
        defaultWorkspaceDataSourceMetadata.schema,
      defaultWorkspaceObjectMetadata,
    });
  }

  /**
   *
   * We are prefilling a few demo objects with data to make it easier for the user to get started.
   *
   * @param dataSourceMetadata
   * @param workspaceId
   */
  private async prefillWorkspaceWithDemoObjects(
    dataSourceMetadata: DataSourceEntity,
    workspaceId: string,
  ) {
    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    if (!workspaceDataSource) {
      throw new Error('Could not connect to workspace data source');
    }

    const createdObjectMetadata =
      await this.objectMetadataService.findManyWithinWorkspace(workspaceId);

    await seedWorkspaceWithDemoData(
      workspaceDataSource,
      dataSourceMetadata.schema,
      createdObjectMetadata,
    );

    await this.seederService.seedCustomObjects(
      dataSourceMetadata.id,
      workspaceId,
      PETS_METADATA_SEEDS,
      PETS_DATA_SEEDS,
    );

    await this.seederService.seedCustomObjects(
      dataSourceMetadata.id,
      workspaceId,
      SURVEY_RESULTS_METADATA_SEEDS,
      SURVEY_RESULTS_DATA_SEEDS,
    );
  }

  /**
   *
   * Delete a workspace by deleting all metadata and the schema
   *
   * @param workspaceId
   */
  public async delete(workspaceId: string): Promise<void> {
    // Delete data from metadata tables
    await this.relationMetadataRepository.delete({
      workspaceId,
    });
    await this.fieldMetadataRepository.delete({
      workspaceId,
    });

    await this.objectMetadataService.deleteObjectsMetadata(workspaceId);
    await this.workspaceMigrationService.deleteAllWithinWorkspace(workspaceId);
    await this.dataSourceService.delete(workspaceId);
    // Delete schema
    await this.workspaceDataSourceService.deleteWorkspaceDBSchema(workspaceId);
  }

  private async initPermissions({
    workspaceId,
    userId,
  }: {
    workspaceId: string;
    userId: string;
  }) {
    const adminRole = await this.roleService.createAdminRole({
      workspaceId,
    });

    const userWorkspace = await this.userWorkspaceRepository.findOneOrFail({
      where: {
        workspaceId,
        userId,
      },
    });

    await this.userRoleService.assignRoleToUserWorkspace({
      workspaceId,
      userWorkspaceId: userWorkspace[0].id,
      roleId: adminRole.id,
    });
  }

  private async initPermissionsDev(workspaceId: string) {
    await this.featureFlagService.enableFeatureFlags(
      [FeatureFlagKey.IsPermissionsEnabled],
      workspaceId,
    );
    const adminRole = await this.roleService.createAdminRole({
      workspaceId,
    });

    let adminUserWorkspaceId: string | undefined;
    let memberUserWorkspaceId: string | undefined;

    if (workspaceId === SEED_APPLE_WORKSPACE_ID) {
      adminUserWorkspaceId = DEV_SEED_USER_WORKSPACE_IDS.TIM;
      memberUserWorkspaceId = DEV_SEED_USER_WORKSPACE_IDS.JONY;

      // Create guest role only in this workspace
      const guestRole = await this.roleService.createGuestRole({
        workspaceId,
      });

      await this.userRoleService.assignRoleToUserWorkspace({
        workspaceId,
        userWorkspaceId: DEV_SEED_USER_WORKSPACE_IDS.PHIL,
        roleId: guestRole.id,
      });
    } else if (workspaceId === SEED_ACME_WORKSPACE_ID) {
      adminUserWorkspaceId = DEV_SEED_USER_WORKSPACE_IDS.TIM_ACME;
    }

    if (adminUserWorkspaceId) {
      await this.userRoleService.assignRoleToUserWorkspace({
        workspaceId,
        userWorkspaceId: adminUserWorkspaceId,
        roleId: adminRole.id,
      });
    }

    const memberRole = await this.roleService.createMemberRole({
      workspaceId,
    });

    if (memberUserWorkspaceId) {
      await this.userRoleService.assignRoleToUserWorkspace({
        workspaceId,
        userWorkspaceId: memberUserWorkspaceId,
        roleId: memberRole.id,
      });
    }
  }
}
