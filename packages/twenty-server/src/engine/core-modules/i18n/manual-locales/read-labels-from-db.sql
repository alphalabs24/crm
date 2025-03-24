SELECT translations
FROM (
  SELECT
    om.id as object_id,
    om."nameSingular" as object_name,
    NULL as field_id,
    NULL as field_name,
    CONCAT(
      '# object singular ', om."nameSingular", E'\n',
      'msgid "', om."labelSingular", '"', E'\n',
      'msgstr "', om."labelSingular", '"', E'\n',
      E'\n',
      '# object plural ', om."namePlural", E'\n',
      'msgid "', om."labelPlural", '"', E'\n',
      'msgstr "', om."labelPlural", '"', E'\n',
      CASE WHEN TRIM(om.description) != '' THEN
          CONCAT(
            E'\n',
            '# object description "', om.description, '" of ', om."nameSingular", E'\n',
            'msgid "', om.description, '"', E'\n',
            'msgstr "', om.description, '"', E'\n'
            )
        ELSE NULL
      END
      ) as translations
  FROM "metadata"."objectMetadata" om
  WHERE om."workspaceId" = 'da3d12fd-7243-415a-a326-c0719ab571f2'
    AND om."nameSingular" IN ('property', 'publication','buyerLead','agency')

  UNION ALL

  SELECT
    om.id as object_id,
    om."nameSingular" as object_name,
    fm.id as field_id,
    fm."name" as field_name,
    CONCAT(
      '# field "', fm."name", '" of ', om."nameSingular", E'\n',
      'msgid "', fm."label", '"', E'\n',
      'msgstr "', fm."label", '"', E'\n'
      ) as translations
  FROM "metadata"."objectMetadata" om
    LEFT JOIN "metadata"."fieldMetadata" fm ON fm."objectMetadataId" = om.id
  WHERE om."workspaceId" = 'da3d12fd-7243-415a-a326-c0719ab571f2'
    AND om."nameSingular" IN (
      'property',
      -- we currently avoid publications because its mainly duplicates from properties
      --'publication',
      'buyerLead',
      'agency'
    )
    AND fm."isSystem" = FALSE
    -- ignore list because the label already exist in the translations
    -- change the label in the db (including migrations) if you want to change them
    AND fm."label" NOT IN (
      'Agency',
      'Agencies',
      'Property',
      'Properties',
      'Publication',
      'Publications',
      'Buyer Lead',
      'Buyer Leads',
      --
      'Person',
      'People',
      'Person id (foreign key)',
      'Company',
      'Companies',
      'Company id (foreign key)',
      'Opportunity',
      'Opportunities',
      'Opportunity id (foreign key)',
      'Task',
      'Tasks',
      'Task id (foreign key)',
      'Note',
      'Notes',
      'Note id (foreign key)',
      'Attachment',
      'Attachments',
      'Attachment id (foreign key)',
      --
      'Creation date',
      'Created by',
      'Deleted at',
      'Identifier',
      'Last update',
      --
      'Email',
      'Name',
      'Phone',
      'Address',
      'Description',
      'Stage',
      -- unused labels
      'Documents',
      'Movies',
      'Pictures'
      )
    -- handling duplicates within this dataset
    AND NOT (fm.label = 'Message Participations' AND om."nameSingular" = 'buyerLead') -- we translate the label from property
    AND NOT (fm.label = 'Message Participations' AND om."nameSingular" = 'publication') -- we translate the label from property

  UNION ALL

  SELECT
    om.id as object_id,
    om."nameSingular" as object_name,
    fm.id as field_id,
    fm."name" as field_name,
    CONCAT(
      '# field description "', fm.description, '" of ', fm."name", ' on ', om."nameSingular", E'\n',
      'msgid "', fm.description, '"', E'\n',
      'msgstr "', fm.description, '"', E'\n'
      ) as translations
  FROM "metadata"."objectMetadata" om
    LEFT JOIN "metadata"."fieldMetadata" fm ON fm."objectMetadataId" = om.id
  WHERE om."workspaceId" = 'da3d12fd-7243-415a-a326-c0719ab571f2'
    AND om."nameSingular" IN (
      'property',
      -- we currently avoid publications because its mainly duplicates from properties
      --'publication',
      'buyerLead',
      'agency'
    )
    AND fm."isSystem" = FALSE

    -- description specific
    AND TRIM(fm.description) != ''
    -- ignore list because the description already exist in the translations
    -- change the description in the db (including migrations) if you want to change them
    AND fm.description NOT IN (
      'array of {filename:'''',title:'''',description:'''',url:''''}',
      'array of {filename:'''',title:'''',description'''',url:''''}',
      'Attachments tied to the {label}',
      'Creation date',
      'Date when the record was deleted',
      'Last time the record was changed',
      'Name',
      'Notes tied to the {label}',
      'Tasks tied to the {label}',
      'The creator of the record'
      )
    -- handling duplicates within this dataset
    AND NOT (fm.description = 'In kg' AND fm."name" = 'carryingCapacityElevator')

) as subquery
ORDER BY object_name, COALESCE(field_name, '')
