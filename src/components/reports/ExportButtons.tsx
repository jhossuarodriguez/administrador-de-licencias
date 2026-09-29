'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ExportButtonsProps {
    onExport: (format: 'csv') => void;
    loading?: boolean;
}

export default function ExportButtons({ onExport, loading = false }: ExportButtonsProps) {
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        setExporting(true);
        try {
            await onExport('csv');
        } finally {
            setExporting(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={loading || exporting}
            className="flex items-center gap-2 cursor-pointer"
        >
            <Download className={'h-4 w-4'} />
            Exportar CSV
        </Button>
    );
}