-- =====================================================
-- MIGRATION: Notify admins on new support responses
-- Description: Adds trigger to create admin notifications when a business
--              posts a new response on a support ticket.
-- Date: 2025-11-17
-- =====================================================

-- 1) Function: create a notification for all admins when a business replies
CREATE OR REPLACE FUNCTION notify_admins_support_response()
RETURNS TRIGGER AS $$
DECLARE
  v_subject TEXT;
BEGIN
  -- Only notify for business responses (not admin echoes)
  IF NEW.sender = 'business' THEN
    SELECT subject INTO v_subject FROM support_tickets WHERE id = NEW.ticket_id;

    PERFORM create_notification_for_all_admins(
      'New Support Reply',
      'There is a new reply on support ticket: ' || COALESCE(v_subject, 'Support Request'),
      'info',
      '/admin/support'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2) Trigger: fire after insert on support_responses
DROP TRIGGER IF EXISTS trigger_notify_admin_support_response ON support_responses;
CREATE TRIGGER trigger_notify_admin_support_response
  AFTER INSERT ON support_responses
  FOR EACH ROW
  EXECUTE FUNCTION notify_admins_support_response();

-- Notes:
-- - Relies on existing create_notification_for_all_admins (044_create_admin_notifications.sql).
-- - Does not notify for admin self-responses to avoid noise.
