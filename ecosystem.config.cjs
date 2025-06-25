module.exports = {
  apps: [
    {
      name: 'signnow-dev',
      script: 'npx',
      args: 'tsx src/server.ts',
      watch: false,
      env: {
        NODE_ENV: 'development'
      }
    }
  ]
}; 