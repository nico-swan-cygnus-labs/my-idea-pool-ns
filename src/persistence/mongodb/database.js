import MongoClient from 'mongodb';
import config from '../../../config/database.js';
import { Connection } from '../../services/errors/database.js';
class Database {

    constructor(app) {
        this._app = app;
        this._username = config.username;
        this._password = config.password;
        this._host = config.host;
        this._databaseName = config.db_name;
        this._connectionStr = `mongodb+srv://${this._username}:${this._password}@${this._host}/${this._databaseName}?retryWrites=true&w=majority`;
        this._options = config.db_options;
    }

    /**
     * Set host
     * @param {string} value
     */
    set host(value) {
        this._connectionStr = `mongodb+srv://${this._username}:${this._password}@${value}/${this._databaseName}?retryWrites=true&w=majority`;
        this._host = value;
    }

    /**
     * Get the database instance
     * @readonly
     * @memberof Database
     */
    get db() {
        return this._db;
    }

    /**
     * Establishes a connection to the database
     * @return {Database} The database instance
     * @memberof Database
     */
    connect() {
        return new Promise((resolve, reject) => {
            if (this.isConnected()) {
                resolve(this);
            } else {
                return MongoClient.connect(this._connectionStr, this._options, (error, client) => {
                    if (error) {
                        reject(new Connection(error));
                    } else {
                        this._client = client;
                        this._db = client.db(this._database);
                        this._app.emit('event:db-connected', this);
                        resolve(this);
                    }
                });
            }
        })
    }

    isConnected() {
        return !!this._client && !!this._client.topology && this._client.topology.isConnected()
    }

    /**
     * Close the database connection,  this should be done after each call
     * @return {void}@memberof Database
     */
    close() {
        this._client.close();
    }
};

export default Database;