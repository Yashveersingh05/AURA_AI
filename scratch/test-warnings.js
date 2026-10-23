const OBSTACLE_VOCAB = {
  person: { en: 'person', hi: 'इंसान' },
  chair: { en: 'chair', hi: 'कुर्सी' },
  couch: { en: 'sofa', hi: 'सोफ़ा' },
  bed: { en: 'bed', hi: 'पलंग' },
  'dining table': { en: 'table', hi: 'मेज़' },
  car: { en: 'car', hi: 'गाड़ी' },
  door: { en: 'door', hi: 'दरवाज़ा' },
};

function formatObstacleWarning(obstacle, isHindi) {
  const vocab = OBSTACLE_VOCAB[obstacle.class] || { en: obstacle.class, hi: obstacle.class };
  const name = isHindi ? vocab.hi : vocab.en;
  const isUrgent = obstacle.distanceLabel === 'urgent';

  if (isHindi) {
    let posStr = 'ठीक सामने';
    if (obstacle.position === 'left') posStr = 'बाईं तरफ';
    else if (obstacle.position === 'right') posStr = 'दाहिनी तरफ';

    if (isUrgent) {
      return `सावधान! ${posStr} ${name} है!`;
    }
    return `आगे ${posStr} ${name} है।`;
  }

  let posStr = 'directly ahead';
  if (obstacle.position === 'left') posStr = 'on your left';
  else if (obstacle.position === 'right') posStr = 'on your right';

  if (isUrgent) {
    return `Caution! ${name} ${posStr}!`;
  }
  return `${name.charAt(0).toUpperCase() + name.slice(1)} ahead ${posStr}.`;
}

// Test cases
console.log('--- Spoken Voice Warnings Test ---');
console.log('1. Person in front (urgent, Hindi):', formatObstacleWarning({ class: 'person', distanceLabel: 'urgent', position: 'center' }, true));
console.log('2. Person in front (close, Hindi):', formatObstacleWarning({ class: 'person', distanceLabel: 'close', position: 'center' }, true));
console.log('3. Chair on left (close, Hindi):', formatObstacleWarning({ class: 'chair', distanceLabel: 'close', position: 'left' }, true));
console.log('4. Car on right (urgent, Hindi):', formatObstacleWarning({ class: 'car', distanceLabel: 'urgent', position: 'right' }, true));
console.log('5. Person ahead (urgent, English):', formatObstacleWarning({ class: 'person', distanceLabel: 'urgent', position: 'center' }, false));
console.log('6. Table on left (close, English):', formatObstacleWarning({ class: 'dining table', distanceLabel: 'close', position: 'left' }, false));
