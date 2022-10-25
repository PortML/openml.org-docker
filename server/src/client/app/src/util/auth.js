export const authAllowsFunction = (context) => {
    if (process.env.REACT_APP_AUTHNETICATION_REQUIRED === 'false') return true
    return context.loggedIn
}