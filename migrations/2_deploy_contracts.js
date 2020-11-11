// ERC20 Tokens
const RealFundTokenERC20 = artifacts.require('./RealFundTokenERC20');
const DaiToken = artifacts.require('./DaiToken');

// Balancer Pools and Factories
const BFactory = artifacts.require('BFactory');
const BalancerSafeMathMock = artifacts.require('BalancerSafeMathMock');

// Balancer Pools and Factories
const RealFundFactory = artifacts.require('RealFundFactory');
const RealFundSwap = artifacts.require('RealFundSwap');

async function doDeploy(deployer, network, accounts) {
    // 1. Deploy the RealFund ERC20 75.000 tokens
    await deployer.deploy(RealFundTokenERC20, web3.utils.toWei('200000'));
    console.log('RealFund Token deployed');

    // 2. Deploy the DaiToken (used to simulate 100.000.000 DAIs) 
    await deployer.deploy(DaiToken, web3.utils.toWei('100000000'));
    console.log('DAI Token deployed');

    // 3. If we are in a develpment environment, deploy the Balancer Factory Contract, otherwhise, use the address in the ethereum network
    if (network === 'development' || network === 'coverage') {
        await deployer.deploy(BFactory);
        await deployer.deploy(BalancerSafeMathMock);
        console.log('Balancer Factory deployed');
    }

    // 4. Deploy the RealFundProxy contract to create the balancer pool
    const REALFUND = await RealFundTokenERC20.deployed();
    const DAI = await DaiToken.deployed();

    const swapFee = web3.utils.toWei('0.03');
    const startWeights = [web3.utils.toWei('2'), web3.utils.toWei('38')]; // 50%/50%
    const startBalances = [web3.utils.toWei('1000'), web3.utils.toWei('1000')];
    const tokenAddresses = [DAI.address, REALFUND.address];

    await deployer.deploy(RealFundFactory);
    console.log('RealFund Factory deployed');
    const realFundFactory = await RealFundFactory.deployed();

    let factory = '';
    if (network === 'development' || network === 'coverage') {
        const balancerFactory = await BFactory.deployed();
        factory = balancerFactory.address;
    } else if (network == 'kovan-fork' || network == 'kovan') {
        factory = web3.utils.toChecksumAddress('0x8f7F78080219d4066A8036ccD30D588B416a40DB');
    }

    console.log('Appoving both tokens to let RealFund factory to spend them');
    await REALFUND.approve(realFundFactory.address, web3.utils.toTwosComplement(-1));
    await DAI.approve(realFundFactory.address, web3.utils.toTwosComplement(-1));
    console.log('Approving finished');

    console.log('Creating Balancer Pool');
    const resultPool = await realFundFactory.createPool(
        factory,
        swapFee
    );

    const event = resultPool.logs[0].args;
    const poolAddress = event.pool;
    console.log('Balancer Pool created at address:', poolAddress);

    console.log('Adding BalancerFactory and Pool address to the RealFundToken whitelist');
    await REALFUND.addToWhitelist(poolAddress);
    await REALFUND.addToWhitelist(realFundFactory.address);
    await REALFUND.addToWhitelist(factory);

    if (network == 'kovan-fork' || network == 'kovan') {
        // Direcciones de Josep y Jose Ramon
        await REALFUND.addToWhitelist(web3.utils.toChecksumAddress('0x65ef5b37369f98701f4EC29258d90489623EC239'));
        await REALFUND.addToWhitelist(web3.utils.toChecksumAddress('0xa9aCC2b929B92a86084CCB115b78A6D627309788'));

        // Add Exchange Proxy to whitelist
    }

    console.log('addresses whitelisted');

    console.log('Adding tokens to the pool');
    await realFundFactory.addTokensToPool(
        poolAddress,
        tokenAddresses,
        startBalances,
        startWeights
    );

    console.log('TokensAdded');

    console.log('Deploying swapper');
    await deployer.deploy(RealFundSwap, poolAddress, REALFUND.address, DAI.address);
    const swap = await RealFundSwap.deployed();
    const price = await swap.getSpotPrice();
    // console.log('Swapper Price', price.toString());
    //await swap.swapRealfundForDai(web3.utils.toWei('1'));
}

module.exports = function(deployer, network, accounts) {
    deployer.then(async () => {
        await doDeploy(deployer, network, accounts);
    });
}
