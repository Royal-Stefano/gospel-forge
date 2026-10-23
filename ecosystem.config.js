module.exports = {
  apps: [
    {
      name: "gospel-forge",
      script: "server.js",
      cwd: "./.next/standalone",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
