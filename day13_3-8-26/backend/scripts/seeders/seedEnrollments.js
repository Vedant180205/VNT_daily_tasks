const pool = require('../../src/config/db');

const firstNames = ['Aarav', 'Vihaan', 'Aditya', 'Rohan', 'Amit', 'Vikram', 'Raj', 'Sanjay', 'Karan', 'Arjun', 'Kabir', 'Aryan', 'Dhruv', 'Ishaan', 'Rahul'];
const lastNames = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Verma', 'Gupta', 'Reddy', 'Rao', 'Yadav', 'Joshi', 'Mishra', 'Chauhan', 'Nair', 'Menon', 'Desai'];

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateRandomName = () => {
  const first = firstNames[getRandomInt(0, firstNames.length - 1)];
  const last = lastNames[getRandomInt(0, lastNames.length - 1)];
  return `${first} ${last}`;
};

const generateRandomPhone = () => {
  return `9${getRandomInt(100000000, 999999999)}`;
};

async function seedEnrollments() {
  try {
    const [teams] = await pool.query('SELECT id FROM teams');
    if (teams.length === 0) {
      console.error('No teams found in the database. Please seed teams first.');
      process.exit(1);
    }

    const teamIds = teams.map(t => t.id);
    const values = [];

    for (let i = 0; i < 1000; i++) {
      const name = generateRandomName();
      const phone = generateRandomPhone();
      const team_id = teamIds[getRandomInt(0, teamIds.length - 1)];
      const status = getRandomInt(0, 2); // 0=unpaid, 1=paid, 2=free
      const invite_type = getRandomInt(0, 1); // 0=non-invited, 1=invited
      const role = getRandomInt(1, 4); // 1=batsman, 2=bowler, 3=wicketkeeper, 4=allrounder
      
      values.push([name, phone, team_id, status, invite_type, role]);
    }

    // Clear existing for idempotency (optional but good for dev)
    await pool.query('DELETE FROM enrollments');
    
    // Bulk insert
    const query = 'INSERT INTO enrollments (name, phone, team_id, status, invite_type, role) VALUES ?';
    await pool.query(query, [values]);

    console.log('Successfully seeded 1000 enrollments.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding enrollments:', error);
    process.exit(1);
  }
}

seedEnrollments();
