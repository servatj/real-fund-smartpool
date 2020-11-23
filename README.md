STEPS TO DEPLOY
1. Install nodejs (if not)
2. Install truffle (if not)
npm install -g truffle
3. Clone the project
git clone https://github.com/servatj/real-fund-smartpool
4. Download dependencies
npm install
5. Before deploy
    - Open folder migrations
    - Open the file 3_whitelist_contracts.js and replace the addresses by the balancer addresses in the environment we are using
5. Deploy in local (Ganache)
truffle migrate --reset
6. or Deploy in testnet (Kovan)
truffle migrate --reset --network kovan
7. To deploy & run tests in local environment
truffle test

WHAT IS DEPLOYED?
- First we deploy two ERC20 tokens, first the REAL FUND TOKEN with 75.000 units and second and only for testing the DAI Token (instead of using the mainnet DAI)
- Then, if we are in a local environment, we need to deploy the Balancer factory. If we are in testnet or mainnet, jump this step
- After that, we configure the pool settings (fees and balances for each token) and deploy the Balancer pool.
- Due the REAL FUND TOKEN uses a whitelist, we need to add to the whitelist all the balancer addresses because the Token contract needs to interact with this addresses
- After all, the pool is ready to be used
