export default {
    teamsite: "https://inft.kr",
    privacy: "https://inft.kr/privacy",
    invite: {
        production: "https://discord.com/api/oauth2/authorize?client_id=751339721782722570&permissions=0&scope=bot",
        development: "https://discord.com/api/oauth2/authorize?client_id=763957434636304445&permissions=0&scope=bot",
        test: ""
    },
    support: "https://discord.gg/7aFczQk",
    invite_with_redirect: {
        production: "https://discord.com/api/oauth2/authorize?client_id=751339721782722570&permissions=0&redirect_uri=https%3A%2F%2Faztra.xyz%2Fdashboard%2Fredirect&response_type=code&scope=bot%20identify",
        development: "https://discord.com/api/oauth2/authorize?client_id=763957434636304445&permissions=0&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fdashboard%2Fredirect&response_type=code&scope=identify%20bot",
        test: ""
    }
}
