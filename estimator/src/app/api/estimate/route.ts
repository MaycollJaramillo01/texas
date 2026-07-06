import { NextRequest, NextResponse } from 'next/server';
import { calculateEstimate } from '@/lib/server/estimate-engine';
import { syncLeadToGHL } from '@/lib/server/ghl';
import { EstimateRequestSchema, validateProjectDetails } from '@/lib/validators/estimate.schema';
import type { EstimateResponse } from '@/types/estimate';

export async function POST(req: NextRequest): Promise<NextResponse<EstimateResponse>> {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid request body.' }, { status: 400 });
    }

    const parsed = EstimateRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request. Please review all fields.' },
        { status: 400 }
      );
    }

    const { customerType, service, projectDetails, lead } = parsed.data;

    let validatedDetails: Record<string, unknown>;
    try {
      validatedDetails = validateProjectDetails(service, projectDetails) as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { success: false, error: 'Please review the project details. Some values may be invalid.' },
        { status: 400 }
      );
    }

    const sqft = Number(validatedDetails.squareFootage ?? 0);
    const sheets = Number(validatedDetails.sheets ?? 0);
    if (sqft > 25000 || sheets > 1500) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please review the project details. Some values seem unusually high.',
        },
        { status: 422 }
      );
    }

    const estimate = calculateEstimate(customerType, service, validatedDetails);

    console.info('[THR-LEAD]', JSON.stringify({ lead, service, customerType, timestamp: new Date().toISOString() }));

    try {
      await syncLeadToGHL({ lead, customerType, service, projectDetails: validatedDetails, estimate });
    } catch (err) {
      // The visitor still gets their estimate even if the CRM is down; the
      // [THR-LEAD] log line above is the fallback record for manual recovery.
      console.error('[THR-GHL-SYNC-ERROR]', err);
    }

    return NextResponse.json({
      success: true,
      estimate,
      message:
        'This estimate is based on the information provided and is for informational purposes only. Final pricing will be confirmed after an on-site project verification.',
    });
  } catch (err) {
    console.error('[THR-ESTIMATE-ERROR]', err);
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
