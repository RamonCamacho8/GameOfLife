const timelineChart = new Chart(document.getElementById('timeline-chart'), {
    type: 'line',
    data: {
      labels: [],
      datasets: [{ label: 'Live Cells', data: [], borderColor: '#bb86fc', fill: false }],
    },
    options: { responsive: true, maintainAspectRatio: false },
  });
  
  function updateTimeline(liveCells) {
    timelineChart.data.labels.push(timelineChart.data.labels.length);
    timelineChart.data.datasets[0].data.push(liveCells);
    timelineChart.update();
  }