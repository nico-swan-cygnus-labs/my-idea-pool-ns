const databaseConfig = {
	username: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	host: process.env.DB_HOST,
	db_name: process.env.DB_NAME,
	db_options: {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
		socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
		family: 4 // Use IPv4, skip trying IPv6
	}
}
export default databaseConfig;