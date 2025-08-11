import { CheckCircle } from "lucide-react";
import { Card, CardContent } from "../ui";

type Props = {
  steps: StepType[];
  onStatusChange: (step: StepType) => StepStatus;
}

const StepsHeader = ({steps, onStatusChange}: Props) => {

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        {/* Mobile Layout: Vertical */}
        <div className="flex flex-col space-y-4 sm:hidden">
          {steps.map((step, index) => {
            const status = onStatusChange(step);
            const stepLabels = {
              upload: 'Upload PDF',
              generate: 'Generate Quiz',
              quiz: 'Take Quiz'
            };

            return (
              <div key={step} className="flex items-center">
                <div className={`flex items-center ${status === 'current' ? 'text-blue-600' :
                    status === 'complete' ? 'text-green-600' : 'text-slate-400'
                  }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${status === 'current' ? 'border-blue-600 bg-blue-50' :
                      status === 'complete' ? 'border-green-600 bg-green-50' :
                        'border-slate-300 bg-slate-50'
                    }`}>
                    {status === 'complete' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <span className="font-semibold text-sm">{index + 1}</span>
                    )}
                  </div>
                  <span className="ml-3 font-medium text-sm">{stepLabels[step]}</span>
                </div>

                {index < steps.length - 1 && (
                  <div className="w-px h-8 bg-slate-300 ml-4 mt-4"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop Layout: Horizontal */}
        <div className="hidden sm:flex items-center justify-between">
          {steps.map((step, index) => {
            const status = onStatusChange(step);
            const stepLabels = {
              upload: 'Upload PDF',
              generate: 'Generate Quiz',
              quiz: 'Take Quiz'
            };

            return (
              <div key={step} className="flex items-center">
                <div className={`flex items-center ${status === 'current' ? 'text-blue-600' :
                    status === 'complete' ? 'text-green-600' : 'text-slate-400'
                  }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${status === 'current' ? 'border-blue-600 bg-blue-50' :
                      status === 'complete' ? 'border-green-600 bg-green-50' :
                        'border-slate-300 bg-slate-50'
                    }`}>
                    {status === 'complete' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <span className="ml-3 font-medium">{stepLabels[step]}</span>
                </div>

                {index < steps.length - 1 && (
                  <div className="w-12 md:w-20 h-0.5 bg-slate-300 mx-3 md:mx-6"></div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  )
};

export default StepsHeader;