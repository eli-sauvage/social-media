const chartOptions = {
    type: 'line',
    data: {
        labels: null,
        datasets: []
    },
    options: {

        elements: {
            point: {
                pointRadius: 2,
            },
        },
        interaction: {
            mode: 'index',
            intersect: false
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if(context.raw == null)
                            return 'pas de données'
                        else
                            return label + " : " + context.raw;
                    }
                }
            },
            legend: {
                position: "bottom"
            }
        }
    }
}
const defaultDataset = {
    spanGaps: true,
    label: null,
    data: null,
    backgroundColor: 'rgba(255, 99, 132, 1)',
    borderColor: 'rgba(255, 99, 132, 1)',
    borderWidth: 1,
    tension: 0.3
}
const colors = { instagram: 'rgba(255, 99, 132, 1)', facebook: 'rgba(66, 103, 178, 1)', twitter: 'rgba(29, 161, 242)', linkedin: 'rgba(40,103,178, 1)' }
const networkList = ["instagram", "facebook", "twitter", "linkedin"];
let selectableMedias = {
    posts: networkList,
    follows: networkList,
    impressions: ["instagram", "facebook", "linkedin"],
    engagement: ["instagram", "facebook", "linkedin"],
    engagementRate: ["instagram", "facebook", "linkedin"],
    stories: ["instagram"],
    likes: ["instagram", "facebook"],
    comments: ["instagram", "facebook"]
}
