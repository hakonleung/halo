'use client';

import { withAuth } from '@/components/auth/with-auth';
import { SettingsPageContent } from '@/components/settings/settings-page-content';
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';

function SettingsPage() {
  return (
    <AuthenticatedLayout>
      <SettingsPageContent />
    </AuthenticatedLayout>
  );
}

export default withAuth(SettingsPage);
