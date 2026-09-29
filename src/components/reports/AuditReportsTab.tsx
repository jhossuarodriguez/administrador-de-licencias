'use client';

import { AuditTabCards } from './cards/AuditTabCards';
import { ReportFilters } from '@/hooks/useReportTypes';

interface AuditReportsProps {
    filters?: ReportFilters;
}

export default function AuditReports({ filters }: AuditReportsProps) {
    return (
        <AuditTabCards filters={filters} />
    );
}