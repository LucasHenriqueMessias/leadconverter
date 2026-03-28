import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { LeadIngestionSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const adminDb = getAdminDb();

    if (!adminDb) {
      return NextResponse.json(
        {
          error: 'Firebase Admin nao configurado no servidor',
          code: 'ADMIN_DB_ERROR',
          details:
            'Configure FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL e FIREBASE_ADMIN_PRIVATE_KEY no .env.local',
        },
        { status: 500 }
      );
    }

    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'API Key nao fornecida (header: x-api-key)',
          code: 'MISSING_API_KEY',
        },
        { status: 401 }
      );
    }

    const apiKeySnapshot = await adminDb
      .collection('apiKeys')
      .where('key', '==', apiKey)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (apiKeySnapshot.empty) {
      return NextResponse.json(
        {
          error: 'API Key invalida ou inativa',
          code: 'INVALID_API_KEY',
        },
        { status: 401 }
      );
    }

    const apiKeyDoc = apiKeySnapshot.docs[0];
    const organizationId = apiKeyDoc.get('organizationId') as string;

    await apiKeyDoc.ref.update({ lastUsedAt: new Date() });

    let payloadData: unknown;
    try {
      payloadData = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: 'JSON invalido no body',
          code: 'INVALID_JSON',
        },
        { status: 400 }
      );
    }

    const validationResult = LeadIngestionSchema.safeParse(payloadData);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err) => ({
        field: err.path.join('.') || 'unknown',
        message: err.message,
      }));

      return NextResponse.json(
        {
          error: 'Validacao falhou',
          code: 'VALIDATION_ERROR',
          details: errors,
        },
        { status: 400 }
      );
    }

    const leadData = validationResult.data;
    const clientData = {
      organizationId,
      userId: '',
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      document: leadData.document || '',
      segment: leadData.segment || '',
      notes: leadData.notes || '',
      customFields: {
        leadOrigin: leadData.origin,
      },
      tags: leadData.tags,
      createdAt: new Date(),
      updatedAt: new Date(),
      leadOrigin: leadData.origin,
      createdViaApi: true,
    };

    const docRef = await adminDb
      .collection('organizations')
      .doc(organizationId)
      .collection('clients')
      .add(clientData);

    try {
      await adminDb
        .collection('organizations')
        .doc(organizationId)
        .collection('interactions')
        .add({
          organizationId,
          clientId: docRef.id,
          type: 'note',
          subject: `Lead recebido de ${leadData.origin}`,
          description: `Lead ingerido automaticamente via API (origem: ${leadData.origin})`,
          date: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: '',
          userName: 'API',
        });
    } catch (error) {
      console.warn('Erro ao criar interacao de ingestion:', error);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Lead criado com sucesso',
        leadId: docRef.id,
        organizationId,
        origin: leadData.origin,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao processar lead:', error);

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    },
  });
}
