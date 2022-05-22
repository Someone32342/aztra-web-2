const averageColor = async (size: number, src: string) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Could not get canvas context');
  }

  const image = new Image();

  image.crossOrigin = 'anonymous';
  image.src = src;
  await new Promise((r) => (image.onload = r));

  canvas.width = size;
  canvas.height = size;

  context.drawImage(image, 0, 0, 1, 1);

  console.log(canvas.toDataURL());

  const imageData = context.getImageData(0, 0, 1, 1);
  const { data } = imageData;

  return (
    '#' +
    Array.from(data)
      .slice(0, 3)
      .map((x) => {
        const hex = x.toString(16);
        return hex.toString().length == 1 ? '0' + hex : hex.toString();
      })
      .join('')
  );
};

export default averageColor;
