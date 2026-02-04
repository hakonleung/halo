'use client';

import { withAuth } from '@/client/components/auth/with-auth';
import { AuthenticatedLayout } from '@/client/components/layout/authenticated-layout';
import { SettingsPageContent } from '@/client/components/settings/settings-page-content';

function SettingsPage() {
  return (
    <AuthenticatedLayout>
      <SettingsPageContent />
    </AuthenticatedLayout>
  );
}

export default withAuth(SettingsPage);
