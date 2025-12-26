module.exports = {
  apps: [
    {
      name: "api-gateway",
      cwd: "./Backend/api-gateway",
      script: "server.js"
    },
    {
      name: "auth-service",
      cwd: "./Backend/auth-service",
      script: "server.js"
    },
    {
      name: "menu-service",
      cwd: "./Backend/menu-service",
      script: "server.js"
    },
    {
      name: "order-service",
      cwd: "./Backend/order-service",
      script: "server.js"
    },
    {
      name: "user-service",
      cwd: "./Backend/user-service",
      script: "server.js"
    }
  ]
};
