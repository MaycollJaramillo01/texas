'use client';

import { useState, useCallback } from 'react';
import ProgressBar from '@/components/ui/ProgressBar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import CustomerTypeStep from './CustomerTypeStep';
import ServiceStep from './ServiceStep';
import ProjectQuestionsStep from './ProjectQuestionsStep';
import LeadCaptureStep from './LeadCaptureStep';
import EstimateResult from './EstimateResult';
import type { CustomerType, ServiceType, WizardData, EstimateRange, EstimateResponse } from '@/types/estimate';

const STEP_LABELS = [
  'Client Type',
  'Service',
  'Project Details',
  'Your Info',
  'Your Estimate',
];

const EMPTY_LEAD = { name: '', email: '', phone: '', city: '' };

export default function EstimatorWizard() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [data, setData] = useState<WizardData>({
    customerType: null,
    service: null,
    projectDetails: {},
    lead: EMPTY_LEAD,
  });
  const [stepValid, setStepValid] = useState(false);
  const [estimate, setEstimate] = useState<EstimateRange | null>(null);
  const [resultMessage, setResultMessage] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Step 3: project questions validity
  const handleDetailsChange = useCallback(
    (details: Record<string, unknown>, isValid: boolean) => {
      setData((prev) => ({ ...prev, projectDetails: details }));
      setStepValid(isValid);
    },
    []
  );

  // Step 4: lead validity
  const handleLeadChange = useCallback(
    (lead: WizardData['lead'], isValid: boolean) => {
      setData((prev) => ({ ...prev, lead }));
      setStepValid(isValid);
    },
    []
  );

  const goBack = () => {
    setApiError(null);
    setStep((s) => Math.max(1, s - 1) as typeof step);
  };

  const goNext = async () => {
    if (step === 4) {
      await submit();
      return;
    }
    setStep((s) => Math.min(5, s + 1) as typeof step);
  };

  const submit = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerType: data.customerType,
          service: data.service,
          projectDetails: data.projectDetails,
          lead: data.lead,
        }),
      });
      const json: EstimateResponse = await res.json();
      if (!json.success || !json.estimate) {
        setApiError(json.error ?? 'Something went wrong. Please try again.');
        return;
      }
      setEstimate(json.estimate);
      setResultMessage(json.message);
      setStep(5);
    } catch {
      setApiError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const startOver = () => {
    setStep(1);
    setData({ customerType: null, service: null, projectDetails: {}, lead: EMPTY_LEAD });
    setEstimate(null);
    setApiError(null);
    setStepValid(false);
  };

  // Compute whether the Continue button should be enabled
  const canContinue = (() => {
    if (step === 1) return data.customerType !== null;
    if (step === 2) return data.service !== null;
    if (step === 3) return stepValid;
    if (step === 4) return stepValid;
    return false;
  })();

  const isLastInputStep = step === 4;

  return (
    <div className="flex flex-col gap-6">
      {step < 5 && <ProgressBar currentStep={step} totalSteps={5} labels={STEP_LABELS} />}

      <Card className="p-6 sm:p-8">
        {/* Step content */}
        {step === 1 && (
          <CustomerTypeStep
            value={data.customerType}
            onChange={(v: CustomerType) => {
              setData((prev) => ({ ...prev, customerType: v }));
            }}
          />
        )}

        {step === 2 && (
          <ServiceStep
            value={data.service}
            onChange={(v: ServiceType) => {
              setData((prev) => ({ ...prev, service: v, projectDetails: {} }));
            }}
          />
        )}

        {step === 3 && data.service && (
          <ProjectQuestionsStep
            key={data.service}
            service={data.service}
            defaultValues={data.projectDetails}
            onChange={handleDetailsChange}
          />
        )}

        {step === 4 && (
          <LeadCaptureStep value={data.lead} onChange={handleLeadChange} />
        )}

        {step === 5 && estimate && data.service && (
          <EstimateResult
            estimate={estimate}
            service={data.service}
            message={resultMessage}
            onStartOver={startOver}
          />
        )}

        {/* API error */}
        {apiError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{apiError}</p>
          </div>
        )}

        {/* Navigation */}
        {step < 5 && (
          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
            <Button
              variant="ghost"
              size="md"
              onClick={goBack}
              disabled={step === 1}
            >
              ← Back
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={goNext}
              disabled={!canContinue}
              loading={loading}
            >
              {isLastInputStep ? 'Get My Estimate →' : 'Continue →'}
            </Button>
          </div>
        )}
      </Card>

      {/* Trust signals */}
      {step < 5 && (
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5 text-green-600" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.97 5.03a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-2-2a.75.75 0 011.06-1.06l1.47 1.47 3.97-3.97a.75.75 0 011.06 0z" clipRule="evenodd" />
            </svg>
            Licensed, Bonded & Insured
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5 text-green-600" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.97 5.03a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-2-2a.75.75 0 011.06-1.06l1.47 1.47 3.97-3.97a.75.75 0 011.06 0z" clipRule="evenodd" />
            </svg>
            No commitment required
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5 text-green-600" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.97 5.03a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-2-2a.75.75 0 011.06-1.06l1.47 1.47 3.97-3.97a.75.75 0 011.06 0z" clipRule="evenodd" />
            </svg>
            Texas Hill Country
          </span>
        </div>
      )}
    </div>
  );
}
