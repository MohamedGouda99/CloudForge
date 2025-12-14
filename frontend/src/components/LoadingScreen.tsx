export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="mb-8">
          <img 
            src="/vodafone.png" 
            alt="Vodafone" 
            className="h-20 w-auto mx-auto animate-pulse"
          />
        </div>
        
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-red-200 dark:border-red-900 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Loading CloudForge
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Preparing your enterprise platform...
        </p>
      </div>
    </div>
  );
}

