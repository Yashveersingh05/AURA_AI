const tinyJpgBase64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

async function testHindi() {
  console.log('Testing Hindi Currency & Scene analysis...');
  const start = Date.now();

  try {
    const res = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: `data:image/jpeg;base64,${tinyJpgBase64}`,
        mode: 'currency',
        question: 'ये कितने का नोट है?',
        language: 'hi-IN',
      }),
    });

    const elapsed = Date.now() - start;
    const data = await res.json();
    console.log(`Status: ${res.status} (${elapsed}ms)`);
    console.log('Hindi Response:', data);
    return res.ok;
  } catch (err) {
    console.error('Test failed:', err);
    return false;
  }
}

testHindi();
