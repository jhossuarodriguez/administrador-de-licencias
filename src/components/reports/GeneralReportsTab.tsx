'use client';

import { GeneralReportsGraph } from './graph/GeneralReportsGraph';
import { ReportFilters } from '@/hooks/useReportTypes';

interface AdvancedChartsProps {
    filters?: ReportFilters;
}

export default function AdvancedCharts({ filters }: AdvancedChartsProps) {

    // GRAFICOS DE LA PESTAÑA GENERAL
    return (
        <div className="space-y-6">
            <GeneralReportsGraph filters={filters} />
        </div>
    );
}