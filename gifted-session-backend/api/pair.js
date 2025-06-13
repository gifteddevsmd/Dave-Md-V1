export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { number } = req.body;

  if (!number) {
    return res.status(400).json({ error: 'Number is required' });
  }

  // Generate dummy pair code (you can later connect real code logic)
  const code = Math.floor(100_000 + Math.random() * 900_000).toString();

  // TODO: send session ID to number via WhatsApp (if needed)

  res.status(200).json({ code });
}
