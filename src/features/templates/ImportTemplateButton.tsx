import React from 'react';
import { Upload } from 'lucide-react';
import { useTemplateStore } from '../../stores/useTemplateStore';
import { useErrorStore } from '../../stores/useErrorStore';
import { isTauri, readTemplateBrowser, readTemplateTauri, validate_template } from '../../lib/templateImport';

interface ImportTemplateButtonProps {
    profileId: string;
    projectId: string;
}

/**
 * Import Template button component.
 * Opens a file picker (browser) or native dialog (Tauri) to import a .ledgy.json template.
 */
export const ImportTemplateButton: React.FC<ImportTemplateButtonProps> = ({ profileId, projectId }) => {
    const { importTemplate, isImporting } = useTemplateStore();
    const { dispatchError } = useErrorStore();

    const handleImport = async () => {
        try {
            const raw = isTauri() ? await readTemplateTauri() : await readTemplateBrowser();
            if (!raw) return; // User cancelled
            if (!validate_template(raw)) {
                dispatchError('Invalid template file: missing or malformed fields');
                return;
            }
            await importTemplate(raw, profileId, projectId);
        } catch (err: any) {
            dispatchError(err.message || 'Import failed');
        }
    };

    return (
        <button
            onClick={handleImport}
            disabled={isImporting}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800/50 text-zinc-300 rounded transition-colors disabled:cursor-not-allowed"
            title="Import template from .ledgy.json file"
            aria-label="Import template"
        >
            <Upload size={16} />
            <span>Import</span>
            {isImporting && (
                <span className="ml-1 text-xs text-zinc-500">...</span>
            )}
        </button>
    );
};
