const tokenConfig = {
    secretKey: process.env.SECRET_KEY,
    jwtExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN// in hours;
}
export default tokenConfig;