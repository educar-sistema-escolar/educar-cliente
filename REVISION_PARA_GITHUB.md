# Revisión para GitHub — frontend

Fecha: 26/10/2026. Rama: codex/final-presentation-qa. Sin staging, commit, push, merge ni deploy.

Remoto actualizado con fetch; HEAD frente a origin/main: 0/0. Inventario completo de cambios de las tres etapas:

```text
 M .gitignore
 M package.json
 M src/App.tsx
 M src/features/admin/services/reportsRepository.ts
 M src/features/admin/services/transportRepository.ts
 M src/features/auth/data/localDemoAccounts.ts
 M src/features/auth/services/demoAuth.ts
 D src/features/auth/services/localCredentialsStore.ts
 M src/features/auth/services/supabaseAuth.ts
 M src/features/auth/services/supabaseClient.ts
 M src/features/student/services/studentPortalRepository.ts
 M src/features/teacher/services/teacherRepository.ts
 M src/index.css
 M src/pages/admin/AcademicMasterDataPage.tsx
 M src/pages/admin/ActivitiesPage.tsx
 M src/pages/admin/AdminLayout.tsx
 M src/pages/admin/BillingPage.tsx
 M src/pages/admin/CommentsModerationPage.tsx
 M src/pages/admin/CrearNoticiaPage.tsx
 M src/pages/admin/CuentasDelSistemaPage.tsx
 M src/pages/admin/EnrollmentRequestsPage.tsx
 M src/pages/admin/GestionNoticiasPage.tsx
 M src/pages/admin/OpinionModerationPage.tsx
 M src/pages/admin/ReportsPage.tsx
 M src/pages/admin/ServiciosPage.tsx
 M src/pages/admin/services/SportsServicesPage.tsx
 M src/pages/admin/services/TransportServicesPage.tsx
 M src/pages/family/FamilyLayout.tsx
 M src/pages/home/components/ContactSection.tsx
 M src/pages/home/components/EnrollmentInviteSection.tsx
 M src/pages/jobs/JobsPage.tsx
 M src/pages/login/LoginPage.tsx
 M src/pages/news/NewsPage.tsx
 M src/pages/opiniones/OpinionsPage.tsx
 M src/pages/registration/RegistrationPage.tsx
 M src/pages/student/StudentActivitiesPage.tsx
 M src/pages/student/StudentPortalLayout.tsx
 M src/pages/student/StudentPortalPage.tsx
 M src/pages/teacher/TeacherDashboardPage.tsx
 M src/pages/teacher/TeacherLayout.tsx
 M src/pages/teacher/teacher.css
 M src/shared/components/layout/Footer.tsx
 M src/shared/components/layout/Header.tsx
 M src/shared/utils/userFacingError.ts
 M tests/teacher-session.test.mjs
?? AUDITORIA_REQUERIMIENTOS.md
?? REVISION_PARA_GITHUB.md
?? demo.env.example
?? docs/RESUMEN_ETAPA_2_DISENO.md
?? docs/RESUMEN_ETAPA_3_QA_FINAL.md
?? docs/demo-restringida.md
?? docs/demo.nginx.conf
?? scripts/check-production-secrets.mjs
?? src/features/admin/services/reportCsv.ts
?? src/features/admin/services/sportScheduleRules.ts
?? src/features/auth/services/authTimeout.ts
?? src/features/student/services/sportRecommendationRules.ts
?? src/features/student/services/sportRecommendationsRepository.ts
?? src/pages/student/SportRecommendationAssistant.tsx
?? src/shared/components/layout/InstitutionalLayout.tsx
?? src/shared/components/layout/institutional.css
?? src/shared/components/ui/Button.tsx
?? src/shared/hooks/useAccessibleDialog.ts
?? src/shared/utils/demoAccess.ts
?? src/shared/utils/educationalLevelLabel.ts
?? tests/demo-access.test.mjs
?? tests/sport-recommendations.test.mjs
?? tests/sport-schedule-rules.test.mjs
?? tests/stage3-client.test.mjs
?? tests/teacher-display-name.test.mjs
```

Revisión: rutas y servicios conectados, cambios previos preservados, lint/build/tests y verificaciones remotas descritos en RESUMEN_ETAPA_3_QA_FINAL.md. Sin valores configurados de credenciales ni claves privadas en los archivos candidatos. .env, temporales, evidencias, capturas y builds están ignorados y no se versionan. Las tres migraciones de Etapa 3 coinciden con su fuente registrada. No ejecutar seed/provision para repetir QA: usar verificaciones de lectura y SQL con ROLLBACK.

Mensaje de commit propuesto: Unificar paneles institucionales y cerrar validaciones de acceso y reportes

No publicar antes de la revisión y autorización del usuario. La rama no tiene upstream propio todavía.
