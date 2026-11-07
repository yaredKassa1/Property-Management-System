-- Drop all tables in correct order (child tables first)
DROP TABLE IF EXISTS transfer_history CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS procurement_inspections CASCADE;
DROP TABLE IF EXISTS returns CASCADE;
DROP TABLE IF EXISTS transfers CASCADE;
DROP TABLE IF EXISTS procurement_workflows CASCADE;
DROP TABLE IF EXISTS requests CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop all ENUM types
DROP TYPE IF EXISTS "public"."enum_users_role" CASCADE;
DROP TYPE IF EXISTS "public"."enum_users_wing" CASCADE;
DROP TYPE IF EXISTS "public"."enum_assets_category" CASCADE;
DROP TYPE IF EXISTS "public"."enum_assets_status" CASCADE;
DROP TYPE IF EXISTS "public"."enum_assets_condition" CASCADE;
DROP TYPE IF EXISTS "public"."enum_assets_sourceType" CASCADE;
DROP TYPE IF EXISTS "public"."enum_requests_requestType" CASCADE;
DROP TYPE IF EXISTS "public"."enum_requests_status" CASCADE;
DROP TYPE IF EXISTS "public"."enum_requests_priority" CASCADE;
DROP TYPE IF EXISTS "public"."enum_requests_fulfillmentPath" CASCADE;
DROP TYPE IF EXISTS "public"."enum_transfers_status" CASCADE;
DROP TYPE IF EXISTS "public"."enum_returns_status" CASCADE;
DROP TYPE IF EXISTS "public"."enum_returns_returnCondition" CASCADE;
DROP TYPE IF EXISTS "public"."enum_procurement_workflows_currentState" CASCADE;
DROP TYPE IF EXISTS "public"."enum_procurement_workflows_approvalAuthorityDecision" CASCADE;
DROP TYPE IF EXISTS "public"."enum_procurement_workflows_vpDecision" CASCADE;
DROP TYPE IF EXISTS "public"."enum_procurement_workflows_qaDecision" CASCADE;
DROP TYPE IF EXISTS "public"."enum_procurement_workflows_workflowType" CASCADE;
DROP TYPE IF EXISTS "public"."enum_procurement_inspections_status" CASCADE;
DROP TYPE IF EXISTS "public"."enum_procurement_inspections_assessedCondition" CASCADE;
DROP TYPE IF EXISTS "public"."enum_notifications_type" CASCADE;
DROP TYPE IF EXISTS "public"."enum_audit_logs_status" CASCADE;
DROP TYPE IF EXISTS "public"."enum_transfer_history_action" CASCADE;
