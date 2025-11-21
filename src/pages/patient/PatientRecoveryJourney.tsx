
import React from "react";
import { useTitle } from "@/hooks/use-title";
import PageLayout from "@/components/layout/PageLayout";
import RecoveryJourneyMain from "@/components/recovery/RecoveryJourneyMain";

const PatientRecoveryJourney = () => {
  useTitle("Recovery Journey - Medical Universe");

  return (
    <PageLayout userRole="patient" className="min-h-screen">
      <RecoveryJourneyMain />
    </PageLayout>
  );
};

export default PatientRecoveryJourney;
