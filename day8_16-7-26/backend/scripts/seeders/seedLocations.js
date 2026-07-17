const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../.env') }); 


const JSON_FILE_PATH = 'C:\\Users\\vedant\\Downloads\\json-countries+states+cities.json\\countries+states+cities.json';
const BATCH_SIZE_STATES = 1000;
const BATCH_SIZE_CITIES = 2500;

async function executeBatch(conn, query, values, entityName, batchNum) {
    if (values.length === 0) return;
    try {
        await conn.beginTransaction();
        await conn.query(query, [values]);
        await conn.commit();
        // console.log(`Committed ${entityName} batch ${batchNum} (${values.length} rows)`);
    } catch (err) {
        await conn.rollback();
        console.error(`Error in ${entityName} batch ${batchNum}:`, err.message);
        throw err; // Stop execution on failure
    }
}

async function seedLocations() {
    let conn;
    try {
        console.log('Connecting to database...');
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        console.log(`Loading JSON from ${JSON_FILE_PATH}...`);
        const rawData = fs.readFileSync(JSON_FILE_PATH, 'utf8');
        const data = JSON.parse(rawData);
        console.log(`Successfully parsed JSON. Found ${data.length} countries.`);

        // --- 1. COUNTRIES ---
        console.log('\n--- Seeding Countries ---');
        let countryValues = [];
        let stateValues = [];
        let cityValues = [];

        for (const c of data) {
            countryValues.push([
                c.id, c.name, c.iso2, c.iso3, c.phonecode || null, 
                c.capital || null, c.currency || null, c.currency_name || null, 
                c.currency_symbol || null, c.region || null, c.subregion || null, 
                c.latitude || null, c.longitude || null, c.emoji || null
            ]);
        }

        const countryQuery = `
            INSERT INTO countries (
                id, name, iso2, iso3, phonecode, capital, currency, 
                currency_name, currency_symbol, region, subregion, 
                latitude, longitude, emoji
            ) VALUES ?
            ON DUPLICATE KEY UPDATE
                name = VALUES(name), iso2 = VALUES(iso2), iso3 = VALUES(iso3), 
                phonecode = VALUES(phonecode), capital = VALUES(capital), 
                currency = VALUES(currency), currency_name = VALUES(currency_name), 
                currency_symbol = VALUES(currency_symbol), region = VALUES(region), 
                subregion = VALUES(subregion), latitude = VALUES(latitude), 
                longitude = VALUES(longitude), emoji = VALUES(emoji),
                updated_at = CURRENT_TIMESTAMP
        `;
        
        await executeBatch(conn, countryQuery, countryValues, 'Countries', 1);
        console.log(`Inserted/Updated ${countryValues.length} Countries.`);
        // Free memory
        countryValues = null; 

        // --- 2. STATES ---
        console.log('\n--- Seeding States ---');
        for (const c of data) {
            if (c.states && Array.isArray(c.states)) {
                for (const s of c.states) {
                    stateValues.push([
                        s.id, c.id, s.name, s.iso3166_2 || s.state_code || '', 
                        s.latitude || null, s.longitude || null
                    ]);
                }
            }
        }

        const stateQuery = `
            INSERT INTO states (
                id, country_id, name, state_code, latitude, longitude
            ) VALUES ?
            ON DUPLICATE KEY UPDATE
                country_id = VALUES(country_id), name = VALUES(name), 
                state_code = VALUES(state_code), latitude = VALUES(latitude), 
                longitude = VALUES(longitude),
                updated_at = CURRENT_TIMESTAMP
        `;

        let stateBatches = 0;
        let processedStates = 0;
        for (let i = 0; i < stateValues.length; i += BATCH_SIZE_STATES) {
            const batch = stateValues.slice(i, i + BATCH_SIZE_STATES);
            await executeBatch(conn, stateQuery, batch, 'States', ++stateBatches);
            processedStates += batch.length;
            process.stdout.write(`\rInserted States: ${processedStates}/${stateValues.length}`);
        }
        console.log(); // newline
        // Free memory
        stateValues = null;

        // --- 3. CITIES ---
        console.log('\n--- Seeding Cities ---');
        for (const c of data) {
            if (c.states && Array.isArray(c.states)) {
                for (const s of c.states) {
                    if (s.cities && Array.isArray(s.cities)) {
                        for (const city of s.cities) {
                            cityValues.push([
                                city.id, c.id, s.id, city.name, 
                                city.latitude || null, city.longitude || null
                            ]);
                        }
                    }
                }
            }
        }

        const cityQuery = `
            INSERT INTO cities (
                id, country_id, state_id, name, latitude, longitude
            ) VALUES ?
            ON DUPLICATE KEY UPDATE
                country_id = VALUES(country_id), state_id = VALUES(state_id), 
                name = VALUES(name), latitude = VALUES(latitude), 
                longitude = VALUES(longitude),
                updated_at = CURRENT_TIMESTAMP
        `;

        let cityBatches = 0;
        let processedCities = 0;
        for (let i = 0; i < cityValues.length; i += BATCH_SIZE_CITIES) {
            const batch = cityValues.slice(i, i + BATCH_SIZE_CITIES);
            await executeBatch(conn, cityQuery, batch, 'Cities', ++cityBatches);
            processedCities += batch.length;
            process.stdout.write(`\rInserted Cities: ${processedCities}/${cityValues.length}`);
        }
        console.log(); // newline
        // Free memory
        cityValues = null;

        console.log('\n✅ Seeding complete!');

    } catch (err) {
        console.error('Fatal error during seeding:', err);
    } finally {
        if (conn) {
            await conn.end();
            console.log('Database connection closed.');
        }
    }
}

seedLocations();
