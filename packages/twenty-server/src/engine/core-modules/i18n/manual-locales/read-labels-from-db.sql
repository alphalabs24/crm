--SELECT CONCAT('### Object translations', ' ###', E'\n')

--UNION ALL

SELECT DISTINCT CONCAT('msgid "', om."labelSingular", '"', E'\n',
              'msgstr "', om."labelSingular", '"', E'\n',
              E'\n',
              'msgid "', om."labelPlural", '"', E'\n',
              'msgstr "', om."labelPlural", '"', E'\n',
              CASE WHEN TRIM(om.description) != '' THEN
                CONCAT(E'\n',
                      'msgid "', om.description, '"', E'\n',
                      'msgstr "', om.description, '"', E'\n')
              ELSE ''
              END)
              
FROM "metadata"."objectMetadata" om
WHERE "workspaceId" = 'da3d12fd-7243-415a-a326-c0719ab571f2'
	AND "nameSingular" IN ('property', 'publication','buyerLead','agency')

--UNION ALL

--SELECT CONCAT('### Field translations', ' ###', E'\n')

UNION ALL

-- DISTINCT to remove duplicates
SELECT DISTINCT CONCAT('msgid "', fm."label", '"', E'\n',
              'msgstr "', fm."label", '"', E'\n',
              CASE WHEN TRIM(fm.description) != '' THEN
                CONCAT(E'\n',
                      'msgid "', fm.description, '"', E'\n',
                      'msgstr "', fm.description, '"', E'\n')
              ELSE ''
              END)
              
FROM "metadata"."fieldMetadata" fm
	LEFT JOIN metadata."objectMetadata" om ON fm."objectMetadataId" = om.id
WHERE fm."workspaceId" = 'da3d12fd-7243-415a-a326-c0719ab571f2'
	AND om."nameSingular" IN ('property', 'publication','buyerLead','agency')
