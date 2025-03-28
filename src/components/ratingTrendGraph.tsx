import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface RatingTrendGraphProps {
    ratings: {
        date: string;
        rating: number;
    }[];
    movieTitle: string;
}

const RatingTrendGraph = ({ ratings, movieTitle }: RatingTrendGraphProps) => {
    const formatTime = (date: string) => {
        const d = new Date(date);
        return d.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const data = {
        labels: ratings.map(r => formatTime(r.date)),
        datasets: [
            {
                label: '6-Hour Moving Average',
                data: ratings.map(r => r.rating),
                borderColor: '#FFB800',
                backgroundColor: 'rgba(255, 184, 0, 0.1)',
                borderWidth: 2,
                pointBackgroundColor: '#FFB800',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.4,
                fill: true
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            intersect: false,
            mode: 'index' as const
        },
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: `Rating Trend for ${movieTitle}`,
                font: {
                    size: 16,
                    weight: 'bold' as const
                },
                padding: {
                    bottom: 20
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                padding: 12,
                displayColors: false,
                callbacks: {
                    label: (context: any) => {
                        return `Rating: ${context.parsed.y.toFixed(1)}/10`;
                    }
                }
            }
        },
        scales: {
            y: {
                min: 0,
                max: 10,
                grid: {
                    display: false
                },
                ticks: {
                    stepSize: 1,
                    font: {
                        size: 12
                    }
                },
                title: {
                    display: true,
                    text: 'Rating',
                    font: {
                        size: 12,
                        weight: 'bold' as const
                    },
                    padding: {
                        top: 10
                    }
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 12
                    }
                },
                title: {
                    display: true,
                    text: 'Time (Last 24 Hours)',
                    font: {
                        size: 12,
                        weight: 'bold' as const
                    },
                    padding: {
                        bottom: 10
                    }
                }
            }
        }
    };

    return (
        <div className="w-full h-[400px] bg-white p-6 rounded-lg shadow-lg">
            <Line options={options} data={data} />
        </div>
    );
};

export default RatingTrendGraph; 