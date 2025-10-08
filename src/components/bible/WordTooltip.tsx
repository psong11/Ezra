/**
 * Word Tooltip Component
 * Displays word explanation with loading and error states
 * Uses golden ratio (1:1.618) for elegant proportions
 */

interface WordTooltipProps {
  explanation: string | null;
  isLoading: boolean;
  error: string | null;
}

export default function WordTooltip({ explanation, isLoading, error }: WordTooltipProps) {
  return (
    <div 
      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl z-10 w-[32rem] max-h-[28rem] overflow-y-auto"
      dir="ltr"
    >
      <div className="px-8 py-6">
        {isLoading && (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Loading explanation...</span>
          </div>
        )}

        {error && (
          <div className="text-red-300">
            <div className="font-semibold mb-1">Error</div>
            <div className="text-xs">{error}</div>
          </div>
        )}

        {explanation && !isLoading && !error && (
          <div className="text-left text-sm leading-relaxed whitespace-pre-wrap break-words" dir="ltr">
            {explanation}
          </div>
        )}
      </div>

      {/* Arrow pointing down */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
        <div className="border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
}
