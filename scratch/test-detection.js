import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

async function run() {
  console.log('Testing tf ready...');
  await tf.ready();
  console.log('Backend:', tf.getBackend());
  
  console.log('Loading coco-ssd...');
  const model = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
  console.log('Model loaded!');

  // Test detection on a simulated 640x480 canvas/tensor
  const input = tf.zeros([480, 640, 3], 'int32');
  const preds = await model.detect(input, 6, 0.20);
  console.log('Predictions on blank frame:', preds);

  console.log('All tests passed cleanly!');
  process.exit(0);
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
