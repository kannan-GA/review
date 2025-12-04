import { ReviewStats } from '../types';

interface RatingDistributionChartProps {
  stats: ReviewStats;
}

function RatingDistributionChart({ stats }: RatingDistributionChartProps) {
  const levels = [
    { label: 'Excellent', stars: 5 },
    { label: 'Good', stars: 4 },
    { label: 'Average', stars: 3 },
    { label: 'Below Average', stars: 2 },
    { label: 'Poor', stars: 1 },
  ];

  return (
    <div className="space-y-3">
      {levels.map(({ label, stars }) => {
        const count = stats.distribution[stars.toString() as keyof typeof stats.distribution];
        const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

        return (
          <div key={stars} className="flex items-center gap-3">
            <div className="w-28 text-sm text-gray-600 flex-shrink-0">{label}</div>
            <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-orange rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="w-8 text-sm text-gray-500 text-right flex-shrink-0">{count}</div>
          </div>
        );
      })}
    </div>
  );
}

export default RatingDistributionChart;
