const session = await fetch('http://127.0.0.1:8000/api/token/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'seeker@gmail.com', password: 'password123' })
});
console.log(session.status);
console.log(await session.text());
