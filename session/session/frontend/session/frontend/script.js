async function generateCode() {
  const number = document.getElementById('number').value;
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = '⏳ Generating...';

  try {
    const res = await fetch('http://localhost:3000/pair', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number })
    });

    const data = await res.json();

    if (data.pairCode) {
      resultDiv.innerHTML = `✅ Your Pair Code: <code>${data.pairCode}</code>`;
    } else {
      resultDiv.innerHTML = `❌ Error: ${data.error || 'Unknown error'}`;
    }
  } catch (err) {
    resultDiv.innerHTML = `❌ Network error`;
  }
}
