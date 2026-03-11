// Legacy constants – retained only for backward compatibility with any
// external references.  All runtime code should use useWorkspace().tenantId.

/** @deprecated Resolve tenant dynamically via WorkspaceContext */
export const DEMO_TENANT_ID = "00000000-0000-0000-0000-000000000001";

/** @deprecated Use useWorkspace().tenantId */
export const DEMO_ORG_ID = DEMO_TENANT_ID;
