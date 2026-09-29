'use client';
import { TemporalAnalysisGraph } from './graph/TemporalAnalysisGraph';
import { TemporalFilters } from '@/hooks/useReportTypes';

interface TemporalAnalysisProps {
    filters?: TemporalFilters;
}

export default function TemporalAnalysis({ filters }: TemporalAnalysisProps) {

    return (
        <TemporalAnalysisGraph filters={filters} />
    );
}