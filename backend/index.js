const express = require('express')
const app = express()

app.use(express.json())

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' })
})

app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from Docker' })
})

app.listen(3000, () => console.log('Backend running on port 3000'))