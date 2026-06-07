---
name: Onboarding checklist
description: GetStartedChecklist 3-step card on logged-in home; derives state from existing tables, no new schema
type: feature
---
3-step "Get Started" card on logged-in home (above QuickUpdateBar), dismissible per-user via localStorage key `echo_checklist_dismissed_{user.id}`.

Steps (all derived from existing data — no user_activation table):
1. Connect email — `user_email_settings.is_connected`
2. Create first campaign — `campaigns.length > 0`
3. Send first batch — any campaign with status active/sending/completed OR stats.sent > 0

Hides automatically when all 3 done or dismissed. WelcomeModal still fires on first login.
