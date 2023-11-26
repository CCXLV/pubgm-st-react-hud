import sqlite3 from 'sqlite3';
import teamData from '../team_data/config.json';

const db = new sqlite3.Database('./database/database.db');

db.serialize(() => {
    db.get('PRAGMA table_info(team_points)', (err, result) => {
        if (!err && result) {
            const statement2 = db.prepare('DROP TABLE team_points');
            statement2.run();
            statement2.finalize();

            console.log('Table was deleted.');
        }

        createTableAndInsertData();
    });
});

function createTableAndInsertData() {
    try {
        for (let i = 0; i < teamData.team_data.length; i++) {
            db.serialize(() => {
                const statement = db.prepare('CREATE TABLE IF NOT EXISTS team_points (id INTEGER PRIMARY KEY, team_id INTEGER, team_points INTEGER)');
                statement.run();
    
                const insertStatement = db.prepare('INSERT INTO team_points (team_id, team_points) VALUES (?, ?)');
                insertStatement.run(i + 1, 0);
                insertStatement.finalize();
            });
        }
        console.log('Table was created and data was inserted.');
    } catch {
        console.log('Something was happened. Check team data and config.json')
    }
};
