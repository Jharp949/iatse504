const db = require('../config/mysql');

class User {
    constructor(firstName, lastName, username, password, email) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.password = password;
        this.email = email;
    }

    async save() {

        let sql = `
            INSERT INTO users(
                first_name,
                last_name,
                username,
                password,
                email
            )
            VALUES(
                '${this.firstName}',
                '${this.lastName}',
                '${this.username}',
                '${this.password}',
                '${this.email}'
            );
        `;

        return db.execute(sql).then(([result]) => {
            // Return the ID of the newly created user
            return result.insertId;
        });
    }

    static findAll() {
        let sql = "SELECT * FROM users;";

        return db.execute(sql);
    }

    static findById(id) {
        let sql = `SELECT * FROM users WHERE id = ${id}`;

        return db.execute(sql);
    }

    static findUsername(username) {
        let sql = `SELECT * FROM users WHERE username = '${username}';`;

        return db.execute(sql);
    }

    static findByEmail(email) {
        let sql = `SELECT * FROM users WHERE email = '${email}';`;

        return db.execute(sql);
    }

    static confirmUser(userId, fields) {
        // Check if is_allowed is already 1
        let checkSql = `
        SELECT is_allowed
        FROM users
        WHERE id = ${userId};
        `;

        return db.execute(checkSql).then(([rows]) => {
            if (rows.length > 0 && rows[0].is_allowed == 1) {
                // If is_allowed is already 1, throw an error
                throw new Error('The user is already confirmed.');
            } else {
                // If is_allowed is not 1, execute the UPDATE query
                let updateSql = `
                    UPDATE users
                    SET is_allowed = ${fields}
                    WHERE id = ${userId};
                `;

                return db.execute(updateSql);
            }
        });
    }

    static async updatePassword(email, token) {
        let sql = `
            UPDATE users
            SET reset_token = '${token}'
            WHERE email = '${email}';
        `;

        return db.execute(sql);
    }
}

module.exports = User;