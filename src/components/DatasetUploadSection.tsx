import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  RotateCcw, 
  Table, 
  Eye, 
  ShieldCheck, 
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { parseDatasetFile, SAMPLE_TAMIL_NADU_CSV, DatasetParseResult } from '../utils/datasetParser';

interface DatasetUploadSectionProps {
  onDatasetParsed: (result: DatasetParseResult) => void;
  onClearDataset: () => void;
  isDatasetActive: boolean;
  parseResult: DatasetParseResult | null;
}

export const DatasetUploadSection: React.FC<DatasetUploadSectionProps> = ({
  onDatasetParsed,
  onClearDataset,
  isDatasetActive,
  parseResult,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [showExcludedRows, setShowExcludedRows] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);
    setFileName(file.name);

    try {
      const isJson = file.name.endsWith('.json') || file.type === 'application/json';
      const text = await file.text();
      const result = await parseDatasetFile(text, isJson);

      if (result.records.length === 0 && result.excludedRecords.length === 0) {
        setErrorMessage('Uploaded file is empty or could not be parsed.');
        setIsLoading(false);
        return;
      }

      onDatasetParsed(result);
    } catch (err: any) {
      setErrorMessage(`Failed to parse file: ${err.message || String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleLoadSample = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setFileName('tamil_nadu_air_quality_sample.csv');
    try {
      const result = await parseDatasetFile(SAMPLE_TAMIL_NADU_CSV, false);
      onDatasetParsed(result);
    } catch (err: any) {
      setErrorMessage(`Error loading sample: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFileName(null);
    setErrorMessage(null);
    setShowExcludedRows(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClearDataset();
  };

  return (
    <section id="upload-dataset-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 border-t border-[#E2E8F0] bg-[#FFFFFF]">
      
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0891B2]">
              Batch Telemetry Ingestion
            </span>
            <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
            <span className="text-xs text-[#64748B]">CSV / JSON Auto-Mapping</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
            Upload & Analyze Air Quality Dataset
          </h2>
        </div>

        {/* Quick Sample Dataset Loader */}
        <button
          onClick={handleLoadSample}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-xl border border-[#0891B2]/30 bg-[#0891B2]/10 px-4 py-2 text-xs font-semibold text-[#0891B2] hover:bg-[#0891B2]/20 transition-all self-start sm:self-auto shadow-sm"
        >
          <Sparkles className="h-4 w-4 text-[#0891B2]" />
          <span>Load Sample Tamil Nadu Dataset</span>
        </button>
      </div>

      <p className="text-sm text-[#475569] mb-6 max-w-3xl leading-relaxed">
        Upload a CSV containing air-quality and weather readings. The system will clean, analyze, and visualize the data. 
        Case-insensitive column variations for PM2.5, PM10, NO2, CO, temperature, humidity, wind, and coordinates will be automatically mapped.
      </p>

      {/* Upload Drag & Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all ${
          isDragging
            ? 'border-[#0891B2] bg-[#0891B2]/5 scale-[0.99]'
            : 'border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#94A3B8] hover:bg-[#F1F5F9]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.json,text/csv,application/json"
          onChange={handleFileInputChange}
          className="hidden"
          id="dataset-file-input"
        />

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm mb-3 text-[#0891B2]">
          <UploadCloud className="h-7 w-7" />
        </div>

        <div className="text-center">
          <label
            htmlFor="dataset-file-input"
            className="cursor-pointer text-sm font-bold text-[#0891B2] hover:text-[#0e7490] hover:underline"
          >
            Click to upload dataset file
          </label>
          <span className="text-sm text-[#475569]"> or drag and drop</span>
          <p className="mt-1 text-xs text-[#64748B]">
            Supported formats: Structured CSV or JSON array (max 20 MB)
          </p>
        </div>

        {fileName && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] px-3 py-1.5 text-xs font-medium text-[#0F172A] shadow-sm">
            <FileSpreadsheet className="h-4 w-4 text-[#059669]" />
            <span>Loaded: <strong>{fileName}</strong></span>
          </div>
        )}

        {isLoading && (
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#0891B2]">
            <span className="h-2 w-2 rounded-full bg-[#0891B2] animate-ping"></span>
            <span>Parsing and validating telemetry records...</span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 rounded-xl border border-[#DC2626]/30 bg-[#DC2626]/10 p-3.5 text-xs text-[#DC2626] flex items-center gap-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Dataset Validation & Cleaning Summary */}
      {parseResult && (
        <div className="mt-6 rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-md">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-[#059669]"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#059669]">
                  Dataset Quality Assessment
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">
                Ingestion Audit & Column Mapping Summary
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowExcludedRows(!showExcludedRows)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  showExcludedRows
                    ? 'border-[#0891B2] bg-[#0891B2]/10 text-[#0891B2]'
                    : 'border-[#CBD5E1] bg-[#FFFFFF] text-[#475569] hover:bg-[#F8FAFC]'
                }`}
              >
                {showExcludedRows ? 'Use Cleaned Data' : 'Show Excluded Rows'}
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-[#FFFFFF] px-3 py-1.5 text-xs font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Clear Dataset</span>
              </button>
            </div>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-center">
              <span className="text-[11px] text-[#64748B] font-medium block">Total Rows</span>
              <strong className="text-xl font-bold font-mono text-[#0F172A]">{parseResult.summary.totalRows}</strong>
            </div>

            <div className="rounded-xl border border-[#059669]/20 bg-[#059669]/5 p-3 text-center">
              <span className="text-[11px] text-[#059669] font-medium block">Valid Rows</span>
              <strong className="text-xl font-bold font-mono text-[#059669]">{parseResult.summary.validRows}</strong>
            </div>

            <div className="rounded-xl border border-[#DC2626]/20 bg-[#DC2626]/5 p-3 text-center">
              <span className="text-[11px] text-[#DC2626] font-medium block">Invalid Rows</span>
              <strong className="text-xl font-bold font-mono text-[#DC2626]">{parseResult.summary.invalidRows}</strong>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-center">
              <span className="text-[11px] text-[#64748B] font-medium block">Missing Values</span>
              <strong className="text-xl font-bold font-mono text-[#D97706]">{parseResult.summary.missingValuesCount}</strong>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-center">
              <span className="text-[11px] text-[#64748B] font-medium block">Duplicates</span>
              <strong className="text-xl font-bold font-mono text-[#475569]">{parseResult.summary.duplicateRowsCount}</strong>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-center">
              <span className="text-[11px] text-[#64748B] font-medium block">Corrected</span>
              <strong className="text-xl font-bold font-mono text-[#0891B2]">{parseResult.summary.correctedValuesCount}</strong>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-center">
              <span className="text-[11px] text-[#64748B] font-medium block">Excluded</span>
              <strong className="text-xl font-bold font-mono text-[#64748B]">{parseResult.summary.excludedRowsCount}</strong>
            </div>
          </div>

          {/* Column Detection Report */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-xs">
            <div>
              <span className="font-semibold text-[#0F172A] block mb-2">
                ✓ Detected Parameters ({parseResult.summary.detectedColumns.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {parseResult.summary.detectedColumns.map((col) => (
                  <span
                    key={col}
                    className="rounded bg-[#FFFFFF] border border-[#CBD5E1] px-2 py-0.5 font-mono text-[11px] text-[#059669] font-medium shadow-xs"
                  >
                    {col}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="font-semibold text-[#64748B] block mb-2">
                ○ Missing Optional Columns ({parseResult.summary.missingColumns.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {parseResult.summary.missingColumns.map((col) => (
                  <span
                    key={col}
                    className="rounded bg-[#FFFFFF] border border-[#E2E8F0] px-2 py-0.5 font-mono text-[11px] text-[#94A3B8]"
                  >
                    {col}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Geographic coverage feedback */}
          {parseResult.recordsOutsideTN > 0 && (
            <div className="mt-4 rounded-lg border border-[#D97706]/30 bg-[#D97706]/10 p-3 text-xs text-[#D97706]">
              Some uploaded records ({parseResult.recordsOutsideTN}) are outside the Tamil Nadu map area; they are preserved in analytical tables.
            </div>
          )}

          {/* Excluded Rows Table View (if toggled) */}
          {showExcludedRows && parseResult.excludedRecords.length > 0 && (
            <div className="mt-4 overflow-x-auto rounded-xl border border-[#DC2626]/20 bg-[#DC2626]/5 p-4 text-xs">
              <span className="font-bold text-[#DC2626] block mb-2">
                Excluded Raw Records ({parseResult.excludedRecords.length})
              </span>
              <table className="w-full text-left font-mono text-[11px]">
                <thead>
                  <tr className="border-b border-[#DC2626]/20 text-[#64748B]">
                    <th className="py-1">Row ID</th>
                    <th className="py-1">Location</th>
                    <th className="py-1">Timestamp</th>
                    <th className="py-1">Validation Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {parseResult.excludedRecords.map((ex) => (
                    <tr key={ex.id} className="border-b border-[#DC2626]/10">
                      <td className="py-1 text-[#DC2626]">{ex.id}</td>
                      <td className="py-1 text-[#0F172A]">{ex.location}</td>
                      <td className="py-1 text-[#64748B]">{ex.timestamp}</td>
                      <td className="py-1 text-[#DC2626]">{ex.validationNotes.join(' · ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

    </section>
  );
};
