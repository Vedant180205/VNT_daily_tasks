const app = require('./src/app');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'local'}`);
    console.log(`Database: ${process.env.DB_NAME || 'test'} on ${process.env.DB_HOST || 'localhost'}`);
});