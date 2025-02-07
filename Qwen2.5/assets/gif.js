generateGifButton.addEventListener('click', () => {
    const gif = new GIF({
      workers: 2,
      quality: 10,
    });
  
    history.forEach((state) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = gridSize * 10;
      canvas.height = gridSize * 10;
      state.forEach((row, r) => {
        row.forEach((cell, c) => {
          ctx.fillStyle = cell ? '#4caf50' : '#212121';
          ctx.fillRect(c * 10, r * 10, 10, 10);
        });
      });
      gif.addFrame(canvas, { delay: timeStep });
    });
  
    gif.on('finished', (blob) => {
      const url = URL.createObjectURL(blob);
      saveGifButton.href = url;
      saveGifButton.download = 'simulation.gif';
    });
  
    gif.render();
  });